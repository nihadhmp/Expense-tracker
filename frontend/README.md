# Expense Tracker Frontend

This is the frontend for the Expense Tracker application built with React and Vite.

## Deployment to Render

To deploy this frontend to Render:

1. Create a new "Static Site" on Render
2. Connect your GitHub repository
3. Set the following configuration:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     - `BACKEND_API_URL`: Set to your backend API URL (e.g., `https://your-backend.onrender.com/api`)

### Render YAML Configuration

Alternatively, you can use the `render.yaml` file included in this repository for automatic configuration.

## Environment Variables

- `BACKEND_API_URL`: The URL of the backend API (default: `http://localhost:5000/api`)

## Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand (state management)
- Recharts (data visualization)
