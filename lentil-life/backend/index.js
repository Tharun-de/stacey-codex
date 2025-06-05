const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processMenuExcel, updateMenuData } = require('./menuService');
const { getPaymentSettings, updatePaymentSettings } = require('./paymentSettingsUtils');
const timeSlotRoutes = require('./timeSlotRoutes');
const { 
  syncMenuWithFrontend,
  backupData,
  restoreFromBackup
} = require('./jsonUtils');
const { v4: uuidv4 } = require('uuid');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrderById
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
  getAllMenuItems,
  getFeaturedMenuItems: getFeaturedMenuItemsFromSupabase,
  getMenuItemByIdFromSupabase,
  getMenuItemsByCategory,
  getAllCategories,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('./menuUtils');
const cron = require('node-cron');

// Initialize Supabase client (this will also load dotenv)
require('./supabaseClient'); 

// Import authentication routes
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const pointsRoutes = require('./pointsRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Raw body parser for Stripe webhooks (must be before express.json())
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// JSON parser for all other routes
app.use(express.json());

// Add authentication routes
app.use('/api/auth', authRoutes);

// Add orders routes
app.use('/api/orders', orderRoutes);

// Add payment routes
app.use('/api/payment', paymentRoutes);

// Add points routes
app.use('/api/points', pointsRoutes);

// Add time slot routes
app.use('/api/time-slots', timeSlotRoutes);

// Serve static files from the frontend build
// app.use(express.static(path.join(__dirname, '../frontend/dist'))); // Comment this out

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
    const items = await getFeaturedMenuItemsFromSupabase();
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
    console.log(`[index.js /api/menu/items/:id] Received request for ID (type: ${typeof id}):`, id);
    const item = await getMenuItemByIdFromSupabase(id);
    console.log(`[index.js /api/menu/items/:id] Result from getMenuItemByIdFromSupabase for ID ${id}:`, item);
    
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

// Payment Settings API Routes
app.get('/api/payment-settings', async (req, res) => {
  try {
    const settings = await getPaymentSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/payment-settings', async (req, res) => {
  try {
    const updatedSettings = await updatePaymentSettings(req.body);
    res.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backup and restore routes
app.post('/api/backups', async (req, res) => {
  try {
    const backup = await backupData();
    res.json({ success: true, backup });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/backups', async (req, res) => {
  try {
    const backupsDir = path.join(__dirname, 'data', 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      return res.json({ success: true, backups: [] });
    }
    
    const files = fs.readdirSync(backupsDir);
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          id: file.replace('.json', ''),
          name: file,
          createdAt: stats.birthtime.toISOString(),
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ success: true, backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/backups/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restoreFromBackup(id);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/backups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const backupPath = path.join(__dirname, 'data', 'backups', `${id}.json`);
    
    if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
      res.json({ success: true, message: 'Backup deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Backup not found' });
    }
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
    res.status(500).json({ 
      success: false, 
    error: 'Internal server error' 
    });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
      success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('Supabase client initialized.');
  console.log(`📧 Email service initialized`);
  console.log(`💳 Payment processing ready`);
  console.log(`🛒 E-commerce features active`);
});

// Schedule automatic backups (daily)
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Running automatic backup...');
    await backupData();
    console.log('Automatic backup completed successfully');
  } catch (error) {
    console.error('Automatic backup failed:', error);
  }
});

module.exports = app; 