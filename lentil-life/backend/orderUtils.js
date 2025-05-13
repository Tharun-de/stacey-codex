const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Read order data from JSON file
 * @returns {Promise<Object>} Order data
 */
async function readOrderData() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'orders.json');
    
    // If file doesn't exist, create it with empty order list
    if (!fs.existsSync(filePath)) {
      const emptyOrderData = { orders: [] };
      fs.writeFileSync(filePath, JSON.stringify(emptyOrderData, null, 2));
      return emptyOrderData;
    }
    
    // Read and parse file
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading order data:', error);
    // Return empty order data on error
    return { orders: [] };
  }
}

/**
 * Write order data to JSON file
 * @param {Object} orderData - Order data to write
 * @returns {Promise<boolean>} Success status
 */
async function writeOrderData(orderData) {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'orders.json');
    
    // Write data to file
    fs.writeFileSync(filePath, JSON.stringify(orderData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing order data:', error);
    throw error;
  }
}

/**
 * Get all orders
 * @returns {Promise<Array>} All orders
 */
async function getAllOrders() {
  try {
    const orderData = await readOrderData();
    return orderData.orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}

/**
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object|null>} Order object or null if not found
 */
async function getOrderById(id) {
  try {
    const orderData = await readOrderData();
    return orderData.orders.find(order => order.id === id) || null;
  } catch (error) {
    console.error(`Error getting order with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new order
 * @param {Object} orderDetails - Order details
 * @returns {Promise<Object>} Created order
 */
async function createOrder(orderDetails) {
  try {
    const orderData = await readOrderData();
    
    // Generate unique order ID with ORD prefix
    const orderId = `ORD-${Date.now().toString().substring(7)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create new order with timestamp
    const newOrder = {
      id: orderId,
      ...orderDetails,
      date: new Date().toISOString(),
      status: orderDetails.orderStatus || orderDetails.status || 'pending'
    };
    
    // Add to orders array
    orderData.orders.push(newOrder);
    
    // Save to file
    await writeOrderData(orderData);
    
    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} Updated order or null if not found
 */
async function updateOrderStatus(id, status) {
  try {
    const orderData = await readOrderData();
    
    // Find order index
    const orderIndex = orderData.orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return null; // Order not found
    }
    
    // Update status
    orderData.orders[orderIndex].status = status;
    
    // Save to file
    await writeOrderData(orderData);
    
    return orderData.orders[orderIndex];
  } catch (error) {
    console.error(`Error updating status for order ${id}:`, error);
    throw error;
  }
}

module.exports = {
  readOrderData,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
}; 