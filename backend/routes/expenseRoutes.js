import express from "express";
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpenseById,
  deleteExpenseById,
} from "../controllers/expenseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/expenses - Get all expenses (with optional filtering)
router.get("/", getAllExpenses);

// GET /api/expenses/:id - Get single expense
router.get("/:id", getExpenseById);

// POST /api/expenses - Create new expense
router.post("/", createExpense);

// PUT /api/expenses/:id - Update expense
router.put("/:id", updateExpenseById);

// DELETE /api/expenses/:id - Delete expense
router.delete("/:id", deleteExpenseById);

export default router;
