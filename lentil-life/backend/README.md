# Lentil Life Backend

This is the backend server for Lentil Life, a plant-based food ordering website. The backend manages menu data using a simple JSON file storage system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 4000 by default, but you can change this by setting the `PORT` environment variable.

## Menu Data Storage

Menu data is stored in a JSON file located at `data/menu.json`. This makes it easy to manage without requiring a database setup. The backend automatically syncs the JSON data with the frontend application.

## API Endpoints

### Menu Items

- **GET /api/menu/items** - Get all menu items
- **GET /api/menu/items/:id** - Get a menu item by ID
- **POST /api/menu/items** - Add a new menu item
- **PUT /api/menu/items/:id** - Update a menu item
- **DELETE /api/menu/items/:id** - Delete a menu item

### Categories

- **GET /api/menu/categories** - Get all menu categories
- **GET /api/menu/categories/:category** - Get menu items in a specific category

### Bulk Updates

- **POST /api/menu/upload** - Upload an Excel file to update the menu
- **POST /api/menu/sync** - Sync menu data from Google Sheets

## Menu Item Format

Menu items should follow this format:

```json
{
  "name": "Item Name",
  "price": 9.95,
  "category": "lunch",
  "description": "Item description",
  "image": "https://example.com/image.jpg",
  "popular": false,
  "dietaryInfo": {
    "vegan": true,
    "vegetarian": true,
    "glutenFree": false,
    "dairyFree": true
  },
  "nutritionalInfo": {
    "calories": 400,
    "protein": 15,
    "carbs": 45,
    "fat": 20,
    "fiber": 10
  },
  "ingredients": ["Ingredient 1", "Ingredient 2"]
}
```

## Admin Interface

You can manage the menu through the admin interface at:
```
http://localhost:5173/admin/menu
```

The admin interface provides:
- Direct editing of menu items
- Adding new items
- Deleting items
- Bulk updates via Excel
- Syncing with Google Sheets

## For Developers

### Google Sheets Integration

To use the Google Sheets integration:

1. Create a Google Cloud project
2. Enable the Google Sheets API
3. Create a service account and download credentials
4. Share your Google Sheet with the service account email
5. Add your Sheet ID to the `menuService.js` file
6. Add your credentials to the `menuService.js` file

### Excel Upload

The Excel file should match the format of the menu items. Required columns are:
- id (will be assigned automatically for new items)
- name
- price
- category
- description
- image (URL to image)

Additional columns can include dietary information (vegan, glutenFree, etc.) and nutritional information.

## Troubleshooting

If you encounter issues:

1. Check that the `data` directory exists
2. Make sure `menu.json` has correct JSON format
3. Verify that the server is running on port 4000
4. Check that the frontend is configured to connect to http://localhost:4000/api 