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

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    initializeData();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

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
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Expense Tracker API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
