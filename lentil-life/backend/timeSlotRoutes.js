const express = require('express');
const router = express.Router();
const {
  getTimeSlotConfig,
  updateTimeSlotConfig,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots
} = require('./timeSlotUtils');

/**
 * GET /time-slots/config
 * Get time slot configuration
 */
router.get('/config', async (req, res) => {
  try {
    const config = await getTimeSlotConfig();
    res.json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('Error getting time slot config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get time slot configuration'
    });
  }
});

/**
 * PUT /time-slots/config
 * Update time slot configuration
 */
router.put('/config', async (req, res) => {
  try {
    const { availableDays, leadTime, maxAdvanceBookingDays } = req.body;
    
    const updatedConfig = await updateTimeSlotConfig({
      availableDays,
      leadTime,
      maxAdvanceBookingDays
    });

    res.json({
      success: true,
      config: updatedConfig
    });
  } catch (error) {
    console.error('Error updating time slot config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update time slot configuration'
    });
  }
});

/**
 * GET /time-slots
 * Get available time slots for a specific date
 */
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }

    const availableSlots = await getAvailableTimeSlots(date);
    
    res.json({
      success: true,
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error getting available time slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available time slots'
    });
  }
});

/**
 * POST /time-slots
 * Add a new time slot
 */
router.post('/', async (req, res) => {
  try {
    const { startTime, endTime, maxOrders } = req.body;

    if (!startTime || !endTime || !maxOrders) {
      return res.status(400).json({
        success: false,
        error: 'startTime, endTime, and maxOrders are required'
      });
    }

    const newSlot = await addTimeSlot({
      startTime,
      endTime,
      maxOrders: parseInt(maxOrders)
    });

    res.status(201).json({
      success: true,
      slot: newSlot
    });
  } catch (error) {
    console.error('Error adding time slot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add time slot'
    });
  }
});

/**
 * PUT /time-slots/:id
 * Update a time slot
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, maxOrders } = req.body;

    const updatedSlot = await updateTimeSlot(id, {
      startTime,
      endTime,
      maxOrders: maxOrders ? parseInt(maxOrders) : undefined
    });

    if (!updatedSlot) {
      return res.status(404).json({
        success: false,
        error: 'Time slot not found'
      });
    }

    res.json({
      success: true,
      slot: updatedSlot
    });
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update time slot'
    });
  }
});

/**
 * DELETE /time-slots/:id
 * Delete a time slot
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteTimeSlot(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Time slot not found'
      });
    }

    res.json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete time slot'
    });
  }
});

module.exports = router; 