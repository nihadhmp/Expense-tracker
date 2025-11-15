import {
  Expense,
  Category,
  addExpense,
  updateExpense,
  deleteExpense,
  getCategory,
  getExpensesByMonth,
  calculateCategorySpending,
} from "../models.js";

// Get all expenses (with optional filtering)
export const getAllExpenses = async (req, res) => {
  try {
    const { year, month, categoryId } = req.query;

    let expenses;

    // Filter by year and month
    if (year && month) {
      expenses = await getExpensesByMonth(
        parseInt(year),
        parseInt(month),
        req.userId
      );
    } else {
      expenses = await Expense.find({ userId: req.userId });
    }

    // Filter by category
    if (categoryId) {
      expenses = expenses.filter(
        (exp) => exp.categoryId.toString() === categoryId
      );
    }

    // Enrich with category info
    const enrichedExpenses = await Promise.all(
      expenses.map(async (exp) => {
        const category = await getCategory(exp.categoryId);
        return {
          ...exp.toObject(),
          id: exp._id,
          categoryName: category?.name || "Unknown",
          categoryEmoji: category?.emoji || "📁",
        };
      })
    );

    res.json(enrichedExpenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

// Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (expense) {
      res.json(expense);
    } else {
      res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expense" });
  }
};

// Create new expense (with budget validation)
export const createExpense = async (req, res) => {
  try {
    const { categoryId, amount, description, date } = req.body;

    if (!categoryId || amount === undefined || !date) {
      return res
        .status(400)
        .json({ error: "Category, amount, and date are required" });
    }

    // Verify category belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.userId,
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const expenseDate = new Date(date);
    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth();

    // Calculate current spending for this category this month
    const currentSpending = await calculateCategorySpending(
      categoryId,
      year,
      month,
      req.userId
    );
    const newTotal = currentSpending + parseFloat(amount);
    const budget = category.monthlyBudget;

    const newExpense = await addExpense({
      userId: req.userId,
      categoryId,
      amount: parseFloat(amount),
      description: description || "",
      date,
    });

    // Return expense with budget status
    res.status(201).json({
      expense: newExpense,
      budgetStatus: {
        categoryName: category.name,
        budget,
        previousSpending: parseFloat(currentSpending.toFixed(2)),
        newTotal: parseFloat(newTotal.toFixed(2)),
        remaining: parseFloat((budget - newTotal).toFixed(2)),
        isOverBudget: newTotal > budget,
        percentage: parseFloat(((newTotal / budget) * 100).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
};

// Update expense
export const updateExpenseById = async (req, res) => {
  try {
    const { categoryId, amount, description, date } = req.body;
    const updates = {};

    if (categoryId !== undefined) {
      // Verify new category belongs to user
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.userId,
      });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      updates.categoryId = categoryId;
    }
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;

    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );

    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update expense" });
  }
};

// Delete expense
export const deleteExpenseById = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (deleted) {
      res.json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
};
