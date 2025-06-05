const express = require('express');
const router = express.Router();
const {
  getPointsConfig,
  calculatePointsForOrder,
  getUserPoints,
  awardPointsForOrder,
  spendUserPoints,
  getUserPointsHistory,
  refundPointsForOrder,
  updatePointsConfig
} = require('./pointsUtils');

/**
 * GET /points/config
 * Get current points system configuration
 */
router.get('/config', async (req, res) => {
  try {
    const config = await getPointsConfig();
    res.json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('Error getting points config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get points configuration'
    });
  }
});

/**
 * PUT /points/config
 * Update points system configuration (admin only)
 */
router.put('/config', async (req, res) => {
  try {
    const { points_per_dollar, min_order_for_points, points_expiry_months, signup_bonus_points } = req.body;
    
    const updatedConfig = await updatePointsConfig({
      points_per_dollar,
      min_order_for_points,
      points_expiry_months,
      signup_bonus_points
    });

    res.json({
      success: true,
      config: updatedConfig
    });
  } catch (error) {
    console.error('Error updating points config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update points configuration'
    });
  }
});

/**
 * GET /points/calculate
 * Calculate points for a given order amount
 */
router.get('/calculate', async (req, res) => {
  try {
    const { amount } = req.query;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount parameter is required'
      });
    }

    const points = await calculatePointsForOrder(parseFloat(amount));
    const config = await getPointsConfig();
    
    res.json({
      success: true,
      order_amount: parseFloat(amount),
      points_earned: points,
      points_rate: config.points_per_dollar
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate points'
    });
  }
});

/**
 * GET /points/user/:userId
 * Get user's current points balance and summary
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const userPoints = await getUserPoints(userId);
    
    res.json({
      success: true,
      user_points: userPoints
    });
  } catch (error) {
    console.error('Error getting user points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user points'
    });
  }
});

/**
 * GET /points/user/:userId/history
 * Get user's points transaction history
 */
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const history = await getUserPointsHistory(userId, limit ? parseInt(limit) : 50);
    
    res.json({
      success: true,
      transactions: history
    });
  } catch (error) {
    console.error('Error getting user points history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get points history'
    });
  }
});

/**
 * POST /points/award
 * Award points to a user for an order
 */
router.post('/award', async (req, res) => {
  try {
    const { userId, orderId, orderAmount } = req.body;
    
    if (!userId || !orderId || !orderAmount) {
      return res.status(400).json({
        success: false,
        error: 'userId, orderId, and orderAmount are required'
      });
    }

    const result = await awardPointsForOrder(userId, orderId, parseFloat(orderAmount));
    
    if (result.success) {
      res.json({
        success: true,
        message: `Awarded ${result.points_earned} points`,
        points_earned: result.points_earned,
        points_rate: result.points_rate,
        transaction: result.transaction
      });
    } else {
      res.json({
        success: false,
        message: result.message,
        points_earned: 0
      });
    }
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award points'
    });
  }
});

/**
 * POST /points/spend
 * Spend user's points
 */
router.post('/spend', async (req, res) => {
  try {
    const { userId, pointsToSpend, orderId, description } = req.body;
    
    if (!userId || !pointsToSpend || pointsToSpend <= 0) {
      return res.status(400).json({
        success: false,
        error: 'userId and valid pointsToSpend are required'
      });
    }

    const result = await spendUserPoints(userId, parseInt(pointsToSpend), orderId, description);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Spent ${result.points_spent} points`,
        points_spent: result.points_spent,
        new_balance: result.new_balance,
        transaction: result.transaction
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        current_balance: result.current_balance,
        requested_amount: result.requested_amount
      });
    }
  } catch (error) {
    console.error('Error spending points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to spend points'
    });
  }
});

/**
 * POST /points/refund
 * Refund points for a cancelled order
 */
router.post('/refund', async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    
    if (!userId || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'userId and orderId are required'
      });
    }

    const result = await refundPointsForOrder(userId, orderId);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Refunded ${result.points_refunded} points`,
        points_refunded: result.points_refunded,
        transaction: result.transaction
      });
    } else {
      res.json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error refunding points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund points'
    });
  }
});

module.exports = router; 