# Lentil Life - Frontend

The React-based frontend for the Lentil Life restaurant website.

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Project Structure

- `src/components/`: UI components
- `src/pages/`: Page components for each route
- `src/data/`: Data files (including menu data)
- `src/utils/`: Utility functions
- `src/types/`: TypeScript type definitions

## Important Files

- `src/App.tsx`: Main application component with routing
- `src/pages/AdminMenuPage.tsx`: Admin interface for menu management
- `src/data/menuData.ts`: Menu data (auto-generated from Excel/Google Sheets)

## Deployment

### Vercel Deployment

1. Create an account on Vercel (https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in the frontend directory and follow the prompts
4. For production deployment: `vercel --prod`

### Netlify Deployment

1. Create an account on Netlify (https://netlify.com)
2. Build the project: `npm run build`
3. Deploy the `build` folder through Netlify UI or CLI

## Configuration

Before deploying to production:

1. Update the `API_URL` in `src/pages/AdminMenuPage.tsx` to your backend API URL 