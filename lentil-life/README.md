# Lentil Life

A modern, responsive website for a plant-based food business. Includes menu display, ordering system, and admin features for menu management.

## Project Structure

This project is organized into two main parts:

- **Frontend**: React application with Tailwind CSS
- **Backend**: Express server with JSON file storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lentil-life.git
cd lentil-life
```

2. Install dependencies for the main project:
```bash
npm install
```

3. Install dependencies for the frontend:
```bash
cd frontend
npm install
```

4. Install dependencies for the backend:
```bash
cd ../backend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The frontend should now be running at http://localhost:5173 and the backend at http://localhost:4000.

## Features

- Responsive design with modern UI/UX
- Menu display organized by categories
- Admin interface for menu management
- Direct editing of menu items through admin interface
- JSON file storage for easy menu management
- Excel upload for bulk menu updates
- Google Sheets integration

## Menu Management

Menu data is stored in a JSON file at `backend/data/menu.json`. This provides a simple storage solution without requiring a database setup.

The admin interface (http://localhost:5173/admin/menu) provides several ways to manage the menu:

1. **Direct Editing**: Add, edit, or delete menu items directly through the interface
2. **Excel Upload**: Upload an Excel file to update the entire menu at once
3. **Google Sheets Integration**: Sync with a Google Sheet for collaborative menu management

## Technology Stack

- **Frontend**
  - React
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - React Router

- **Backend**
  - Node.js
  - Express
  - JSON file storage

## Customization

### Menu Structure

The menu structure is defined in the `MenuItem` interface. Each item includes:

- Name, description, price
- Category
- Image URL
- Dietary information (vegan, gluten-free, etc.)
- Nutritional information
- Ingredients list

### Theme & Styling

The site uses a green/earth-tone color scheme suitable for a plant-based food business. You can customize the colors in the Tailwind configuration file: `frontend/tailwind.config.js`.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 