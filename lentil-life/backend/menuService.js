const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');
const { replaceAllMenuItems, syncMenuWithFrontend } = require('./jsonUtils');

// This would normally be stored securely in environment variables
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your Google Sheet ID

// This would be stored securely, not in the code
const CREDENTIALS = {
  // Your service account credentials JSON would go here
  // You'll need to create a service account in Google Cloud Console
};

/**
 * Fetches all menu items from the Google Sheet
 */
async function fetchMenuFromGoogleSheet() {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    
    // Authenticate with the Google Sheets API
    await doc.useServiceAccountAuth(CREDENTIALS);
    
    // Load the document properties and sheets
    await doc.loadInfo();
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Load all rows
    const rows = await sheet.getRows();
    
    // Transform sheet rows into menu items
    const menuItems = rows.map(row => {
      // Parse ingredients from comma-separated string to array
      const ingredients = row.ingredients ? row.ingredients.split(',').map(i => i.trim()) : [];
      
      return {
        id: parseInt(row.id),
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        image: row.image,
        category: row.category,
        popular: row.popular && row.popular.toLowerCase() === 'yes',
        dietaryInfo: {
          vegan: row.vegan && row.vegan.toLowerCase() === 'yes',
          vegetarian: row.vegetarian && row.vegetarian.toLowerCase() === 'yes',
          glutenFree: row.glutenFree && row.glutenFree.toLowerCase() === 'yes',
          dairyFree: row.dairyFree && row.dairyFree.toLowerCase() === 'yes'
        },
        nutritionalInfo: {
          calories: parseInt(row.calories || 0),
          protein: parseInt(row.protein || 0),
          carbs: parseInt(row.carbs || 0),
          fat: parseInt(row.fat || 0),
          fiber: parseInt(row.fiber || 0)
        },
        ingredients
      };
    });
    
    return menuItems;
  } catch (error) {
    console.error('Error fetching menu from Google Sheet:', error);
    throw new Error('Failed to fetch menu from Google Sheet');
  }
}

/**
 * Updates the menu data JSON file with data from Google Sheets
 */
async function updateMenuData() {
  try {
    const menuItems = await fetchMenuFromGoogleSheet();
    
    // Update the JSON data
    await replaceAllMenuItems(menuItems);
    
    // Sync with frontend
    await syncMenuWithFrontend();
    
    return { success: true, count: menuItems.length };
  } catch (error) {
    console.error('Error updating menu data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process an uploaded Excel file
 */
async function processMenuExcel(filePath) {
  try {
    const xlsx = require('xlsx');
    
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    
    // Get the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    // Transform the data to match our MenuItem type
    const menuItems = rows.map(row => {
      // Parse ingredients from comma-separated string to array
      const ingredients = row.ingredients ? row.ingredients.split(',').map(i => i.trim()) : [];
      
      return {
        id: parseInt(row.id),
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        image: row.image,
        category: row.category,
        popular: row.popular && row.popular.toLowerCase() === 'yes',
        dietaryInfo: {
          vegan: row.vegan && row.vegan.toLowerCase() === 'yes',
          vegetarian: row.vegetarian && row.vegetarian.toLowerCase() === 'yes',
          glutenFree: row.glutenFree && row.glutenFree.toLowerCase() === 'yes',
          dairyFree: row.dairyFree && row.dairyFree.toLowerCase() === 'yes'
        },
        nutritionalInfo: {
          calories: parseInt(row.calories || 0),
          protein: parseInt(row.protein || 0),
          carbs: parseInt(row.carbs || 0),
          fat: parseInt(row.fat || 0),
          fiber: parseInt(row.fiber || 0)
        },
        ingredients
      };
    });
    
    // Update the JSON data
    await replaceAllMenuItems(menuItems);
    
    // Sync with frontend
    await syncMenuWithFrontend();
    
    return { success: true, count: menuItems.length };
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  fetchMenuFromGoogleSheet,
  updateMenuData,
  processMenuExcel
}; 