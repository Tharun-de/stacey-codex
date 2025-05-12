const fs = require('fs');
const path = require('path');

// Path to the menu.json file
const menuFilePath = path.join(__dirname, 'data', 'menu.json');

/**
 * Read menu data from the JSON file
 * @returns {Promise<Array>} Array of menu items
 */
function readMenuData() {
  return new Promise((resolve, reject) => {
    fs.readFile(menuFilePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // If file doesn't exist, return empty array
          return resolve({ items: [] });
        }
        return reject(err);
      }
      
      try {
        const menuData = JSON.parse(data);
        resolve(menuData);
      } catch (parseError) {
        reject(new Error(`Error parsing menu data: ${parseError.message}`));
      }
    });
  });
}

/**
 * Write menu data to the JSON file
 * @param {Array} menuItems - Array of menu items to write
 * @returns {Promise<boolean>} Success status
 */
function writeMenuData(menuData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(menuData, null, 2);
    
    fs.writeFile(menuFilePath, data, 'utf8', (err) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
}

/**
 * Get all menu items
 * @returns {Promise<Array>} Array of menu items
 */
async function getAllMenuItems() {
  try {
    const menuData = await readMenuData();
    return menuData.items || [];
  } catch (error) {
    console.error('Error reading menu items:', error);
    throw error;
  }
}

/**
 * Get a menu item by ID
 * @param {number} id - The ID of the menu item to find
 * @returns {Promise<Object|null>} The menu item or null if not found
 */
async function getMenuItemById(id) {
  try {
    const menuData = await readMenuData();
    const idToFind = Number(id);
    return menuData.items.find(item => item.id === idToFind) || null;
  } catch (error) {
    console.error(`Error finding menu item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Add a new menu item
 * @param {Object} newItem - The menu item to add
 * @returns {Promise<Object>} The added menu item with ID
 */
async function addMenuItem(newItem) {
  try {
    const menuData = await readMenuData();
    
    // Find the highest ID to assign next ID
    const highestId = menuData.items.reduce((max, item) => 
      item.id > max ? item.id : max, 0);
    
    // Assign a new ID
    const itemToAdd = {
      ...newItem,
      id: highestId + 1
    };
    
    // Add to items array
    menuData.items.push(itemToAdd);
    
    // Write updated data back to file
    await writeMenuData(menuData);
    
    return itemToAdd;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
}

/**
 * Update an existing menu item
 * @param {number} id - ID of the item to update
 * @param {Object} updatedItem - Updated menu item data
 * @returns {Promise<Object|null>} The updated menu item or null if not found
 */
async function updateMenuItem(id, updatedItem) {
  try {
    const menuData = await readMenuData();
    const idToUpdate = Number(id);
    
    // Find the index of the item to update
    const index = menuData.items.findIndex(item => item.id === idToUpdate);
    
    if (index === -1) {
      return null; // Item not found
    }
    
    // Update the item while preserving the ID
    menuData.items[index] = {
      ...updatedItem,
      id: idToUpdate
    };
    
    // Write updated data back to file
    await writeMenuData(menuData);
    
    return menuData.items[index];
  } catch (error) {
    console.error(`Error updating menu item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a menu item
 * @param {number} id - ID of the item to delete
 * @returns {Promise<boolean>} True if item was deleted, false if not found
 */
async function deleteMenuItem(id) {
  try {
    const menuData = await readMenuData();
    const idToDelete = Number(id);
    
    // Find the index of the item to delete
    const index = menuData.items.findIndex(item => item.id === idToDelete);
    
    if (index === -1) {
      return false; // Item not found
    }
    
    // Remove the item from the array
    menuData.items.splice(index, 1);
    
    // Write updated data back to file
    await writeMenuData(menuData);
    
    return true;
  } catch (error) {
    console.error(`Error deleting menu item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get menu items by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Array of menu items in the specified category
 */
async function getMenuItemsByCategory(category) {
  try {
    const menuData = await readMenuData();
    return menuData.items.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error(`Error getting menu items in category ${category}:`, error);
    throw error;
  }
}

/**
 * Get all unique menu categories
 * @returns {Promise<Array>} Array of unique category names
 */
async function getAllCategories() {
  try {
    const menuData = await readMenuData();
    // Get unique categories
    const categories = [...new Set(menuData.items.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error('Error getting menu categories:', error);
    throw error;
  }
}

/**
 * Replace all menu items at once (used for bulk updates)
 * @param {Array} newItems - The new array of menu items
 * @returns {Promise<boolean>} Success status
 */
async function replaceAllMenuItems(newItems) {
  try {
    const menuData = { items: newItems };
    await writeMenuData(menuData);
    return true;
  } catch (error) {
    console.error('Error replacing all menu items:', error);
    throw error;
  }
}

/**
 * Update frontend menu data file for compatibility
 * @returns {Promise<boolean>} Success status
 */
async function syncMenuWithFrontend() {
  try {
    const menuData = await readMenuData();
    
    // Create output directory for frontend
    const outputDir = path.join(__dirname, '..', 'frontend', 'src', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Format the data as a TypeScript file
    const fileContent = `
// This file is auto-generated from JSON data - DO NOT EDIT MANUALLY
import { MenuItem } from '../types';

export const menuItems: MenuItem[] = ${JSON.stringify(menuData.items, null, 2)};
`;
    
    // Write to the file
    fs.writeFileSync(
      path.join(outputDir, 'menuData.ts'),
      fileContent
    );
    
    return true;
  } catch (error) {
    console.error('Error syncing menu with frontend:', error);
    return false;
  }
}

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
  getAllCategories,
  replaceAllMenuItems,
  syncMenuWithFrontend
}; 