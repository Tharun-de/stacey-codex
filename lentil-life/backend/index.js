const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processMenuExcel, updateMenuData } = require('./menuService');
const { 
  getAllMenuItems,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
  getAllCategories,
  syncMenuWithFrontend,
  backupData,
  restoreFromBackup
} = require('./jsonUtils');
const { v4: uuidv4 } = require('uuid');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} = require('./orderUtils');
const {
  getTimeSlotConfig,
  updateTimeSlotConfig,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots
} = require('./timeSlotUtils');
const {
  getPaymentSettings,
  updatePaymentSettings
} = require('./paymentSettingsUtils');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, 'menu-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept Excel files only
    if (
      file.mimetype === 'application/vnd.ms-excel' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'menu-image-' + uniqueSuffix + ext);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// API Routes

// Get all menu items
app.get('/api/menu/items', async (req, res) => {
  try {
    const items = await getAllMenuItems();
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error getting menu items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get menu items', 
      error: error.message 
    });
  }
});

// Get menu item by ID
app.get('/api/menu/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getMenuItemById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Menu item with ID ${id} not found`
      });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    console.error(`Error getting menu item with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get menu item', 
      error: error.message 
    });
  }
});

// Get menu items by category
app.get('/api/menu/categories/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const items = await getMenuItemsByCategory(category);
    
    res.json({ success: true, items });
  } catch (error) {
    console.error(`Error getting menu items in category ${req.params.category}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get menu items by category', 
      error: error.message 
    });
  }
});

// Get all categories
app.get('/api/menu/categories', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error getting menu categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get menu categories', 
      error: error.message 
    });
  }
});

// Add a new menu item
app.post('/api/menu/items', async (req, res) => {
  try {
    const newItem = req.body;
    
    // Basic validation
    if (!newItem.name || !newItem.price || !newItem.category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }
    
    // Ensure additionalImages is an array
    if (newItem.additionalImages && !Array.isArray(newItem.additionalImages)) {
      newItem.additionalImages = [];
    }
    
    const addedItem = await addMenuItem(newItem);
    
    // Sync with frontend
    await syncMenuWithFrontend();
    
    res.status(201).json({ 
      success: true, 
      message: 'Menu item added successfully',
      item: addedItem
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add menu item', 
      error: error.message 
    });
  }
});

// Update a menu item
app.put('/api/menu/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = req.body;
    
    // Basic validation
    if (!updatedItem.name || !updatedItem.price || !updatedItem.category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }
    
    // Ensure additionalImages is an array
    if (updatedItem.additionalImages && !Array.isArray(updatedItem.additionalImages)) {
      updatedItem.additionalImages = [];
    }
    
    const result = await updateMenuItem(id, updatedItem);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Menu item with ID ${id} not found`
      });
    }
    
    // Sync with frontend
    await syncMenuWithFrontend();
    
    res.json({ 
      success: true, 
      message: 'Menu item updated successfully',
      item: result
    });
  } catch (error) {
    console.error(`Error updating menu item with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update menu item', 
      error: error.message 
    });
  }
});

// Delete a menu item
app.delete('/api/menu/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMenuItem(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Menu item with ID ${id} not found`
      });
    }
    
    // Sync with frontend
    await syncMenuWithFrontend();
    
    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully' 
    });
  } catch (error) {
    console.error(`Error deleting menu item with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete menu item', 
      error: error.message 
    });
  }
});

// Sync menu from Google Sheets
app.post('/api/menu/sync', async (req, res) => {
  try {
    const result = await updateMenuData();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Successfully synced ${result.count} menu items from Google Sheets` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync menu from Google Sheets', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error syncing menu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync menu from Google Sheets', 
      error: error.message 
    });
  }
});

// Upload Excel file
app.post('/api/menu/upload', upload.single('menuFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    const result = await processMenuExcel(req.file.path);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Successfully processed ${result.count} menu items from Excel` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process Excel file', 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error processing menu upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process Excel file', 
      error: error.message 
    });
  }
});

// Upload image endpoint
app.post('/api/upload/image', imageUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    // Return the URL to the uploaded image
    const imageUrl = `http://localhost:${PORT}/images/${path.basename(req.file.path)}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Upload multiple images endpoint
app.post('/api/upload/images', imageUpload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Return the URLs to the uploaded images
    const imageUrls = req.files.map(file => 
      `http://localhost:${PORT}/images/${path.basename(file.path)}`
    );
    
    res.json({
      success: true,
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// Create a backup
app.post('/api/backup', async (req, res) => {
  try {
    const backupId = await backupData();
    res.json({ 
      success: true, 
      message: 'Backup created successfully',
      backupId
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create backup', 
      error: error.message 
    });
  }
});

// Get list of available backups
app.get('/api/backups', (req, res) => {
  try {
    const backupsDir = path.join(__dirname, 'data', 'backups');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      return res.json({ success: true, backups: [] });
    }
    
    const backupFiles = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          id: file.replace('.json', ''),
          name: file,
          createdAt: stats.mtime.toISOString(),
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ success: true, backups: backupFiles });
  } catch (error) {
    console.error('Error getting backups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get backups', 
      error: error.message 
    });
  }
});

