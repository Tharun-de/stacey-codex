const supabase = require('./supabaseClient');

/**
 * Get points configuration from database
 * @returns {Promise<Object>} Points configuration
 */
async function getPointsConfig() {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('points_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    
    // Return default config if none found
    return data || {
      points_per_dollar: 1.00,
      min_order_for_points: 0.00,
      signup_bonus_points: 0,
      referral_bonus_points: 0,
      points_expiry_months: null
    };
  } catch (error) {
    console.error('[Points] Error getting points config:', error);
    // Return default config on error
    return {
      points_per_dollar: 1.00,
      min_order_for_points: 0.00,
      signup_bonus_points: 0,
      referral_bonus_points: 0,
      points_expiry_months: null
    };
  }
}

/**
 * Calculate points earned for an order
 * @param {number} orderAmount - Order total amount
 * @returns {Promise<number>} Points to be earned
 */
async function calculatePointsForOrder(orderAmount) {
  try {
    const config = await getPointsConfig();
    
    // Check if order meets minimum requirement
    if (orderAmount < config.min_order_for_points) {
      return 0;
    }
    
    // Calculate points (rounded down to nearest whole number)
    const points = Math.floor(orderAmount * config.points_per_dollar);
    return Math.max(0, points);
  } catch (error) {
    console.error('[Points] Error calculating points:', error);
    return 0;
  }
}

/**
 * Get user's current points balance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User points data
 */
async function getUserPoints(userId) {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If user doesn't have points record yet, return default
      if (error.code === 'PGRST116') {
        return {
          points_balance: 0,
          lifetime_points_earned: 0,
          user_id: userId
        };
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[Points] Error getting user points:', error);
    throw error;
  }
}

/**
 * Award points to a user for an order
 * @param {string} userId - User ID
 * @param {string} orderId - Order ID
 * @param {number} orderAmount - Order total amount
 * @returns {Promise<Object>} Transaction details
 */
async function awardPointsForOrder(userId, orderId, orderAmount) {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const pointsEarned = await calculatePointsForOrder(orderAmount);
    
    if (pointsEarned <= 0) {
      return {
        success: false,
        message: 'Order does not qualify for points',
        points_earned: 0
      };
    }
    
    const config = await getPointsConfig();
    
    // Calculate expiry date if points expire
    let expiresAt = null;
    if (config.points_expiry_months) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + config.points_expiry_months);
      expiresAt = expiryDate.toISOString();
    }
    
    // Create points transaction
    const { data, error } = await supabase
      .from('points_transactions')
      .insert([{
        user_id: userId,
        order_id: orderId,
        transaction_type: 'earned',
        points_amount: pointsEarned,
        points_rate: config.points_per_dollar,
        order_amount: orderAmount,
        description: `Points earned from order ${orderId}`,
        expires_at: expiresAt
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
      success: true,
      points_earned: pointsEarned,
      transaction: data,
      points_rate: config.points_per_dollar
    };
  } catch (error) {
    console.error('[Points] Error awarding points:', error);
    throw error;
  }
}

/**
 * Spend points for a user
 * @param {string} userId - User ID
 * @param {number} pointsToSpend - Points to spend
 * @param {string} orderId - Order ID (optional)
 * @param {string} description - Description of spending
 * @returns {Promise<Object>} Transaction details
 */
async function spendUserPoints(userId, pointsToSpend, orderId = null, description = 'Points spent') {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    // Check if user has enough points
    const userPoints = await getUserPoints(userId);
    
    if (userPoints.points_balance < pointsToSpend) {
      return {
        success: false,
        message: 'Insufficient points balance',
        current_balance: userPoints.points_balance,
        requested_amount: pointsToSpend
      };
    }
    
    // Create negative points transaction
    const { data, error } = await supabase
      .from('points_transactions')
      .insert([{
        user_id: userId,
        order_id: orderId,
        transaction_type: 'spent',
        points_amount: -pointsToSpend, // Negative for spending
        description: description
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
      success: true,
      points_spent: pointsToSpend,
      transaction: data,
      new_balance: userPoints.points_balance - pointsToSpend
    };
  } catch (error) {
    console.error('[Points] Error spending points:', error);
    throw error;
  }
}

/**
 * Get user's points transaction history
 * @param {string} userId - User ID
 * @param {number} limit - Number of transactions to return (default: 50)
 * @returns {Promise<Array>} Array of transactions
 */
async function getUserPointsHistory(userId, limit = 50) {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('[Points] Error getting user points history:', error);
    throw error;
  }
}

/**
 * Refund points for a cancelled/refunded order
 * @param {string} userId - User ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Refund details
 */
async function refundPointsForOrder(userId, orderId) {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    // Find the original points transaction for this order
    const { data: originalTransaction, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('order_id', orderId)
      .eq('transaction_type', 'earned')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: 'No points found for this order to refund'
        };
      }
      throw error;
    }
    
    // Create refund transaction (negative to deduct the points)
    const { data: refundTransaction, error: refundError } = await supabase
      .from('points_transactions')
      .insert([{
        user_id: userId,
        order_id: orderId,
        transaction_type: 'refunded',
        points_amount: -originalTransaction.points_amount, // Negative to deduct
        description: `Points refunded for cancelled order ${orderId}`
      }])
      .select()
      .single();

    if (refundError) throw refundError;
    
    return {
      success: true,
      points_refunded: originalTransaction.points_amount,
      transaction: refundTransaction
    };
  } catch (error) {
    console.error('[Points] Error refunding points:', error);
    throw error;
  }
}

/**
 * Update points configuration
 * @param {Object} config - New configuration
 * @returns {Promise<Object>} Updated configuration
 */
async function updatePointsConfig(config) {
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('points_config')
      .update(config)
      .eq('is_active', true)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('[Points] Error updating points config:', error);
    throw error;
  }
}

module.exports = {
  getPointsConfig,
  calculatePointsForOrder,
  getUserPoints,
  awardPointsForOrder,
  spendUserPoints,
  getUserPointsHistory,
  refundPointsForOrder,
  updatePointsConfig
}; 