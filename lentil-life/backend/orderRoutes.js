const express = require('express');
const router = express.Router();
const { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  deleteOrderById 
} = require('./orderUtils');
const emailService = require('./emailService');
const paymentService = require('./paymentService');
const { awardPointsForOrder, refundPointsForOrder, calculatePointsForOrder } = require('./pointsUtils');

/**
 * GET /orders
 * Get all orders (admin) or user's orders
 */
router.get('/', async (req, res) => {
  try {
    const orders = await getAllOrders();
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch orders' 
    });
  }
});

/**
 * POST /orders
 * Create a new order with payment processing, email notifications, and points calculation preview
 */
router.post('/', async (req, res) => {
  try {
    const { customer, pickup, items, specialInstructions, total, orderStatus, paymentMethod, userId } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ 
        success: false,
        error: 'Customer information (name, email, phone) is required' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Items are required' 
      });
    }

    if (!pickup || !pickup.date || !pickup.time) {
      return res.status(400).json({ 
        success: false,
        error: 'Pickup date and time are required' 
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid total amount is required' 
      });
    }

    // Calculate points that will be earned (for display purposes)
    let pointsToEarn = 0;
    try {
      pointsToEarn = await calculatePointsForOrder(total);
    } catch (pointsError) {
      console.error('Failed to calculate points:', pointsError);
      // Continue without points calculation
    }

    // Determine initial order status based on payment method
    let initialStatus = orderStatus || 'pending';
    if (paymentMethod === 'card') {
      initialStatus = 'pending_payment';
    } else if (paymentMethod === 'venmo') {
      initialStatus = 'Pending Venmo Payment';
    } else if (paymentMethod === 'cash') {
      initialStatus = 'Pending Cash Payment';
    }

    // Create order in database
    const orderData = {
      customer,
      items,
      pickup,
      total,
      status: initialStatus,
      specialInstructions: specialInstructions || null,
      user_id: userId || null // Add user ID for points tracking
    };

    const newOrder = await createOrder(orderData);

    if (!newOrder) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create order in database'
      });
    }

    // Send order confirmation email with points information
    try {
      await emailService.sendOrderConfirmation(newOrder, customer, { pointsToEarn });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    // For card payments, create payment intent
    let paymentIntent = null;
    if (paymentMethod === 'card') {
      try {
        const paymentResult = await paymentService.createPaymentIntent(total, 'usd', {
          orderId: newOrder.id,
          customerEmail: customer.email,
          customerName: customer.name,
          userId: userId
        });

        if (paymentResult.success) {
          paymentIntent = {
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntentId
          };
        }
      } catch (paymentError) {
        console.error('Failed to create payment intent:', paymentError);
        // Continue without payment intent - user can retry payment later
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder,
      paymentIntent: paymentIntent,
      pointsToEarn: pointsToEarn
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order' 
    });
  }
});

/**
 * GET /orders/:id
 * Get a specific order by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch order' 
    });
  }
});

/**
 * PUT /orders/:id/status
 * Update order status with email notification and points management
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Get current order data for email and points
    const currentOrder = await getOrderById(id);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const previousStatus = currentOrder.status;

    // Update order status
    const updatedOrder = await updateOrderStatus(id, status);

    if (!updatedOrder) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }

    let pointsResult = null;

    // Handle points awarding for completed orders
    if (status === 'completed' && previousStatus !== 'completed' && currentOrder.user_id) {
      try {
        pointsResult = await awardPointsForOrder(currentOrder.user_id, id, currentOrder.total);
        if (pointsResult.success) {
          console.log(`Awarded ${pointsResult.points_earned} points to user ${currentOrder.user_id} for order ${id}`);
        }
      } catch (pointsError) {
        console.error('Failed to award points for completed order:', pointsError);
        // Don't fail the status update if points fail
      }
    }

    // Handle points refunding for cancelled orders
    if (status === 'cancelled' && previousStatus === 'completed' && currentOrder.user_id) {
      try {
        const refundResult = await refundPointsForOrder(currentOrder.user_id, id);
        if (refundResult.success) {
          console.log(`Refunded ${refundResult.points_refunded} points for user ${currentOrder.user_id} for cancelled order ${id}`);
          pointsResult = refundResult;
        }
      } catch (pointsError) {
        console.error('Failed to refund points for cancelled order:', pointsError);
        // Don't fail the status update if points fail
      }
    }

    // Send status update email if customer info is available
    if (currentOrder.customer && currentOrder.customer.email) {
      try {
        await emailService.sendOrderStatusUpdate(updatedOrder, currentOrder.customer, status, pointsResult);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    const response = {
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    };

    // Include points information in response if available
    if (pointsResult && pointsResult.success) {
      response.points = pointsResult;
    }

    res.json(response);

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update order status' 
    });
  }
});

/**
 * DELETE /orders/:id
 * Delete an order
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteOrderById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or could not be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete order' 
    });
  }
});

/**
 * POST /orders/:id/reminder
 * Send pickup reminder email
 */
router.post('/:id/reminder', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (!order.customer || !order.customer.email) {
      return res.status(400).json({
        success: false,
        error: 'No customer email found for this order'
      });
    }

    const result = await emailService.sendPickupReminder(order, order.customer);

    if (result.success) {
      res.json({
        success: true,
        message: 'Pickup reminder sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send pickup reminder'
      });
    }

  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send pickup reminder' 
    });
  }
});

/**
 * GET /orders/:id/receipt
 * Get order receipt/invoice
 */
router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Calculate order details for receipt
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0; // Add tax calculation if needed
    const total = order.total;

    const receipt = {
      orderId: order.id,
      orderDate: order.created_at,
      customer: order.customer,
      items: order.items,
      pickup: order.pickup,
      specialInstructions: order.special_instructions,
      pricing: {
        subtotal: subtotal,
        tax: tax,
        total: total
      },
      status: order.status
    };

    res.json({
      success: true,
      receipt: receipt
    });

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate receipt' 
    });
  }
});

module.exports = router; 