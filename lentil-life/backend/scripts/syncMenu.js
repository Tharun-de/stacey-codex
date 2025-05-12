#!/usr/bin/env node
const { updateMenuData } = require('../menuService');

console.log('Starting menu sync from Google Sheets...');

updateMenuData()
  .then(result => {
    if (result.success) {
      console.log(`✅ Success! Synced ${result.count} menu items from Google Sheets.`);
      process.exit(0);
    } else {
      console.error(`❌ Failed to sync menu: ${result.error}`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error syncing menu:', error);
    process.exit(1);
  }); 