// Restore from backup
app.post('/api/restore/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    const result = await restoreFromBackup(backupId);
    
    if (result.success) {
      // Sync with frontend after restore
      await syncMenuWithFrontend();
      
      res.json({ 
        success: true, 
        message: 'Backup restored successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to restore backup', 
      error: error.message 
    });
  }
});

// Delete a backup
app.delete('/api/backup/:backupId', (req, res) => {
  try {
    const { backupId } = req.params;
    const backupPath = path.join(__dirname, 'data', 'backups', `${backupId}.json`);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: `Backup with ID ${backupId} not found`
      });
    }
    
    fs.unlinkSync(backupPath);
    
    res.json({ 
      success: true, 
      message: 'Backup deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete backup', 
      error: error.message 
    });
  }
});

// Schedule automatic backups (daily)
const scheduleBackup = () => {
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  // Create a backup on startup
  backupData().catch(err => console.error('Error creating initial backup:', err));
  
  // Schedule regular backups
  setInterval(async () => {
    try {
      await backupData();
      console.log('Automatic backup created successfully');
      
      // Clean up old backups - keep only the most recent 10
      const backupsDir = path.join(__dirname, 'data', 'backups');
      if (fs.existsSync(backupsDir)) {
        const backupFiles = fs.readdirSync(backupsDir)
          .filter(file => file.endsWith('.json'))
          .map(file => {
            const filePath = path.join(backupsDir, file);
            const stats = fs.statSync(filePath);
            return {
              name: file,
              path: filePath,
              createdAt: stats.mtime.toISOString()
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Delete older backups (keep 10 most recent)
        if (backupFiles.length > 10) {
          backupFiles.slice(10).forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
      }
    } catch (error) {
      console.error('Error during automatic backup:', error);
    }
  }, BACKUP_INTERVAL);
};

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders', 
      error: error.message 
    });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`
      });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error(`Error getting order with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get order', 
      error: error.message 
    });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const orderDetails = req.body;
    
    // Basic validation
    if (!orderDetails.customer || !orderDetails.items) {
      return res.status(400).json({
        success: false,
        message: 'Customer information and items are required'
      });
    }
    
    const newOrder = await createOrder(orderDetails);
    
    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'delivered', 'cancelled', 'Pending Venmo Payment'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updatedOrder = await updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error(`Error updating status for order ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status', 
      error: error.message 
    });
  }
});

// Time Slot API Endpoints
// Get time slot configuration
app.get('/api/time-slots/config', async (req, res) => {
  try {
    const config = await getTimeSlotConfig();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error getting time slot config:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get time slot configuration', 
      error: error.message 
    });
  }
});

// Update time slot configuration
app.put('/api/time-slots/config', async (req, res) => {
  try {
    const updatedConfig = req.body;
    const config = await updateTimeSlotConfig(updatedConfig);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error updating time slot config:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update time slot configuration', 
      error: error.message 
    });
  }
});

// Add a new time slot
app.post('/api/time-slots', async (req, res) => {
  try {
    const newTimeSlot = req.body;
    const config = await addTimeSlot(newTimeSlot);
    res.status(201).json({ success: true, config });
  } catch (error) {
    console.error('Error adding time slot:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add time slot', 
      error: error.message 
    });
  }
});

// Update a time slot
app.put('/api/time-slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTimeSlot = req.body;
    const config = await updateTimeSlot(id, updatedTimeSlot);
    res.json({ success: true, config });
  } catch (error) {
    console.error(`Error updating time slot with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update time slot', 
      error: error.message 
    });
  }
});

// Delete a time slot
app.delete('/api/time-slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await deleteTimeSlot(id);
    res.json({ success: true, config });
  } catch (error) {
    console.error(`Error deleting time slot with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete time slot', 
      error: error.message 
    });
  }
});

// Get available time slots for a specific date
app.get('/api/time-slots/available/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const availableSlots = await getAvailableTimeSlots(date);
    res.json({ success: true, availableSlots });
  } catch (error) {
    console.error(`Error getting available time slots for date ${req.params.date}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get available time slots', 
      error: error.message 
    });
  }
});

// Payment Settings API Endpoints
// Get payment settings
app.get('/api/payment-settings', async (req, res) => {
  try {
    const settings = await getPaymentSettings();
    res.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error('Error getting payment settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment settings', 
      error: error.message 
    });
  }
});

// Update payment settings
app.put('/api/payment-settings', async (req, res) => {
  try {
    const updatedSettings = req.body;
    
    // Basic validation
    if (!updatedSettings.venmoUsername) {
      return res.status(400).json({
        success: false,
        message: 'Venmo username is required'
      });
    }
    
    const settings = await updatePaymentSettings(updatedSettings);
    res.json({ 
      success: true, 
      message: 'Payment settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment settings', 
      error: error.message 
    });
  }
});

// Serve React application for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server with backup scheduling
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleBackup();
}); 