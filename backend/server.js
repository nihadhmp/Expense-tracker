import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category, Expense } from "./models.js";
import { User } from "./models/User.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
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
      "https://expense-tracker-1-121h.onrender.com",
      "https://expense-tracker-va4s.onrender.com",
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB with URI:", MONGODB_URI);

    // Add connection options for better reliability
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Limit connection pool size
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Initialize data without sample data as requested
    await initializeData();
    return true; // Successfully connected
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    // Don't exit the process, just return false
    return false; // Failed to connect
  }
};

// Initialize data without sample data as requested
const initializeData = async () => {
  try {
    console.log(
      "Database connection established - no sample data initialization"
    );
    // No sample data initialization as requested
  } catch (error) {
    console.error("Error in database initialization:", error);
  }
};

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server function
const startServer = async () => {
  try {
    // Attempt to connect to database
    const dbConnected = await connectDB();

    // Start the server regardless of database connection status
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);

      if (!dbConnected) {
        console.log(
          "WARNING: Database connection failed, but server is running"
        );
        console.log(
          "Some features may not work properly until database is connected"
        );
      }
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    // Don't exit the process, let the application continue
  }
};

// Start the server
startServer();
