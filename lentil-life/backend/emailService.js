const nodemailer = require('nodemailer');
const config = require('./config');

// Create email transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function initializeTransporter() {
  try {
    transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

    console.log('Email transporter initialized successfully');
  } catch (error) {
    console.error('Error initializing email transporter:', error);
  }
}

/**
 * Send order confirmation email
 * @param {Object} orderData - Order details
 * @param {Object} customer - Customer information
 * @returns {Promise<Object>} Email send result
 */
async function sendOrderConfirmation(orderData, customer) {
  try {
    if (!transporter) {
      initializeTransporter();
    }

    const itemsList = orderData.items
      .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background-color: #7D9D74; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
          .total { font-weight: bold; font-size: 18px; color: #7D9D74; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌱 Order Confirmation - Lentil Life</h1>
        </div>
        
        <div class="content">
          <h2>Thank you for your order, ${customer.name}!</h2>
          <p>Your order has been successfully placed and is being prepared.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.created_at || Date.now()).toLocaleDateString()}</p>
            
            <h4>Items Ordered:</h4>
            <pre style="white-space: pre-wrap;">${itemsList}</pre>
            
            ${orderData.special_instructions ? `<p><strong>Special Instructions:</strong> ${orderData.special_instructions}</p>` : ''}
            
            <div class="total">
              <p>Total: $${orderData.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="order-details">
            <h3>Pickup Information</h3>
            <p><strong>Date:</strong> ${orderData.pickup.date}</p>
            <p><strong>Time:</strong> ${orderData.pickup.time}</p>
            <p><strong>Location:</strong> Lentil Life Kitchen</p>
          </div>
          
          ${orderData.status === 'pending_payment' ? `
          <div class="order-details" style="background-color: #fff3cd; border: 1px solid #ffeaa7;">
            <h3>⚠️ Payment Required</h3>
            <p>Your order is currently pending payment. Please complete your payment to confirm your order.</p>
          </div>
          ` : ''}
          
          <p>We'll send you another email when your order is ready for pickup!</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Lentil Life!</p>
          <p>Questions? Reply to this email or contact us directly.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: config.email.from,
      to: customer.email,
      subject: `Order Confirmation #${orderData.id} - Lentil Life`,
      html: emailHTML,
      text: `
        Order Confirmation - Lentil Life
        
        Thank you for your order, ${customer.name}!
        
        Order ID: ${orderData.id}
        Order Date: ${new Date(orderData.created_at || Date.now()).toLocaleDateString()}
        
        Items:
        ${itemsList}
        
        ${orderData.special_instructions ? `Special Instructions: ${orderData.special_instructions}` : ''}
        
        Total: $${orderData.total.toFixed(2)}
        
        Pickup: ${orderData.pickup.date} at ${orderData.pickup.time}
        
        Thank you for choosing Lentil Life!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Order confirmation email sent successfully'
    };

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send order status update email
 * @param {Object} orderData - Order details
 * @param {Object} customer - Customer information
 * @param {string} newStatus - New order status
 * @returns {Promise<Object>} Email send result
 */
async function sendOrderStatusUpdate(orderData, customer, newStatus) {
  try {
    if (!transporter) {
      initializeTransporter();
    }

    let statusMessage = '';
    let statusColor = '#7D9D74';
    
    switch (newStatus.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        statusMessage = 'Your payment has been confirmed and your order is now being prepared!';
        statusColor = '#28a745';
        break;
      case 'preparing':
      case 'processing':
        statusMessage = 'Your order is currently being prepared by our kitchen team.';
        statusColor = '#ffc107';
        break;
      case 'ready':
      case 'ready_for_pickup':
        statusMessage = 'Great news! Your order is ready for pickup.';
        statusColor = '#28a745';
        break;
      case 'completed':
        statusMessage = 'Your order has been completed. Thank you for choosing Lentil Life!';
        statusColor = '#28a745';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled. If you have any questions, please contact us.';
        statusColor = '#dc3545';
        break;
      default:
        statusMessage = `Your order status has been updated to: ${newStatus}`;
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background-color: #7D9D74; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .status-update { background-color: ${statusColor}; color: white; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌱 Order Update - Lentil Life</h1>
        </div>
        
        <div class="content">
          <h2>Order Status Update</h2>
          
          <div class="status-update">
            <h3>${statusMessage}</h3>
          </div>
          
          <div class="order-details">
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Status:</strong> ${newStatus}</p>
            ${orderData.pickup ? `
            <p><strong>Pickup Date:</strong> ${orderData.pickup.date}</p>
            <p><strong>Pickup Time:</strong> ${orderData.pickup.time}</p>
            ` : ''}
          </div>
          
          ${newStatus.toLowerCase() === 'ready' || newStatus.toLowerCase() === 'ready_for_pickup' ? `
          <div class="order-details" style="background-color: #d4edda; border: 1px solid #c3e6cb;">
            <h3>📍 Pickup Instructions</h3>
            <p>Your order is ready! Please come to Lentil Life Kitchen during our operating hours.</p>
            <p>Don't forget to bring your order confirmation!</p>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Lentil Life!</p>
          <p>Questions? Reply to this email or contact us directly.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: config.email.from,
      to: customer.email,
      subject: `Order Update #${orderData.id} - ${newStatus} - Lentil Life`,
      html: emailHTML,
      text: `
        Order Update - Lentil Life
        
        ${statusMessage}
        
        Order ID: ${orderData.id}
        Status: ${newStatus}
        ${orderData.pickup ? `Pickup: ${orderData.pickup.date} at ${orderData.pickup.time}` : ''}
        
        Thank you for choosing Lentil Life!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Status update email sent successfully'
    };

  } catch (error) {
    console.error('Error sending status update email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send pickup reminder email
 * @param {Object} orderData - Order details
 * @param {Object} customer - Customer information
 * @returns {Promise<Object>} Email send result
 */
async function sendPickupReminder(orderData, customer) {
  try {
    if (!transporter) {
      initializeTransporter();
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background-color: #7D9D74; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .reminder { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Pickup Reminder - Lentil Life</h1>
        </div>
        
        <div class="content">
          <h2>Don't Forget Your Order!</h2>
          
          <div class="reminder">
            <h3>⏰ Your pickup time is approaching</h3>
            <p>This is a friendly reminder that your order is ready for pickup!</p>
          </div>
          
          <div class="order-details">
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Pickup Date:</strong> ${orderData.pickup.date}</p>
            <p><strong>Pickup Time:</strong> ${orderData.pickup.time}</p>
            <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
          </div>
          
          <p>Please bring this confirmation email or your order ID when you arrive.</p>
          <p>We look forward to serving you!</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Lentil Life!</p>
          <p>Questions? Reply to this email or contact us directly.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: config.email.from,
      to: customer.email,
      subject: `Pickup Reminder #${orderData.id} - Lentil Life`,
      html: emailHTML,
      text: `
        Pickup Reminder - Lentil Life
        
        Don't forget your order!
        
        Order ID: ${orderData.id}
        Pickup: ${orderData.pickup.date} at ${orderData.pickup.time}
        Total: $${orderData.total.toFixed(2)}
        
        Please bring this confirmation when you arrive.
        
        Thank you for choosing Lentil Life!
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Pickup reminder email sent successfully'
    };

  } catch (error) {
    console.error('Error sending pickup reminder email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
async function testEmailConfiguration() {
  try {
    if (!transporter) {
      initializeTransporter();
    }

    await transporter.verify();
    
    return {
      success: true,
      message: 'Email configuration is valid'
    };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Initialize transporter on module load
initializeTransporter();

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPickupReminder,
  testEmailConfiguration
}; 