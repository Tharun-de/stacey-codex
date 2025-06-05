const stripe = require('stripe');
const config = require('./config');

// Initialize Stripe with secret key
const stripeClient = stripe(config.stripe.secretKey);

/**
 * Create a payment intent for Stripe
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @param {Object} metadata - Additional metadata for the payment
 * @returns {Promise<Object>} Payment intent object
 */
async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent details
 */
async function getPaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata
      }
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Confirm a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Confirmation result
 */
async function confirmPaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId);
    
    return {
      success: true,
      status: paymentIntent.status,
      paymentIntent
    };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a refund for a payment
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amount - Amount to refund in cents (optional, defaults to full amount)
 * @returns {Promise<Object>} Refund result
 */
async function createRefund(paymentIntentId, amount = null) {
  try {
    const refundData = {
      payment_intent: paymentIntentId
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripeClient.refunds.create(refundData);
    
    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle Stripe webhook events
 * @param {Object} event - Stripe webhook event
 * @returns {Promise<Object>} Processing result
 */
async function handleWebhookEvent(event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        // Here you would update your order status to 'paid'
        return { success: true, action: 'payment_succeeded' };
        
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        // Here you would update your order status to 'payment_failed'
        return { success: true, action: 'payment_failed' };
        
      case 'payment_intent.canceled':
        console.log('Payment canceled:', event.data.object.id);
        // Here you would update your order status to 'canceled'
        return { success: true, action: 'payment_canceled' };
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, action: 'ignored' };
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify webhook signature
 * @param {string} payload - Request payload
 * @param {string} signature - Stripe signature header
 * @returns {Object|null} Verified event or null if invalid
 */
function verifyWebhookSignature(payload, signature) {
  try {
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Get publishable key for frontend
 * @returns {string} Stripe publishable key
 */
function getPublishableKey() {
  return config.stripe.publishableKey;
}

/**
 * Calculate processing fee (if you want to pass Stripe fees to customers)
 * @param {number} amount - Order amount in dollars
 * @returns {number} Processing fee in dollars
 */
function calculateProcessingFee(amount) {
  // Stripe fees: 2.9% + $0.30 per transaction
  const feePercentage = 0.029;
  const fixedFee = 0.30;
  return (amount * feePercentage) + fixedFee;
}

module.exports = {
  createPaymentIntent,
  getPaymentIntent,
  confirmPaymentIntent,
  createRefund,
  handleWebhookEvent,
  verifyWebhookSignature,
  getPublishableKey,
  calculateProcessingFee
}; 