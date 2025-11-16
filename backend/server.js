import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category, Expense } from "./models.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/expense-tracker";

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:3000",
      // Add your deployed frontend URL here
      process.env.FRONTEND_URL, // This will be set in Render environment variables
      "https://expense-tracker-1-121h.onrender.com", // Your deployed frontend URL
    ].filter(Boolean); // Remove undefined values

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB Connection with better error handling and options
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB with URI:", MONGODB_URI);

    // Add connection options for better reliability
    // Removed unsupported options: bufferMaxEntries
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Limit connection pool size
      serverSelectionTryOnce: false, // Retry connection
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    await initializeData();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error(
      "Please check your MongoDB connection string and ensure MongoDB is running"
    );
    console.error("Connection URI:", MONGODB_URI);

    // More specific error handling
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "Server selection error - check network connectivity and MongoDB Atlas IP whitelist"
      );
    } else if (error.name === "MongoNetworkError") {
      console.error(
        "Network error - check firewall settings and network connectivity"
      );
    } else if (error.name === "MongoParseError") {
      console.error(
        "URI parsing error - check MongoDB connection string format"
      );
    } else if (error.code === "ENOTFOUND") {
      console.error("DNS lookup failed - check MongoDB host name");
    }

    // Try to connect to local MongoDB as fallback
    if (MONGODB_URI.includes("mongodb+srv")) {
      console.log("Trying to connect to local MongoDB as fallback...");
      try {
        const localConn = await mongoose.connect(
          "mongodb://localhost:27017/expense-tracker",
          {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          }
        );
        console.log(`Fallback MongoDB Connected: ${localConn.connection.host}`);
        console.log(`Database Name: ${localConn.connection.name}`);
        await initializeData();
      } catch (localError) {
        console.error("Local MongoDB connection also failed:", localError);
        console.error(
          "Please ensure MongoDB is installed and running locally on port 27017"
        );
        // Exit process in production
        // process.exit(1);
      }
    } else {
      // Exit process in production
      // process.exit(1);
    }
  }
};

// Initialize sample data if database is empty
const initializeData = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log("Initializing sample data...");
      const categories = await Category.insertMany([
        { name: "Food", monthlyBudget: 500, emoji: "🍔" },
        { name: "Rent", monthlyBudget: 1200, emoji: "🏠" },
        { name: "Transport", monthlyBudget: 200, emoji: "🚗" },
        { name: "Entertainment", monthlyBudget: 150, emoji: "🎮" },
      ]);

      await Expense.insertMany([
        {
          categoryId: categories[0]._id,
          amount: 45.5,
          description: "Grocery shopping",
          date: new Date("2025-11-01"),
        },
        {
          categoryId: categories[0]._id,
          amount: 25.0,
          description: "Restaurant lunch",
          date: new Date("2025-11-05"),
        },
        {
          categoryId: categories[1]._id,
          amount: 1200.0,
          description: "Monthly rent",
          date: new Date("2025-11-01"),
        },
      ]);
      console.log("Sample data initialized");
    } else {
      console.log(`Found ${categoryCount} existing categories in database`);
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// Connect to MongoDB
connectDB();

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status: "OK",
    message: "Expense Tracker API is running",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
