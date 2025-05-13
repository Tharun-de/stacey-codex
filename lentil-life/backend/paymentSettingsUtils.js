const fs = require('fs');
const path = require('path');

const SETTINGS_FILE_PATH = path.join(__dirname, 'data', 'paymentSettings.json');

/**
 * Read payment settings from JSON file.
 * Creates a default settings file if one doesn't exist.
 * @returns {Promise<Object>} Payment settings
 */
async function readPaymentSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
      // Create default settings if file doesn't exist
      const defaultSettings = {
        venmoUsername: '@YourVenmoHandle', // Placeholder
        venmoQrCodeUrl: 'https://via.placeholder.com/150?text=Venmo+QR' // Placeholder
      };
      await writePaymentSettings(defaultSettings);
      return defaultSettings;
    }
    const fileData = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading payment settings:', error);
    // Return defaults in case of an error to prevent crashes
    return {
      venmoUsername: '@YourVenmoHandle',
      venmoQrCodeUrl: 'https://via.placeholder.com/150?text=Venmo+QR'
    };
  }
}

/**
 * Write payment settings to JSON file.
 * @param {Object} settingsData - Payment settings to write
 * @returns {Promise<boolean>} Success status
 */
async function writePaymentSettings(settingsData) {
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settingsData, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing payment settings:', error);
    throw error; // Re-throw to be caught by the API endpoint handler
  }
}

/**
 * Get current payment settings.
 * @returns {Promise<Object>} Current payment settings
 */
async function getPaymentSettings() {
  return await readPaymentSettings();
}

/**
 * Update payment settings.
 * @param {Object} updatedSettings - The new settings to save
 * @returns {Promise<Object>} Updated payment settings
 */
async function updatePaymentSettings(updatedSettings) {
  // You might want to add validation here to ensure fields are not empty, URLs are valid, etc.
  await writePaymentSettings(updatedSettings);
  return updatedSettings;
}

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
}; 