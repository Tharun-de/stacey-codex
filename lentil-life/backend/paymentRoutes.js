const express = require('express');
const router = express.Router();
const paymentService = require('./paymentService');
const emailService = require('./emailService');
const { updateOrderStatus, getOrderById } = require('./orderUtils');

/**
 * GET /payment/config
 * Get payment configuration for frontend
 */
router.get('/config', async (req, res) => {
  try {
    const publishableKey = paymentService.getPublishableKey();
    
    res.json({
      success: true,
      config: {
        stripePublishableKey: publishableKey,
        supportedPaymentMethods: ['card', 'venmo', 'cash']
      }
    });
  } catch (error) {
    console.error('Error getting payment config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment configuration'
    });
  }
});

/**
 * POST /payment/create-intent
 * Create a payment intent for Stripe
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, orderId, customerInfo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    const metadata = {
      orderId,
      customerEmail: customerInfo?.email || '',
      customerName: customerInfo?.name || ''
    };

    const result = await paymentService.createPaymentIntent(amount, 'usd', metadata);

    if (result.success) {
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        amount: result.amount
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

/**
 * POST /payment/confirm
 * Confirm a payment and update order status
 */
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID and order ID are required'
      });
    }

    // Get payment intent details
    const paymentResult = await paymentService.getPaymentIntent(paymentIntentId);
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment intent'
      });
    }

    // Check if payment was successful
    if (paymentResult.paymentIntent.status === 'succeeded') {
      // Update order status to paid
      const orderUpdate = await updateOrderStatus(orderId, 'paid');
      
      if (orderUpdate) {
        // Get full order details for email
        const orderData = await getOrderById(orderId);
        
        if (orderData && orderData.customer) {
          // Send confirmation email
          await emailService.sendOrderStatusUpdate(
            orderData,
            orderData.customer,
            'paid'
          );
        }

        res.json({
          success: true,
          message: 'Payment confirmed and order updated',
          paymentStatus: paymentResult.paymentIntent.status,
          orderStatus: 'paid'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Payment confirmed but failed to update order'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not yet successful',
        paymentStatus: paymentResult.paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
});

/**
 * POST /payment/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(payload, sig);
    
    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Webhook signature verification failed'
      });
    }

    // Handle the event
    const result = await paymentService.handleWebhookEvent(event);
    
    if (result.success) {
      // Handle specific payment events
      switch (result.action) {
        case 'payment_succeeded':
          const paymentIntent = event.data.object;
          const orderId = paymentIntent.metadata.orderId;
          
          if (orderId) {
            // Update order status
            await updateOrderStatus(orderId, 'paid');
            
            // Send confirmation email
            const orderData = await getOrderById(orderId);
            if (orderData && orderData.customer) {
              await emailService.sendOrderStatusUpdate(
                orderData,
                orderData.customer,
                'paid'
              );
            }
          }
          break;
          
        case 'payment_failed':
          const failedPayment = event.data.object;
          const failedOrderId = failedPayment.metadata.orderId;
          
          if (failedOrderId) {
            await updateOrderStatus(failedOrderId, 'payment_failed');
          }
          break;
      }

      res.json({ received: true, action: result.action });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

/**
 * POST /payment/refund
 * Create a refund for a payment
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    const result = await paymentService.createRefund(paymentIntentId, amount);

    if (result.success) {
      // Update order status if orderId provided
      if (orderId) {
        await updateOrderStatus(orderId, 'refunded');
        
        // Send refund notification email
        const orderData = await getOrderById(orderId);
        if (orderData && orderData.customer) {
          await emailService.sendOrderStatusUpdate(
            orderData,
            orderData.customer,
            'refunded'
          );
        }
      }

      res.json({
        success: true,
        refund: result.refund,
        message: 'Refund processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
});

/**
 * GET /payment/status/:paymentIntentId
 * Get payment status
 */
router.get('/status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const result = await paymentService.getPaymentIntent(paymentIntentId);

    if (result.success) {
      res.json({
        success: true,
        payment: {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
          amount: result.paymentIntent.amount,
          metadata: result.paymentIntent.metadata
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
});

/**
 * POST /payment/calculate-fee
 * Calculate processing fee for an amount
 */
router.post('/calculate-fee', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const fee = paymentService.calculateProcessingFee(amount);
    const total = amount + fee;

    res.json({
      success: true,
      calculation: {
        subtotal: amount,
        processingFee: fee,
        total: total
      }
    });
  } catch (error) {
    console.error('Error calculating fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate processing fee'
    });
  }
});

module.exports = router; 