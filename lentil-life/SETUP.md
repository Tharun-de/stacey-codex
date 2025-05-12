# Setting Up the Lentil Life Project

This document provides step-by-step instructions for setting up and working with the Lentil Life project, which is divided into separate frontend and backend folders.

## Initial Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lentil-life
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Go back to the root directory
cd ..

# Install backend dependencies
cd backend
npm install
```

## Running the Development Environment

To run the development environment, you'll need to start both the frontend and backend servers.

### Method 1: Using Two Terminal Windows

**Terminal 1 - Frontend**:
```bash
cd frontend
npm start
```
This will start the frontend development server on http://localhost:3000

**Terminal 2 - Backend**:
```bash
cd backend
npm run dev
```
This will start the backend server on http://localhost:4000

### Method 2: Using Concurrently (Optional)

If you install `concurrently` in the root directory, you can run both servers with a single command:

1. Create a package.json in the root directory:
```bash
{
  "name": "lentil-life",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "frontend": "cd frontend && npm start",
    "backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm run frontend\" \"npm run backend\""
  },
  "devDependencies": {
    "concurrently": "^8.0.1"
  }
}
```

2. Install concurrently:
```bash
npm install
```

3. Run both servers with a single command:
```bash
npm run dev
```

## Menu Management Workflow

### Using Excel:

1. Navigate to the admin page at: http://localhost:3000/admin/menu
2. Download the Excel template
3. Fill in the template with your menu items
4. Upload the completed Excel file through the admin interface

### Using Google Sheets:

1. Follow the Google Sheets integration setup in the backend README
2. Update your menu directly in Google Sheets
3. Navigate to the admin page at: http://localhost:3000/admin/menu
4. Click "Sync from Google Sheets"

## Building for Production

### Frontend:
```bash
cd frontend
npm run build
```
This creates a production build in the `frontend/dist` directory.

### Backend:
```bash
cd backend
npm run build # Optional, if you're using TypeScript
```

## Deployment

See the individual README files in the frontend and backend directories for detailed deployment instructions. 