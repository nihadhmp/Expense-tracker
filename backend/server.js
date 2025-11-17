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

const MONGODB_URI = process.env.MONGODB_URI;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Render frontend URL
  "https://expense-tracker-1-121h.onrender.com",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// =============================
//   MONGO CONNECTION (CLEAN)
// =============================

const connectDB = async () => {
  console.log("Attempting to connect to MongoDB:", MONGODB_URI);

  try {
    // No deprecated options, clean and modern
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`Database Name: ${mongoose.connection.name}`);

    await initializeData();
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    // Detect & log parsing error separately
    if (error.name === "MongoParseError") {
      console.error(
        "MongoDB URI format error. Please check your connection string."
      );
    }

    // Fallback only if the URI is an Atlas URI
    if (MONGODB_URI.includes("mongodb+srv")) {
      console.log("Trying local MongoDB fallback...");

      try {
        await mongoose.connect("mongodb://127.0.0.1:27017/expense-tracker", {
          serverSelectionTimeoutMS: 5000,
        });

        console.log("Fallback MongoDB Connected: localhost");
        await initializeData();
        return true;
      } catch (localErr) {
        console.error("Local MongoDB connection failed:", localErr.message);
        console.log("Starting server WITHOUT database connection...");
        return false;
      }
    }

    return false;
  }
};

// =============================
// INITIAL DATA
// =============================
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
      console.log(`Existing categories found: ${categoryCount}`);
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// =============================
// START SERVER
// =============================
connectDB().then((connected) => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);

    if (!connected) {
      console.log("⚠ WARNING: Database is NOT connected!");
    }
  });
});

// =============================
// ROUTES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);

// HEALTH CHECK
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

// 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});
