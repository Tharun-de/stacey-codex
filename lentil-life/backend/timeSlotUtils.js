const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Read time slot data from JSON file
 * @returns {Promise<Object>} Time slot data
 */
async function readTimeSlotData() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'timeSlots.json');
    
    // If file doesn't exist, create it with default time slots
    if (!fs.existsSync(filePath)) {
      const defaultTimeSlots = {
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        timeSlots: [
          { id: uuidv4(), startTime: "09:00", endTime: "10:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "10:00", endTime: "11:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "11:00", endTime: "12:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "12:00", endTime: "13:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "13:00", endTime: "14:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "14:00", endTime: "15:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "15:00", endTime: "16:00", maxOrders: 5 },
          { id: uuidv4(), startTime: "16:00", endTime: "17:00", maxOrders: 5 }
        ],
        leadTime: 1, // days in advance required for ordering
        maxAdvanceBookingDays: 14 // maximum days in advance that orders can be placed
      };
      fs.writeFileSync(filePath, JSON.stringify(defaultTimeSlots, null, 2));
      return defaultTimeSlots;
    }
    
    // Read and parse file
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading time slot data:', error);
    // Return default time slot data on error
    return {
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      timeSlots: [],
      leadTime: 1,
      maxAdvanceBookingDays: 14
    };
  }
}

/**
 * Write time slot data to JSON file
 * @param {Object} timeSlotData - Time slot data to write
 * @returns {Promise<boolean>} Success status
 */
async function writeTimeSlotData(timeSlotData) {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'timeSlots.json');
    
    // Write data to file
    fs.writeFileSync(filePath, JSON.stringify(timeSlotData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing time slot data:', error);
    throw error;
  }
}

/**
 * Get all time slots
 * @returns {Promise<Object>} Time slot configuration
 */
async function getTimeSlotConfig() {
  try {
    return await readTimeSlotData();
  } catch (error) {
    console.error('Error getting time slot config:', error);
    throw error;
  }
}

/**
 * Update time slot configuration
 * @param {Object} updatedConfig - Updated time slot configuration
 * @returns {Promise<Object>} Updated configuration
 */
async function updateTimeSlotConfig(updatedConfig) {
  try {
    await writeTimeSlotData(updatedConfig);
    return updatedConfig;
  } catch (error) {
    console.error('Error updating time slot config:', error);
    throw error;
  }
}

/**
 * Add a new time slot
 * @param {Object} timeSlot - New time slot to add
 * @returns {Promise<Object>} Updated time slot configuration
 */
async function addTimeSlot(timeSlot) {
  try {
    const timeSlotData = await readTimeSlotData();
    
    // Add ID if not provided
    if (!timeSlot.id) {
      timeSlot.id = uuidv4();
    }
    
    // Add the new time slot
    timeSlotData.timeSlots.push(timeSlot);
    
    // Sort time slots by start time
    timeSlotData.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Save updated data
    await writeTimeSlotData(timeSlotData);
    
    return timeSlotData;
  } catch (error) {
    console.error('Error adding time slot:', error);
    throw error;
  }
}

/**
 * Update a time slot
 * @param {string} id - Time slot ID
 * @param {Object} updatedTimeSlot - Updated time slot data
 * @returns {Promise<Object>} Updated time slot configuration
 */
async function updateTimeSlot(id, updatedTimeSlot) {
  try {
    const timeSlotData = await readTimeSlotData();
    
    // Find time slot index
    const timeSlotIndex = timeSlotData.timeSlots.findIndex(slot => slot.id === id);
    
    if (timeSlotIndex === -1) {
      throw new Error(`Time slot with ID ${id} not found`);
    }
    
    // Update time slot
    timeSlotData.timeSlots[timeSlotIndex] = {
      ...timeSlotData.timeSlots[timeSlotIndex],
      ...updatedTimeSlot,
      id // Ensure ID is preserved
    };
    
    // Sort time slots by start time
    timeSlotData.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Save updated data
    await writeTimeSlotData(timeSlotData);
    
    return timeSlotData;
  } catch (error) {
    console.error(`Error updating time slot with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a time slot
 * @param {string} id - Time slot ID
 * @returns {Promise<Object>} Updated time slot configuration
 */
async function deleteTimeSlot(id) {
  try {
    const timeSlotData = await readTimeSlotData();
    
    // Filter out the time slot to delete
    timeSlotData.timeSlots = timeSlotData.timeSlots.filter(slot => slot.id !== id);
    
    // Save updated data
    await writeTimeSlotData(timeSlotData);
    
    return timeSlotData;
  } catch (error) {
    console.error(`Error deleting time slot with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get available time slots for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Available time slots
 */
async function getAvailableTimeSlots(date) {
  try {
    const timeSlotData = await readTimeSlotData();
    const orderData = await require('./orderUtils').readOrderData();
    
    // Get day of week from date
    const dateObj = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    
    // Check if day is available
    if (!timeSlotData.availableDays.includes(dayOfWeek)) {
      return [];
    }
    
    // Get orders for the specified date
    const dateOrders = orderData.orders.filter(order => order.pickup.date === date);
    
    // Map order counts per time slot
    const orderCountsPerSlot = {};
    dateOrders.forEach(order => {
      const time = order.pickup.time;
      orderCountsPerSlot[time] = (orderCountsPerSlot[time] || 0) + 1;
    });
    
    // Filter available time slots
    const availableSlots = timeSlotData.timeSlots.map(slot => {
      const orderCount = orderCountsPerSlot[slot.startTime] || 0;
      const availableCount = slot.maxOrders - orderCount;
      
      return {
        ...slot,
        availableCount,
        isAvailable: availableCount > 0
      };
    });
    
    return availableSlots;
  } catch (error) {
    console.error(`Error getting available time slots for date ${date}:`, error);
    throw error;
  }
}

module.exports = {
  getTimeSlotConfig,
  updateTimeSlotConfig,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots
}; 