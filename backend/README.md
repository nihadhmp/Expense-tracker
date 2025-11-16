# Expense Tracker Backend

This is the backend for the Expense Tracker application built with Node.js, Express, and MongoDB.

## Deployment to Render

To deploy this backend to Render:

1. Create a new "Web Service" on Render
2. Connect your GitHub repository
3. Set the following configuration:
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `PORT`: 10000 (Render's default port)

### Render YAML Configuration

Alternatively, you can use the `render.yaml` file included in this repository for automatic configuration.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 5000, Render uses 10000)

## Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Start production server: `npm start`

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/current` - Get current user
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/summary/current` - Get current month summary
- `GET /api/summary/:year/:month` - Get monthly summary
- `GET /api/health` - Health check

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js
