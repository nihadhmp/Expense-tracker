import mongoose from "mongoose";

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    emoji: {
      type: String,
      default: "📁",
    },
  },
  {
    timestamps: true,
  }
);

// Expense Schema
const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Models
export const Category = mongoose.model("Category", categorySchema);
export const Expense = mongoose.model("Expense", expenseSchema);

// Helper functions for backwards compatibility
export const getCategory = async (id) => {
  try {
    return await Category.findById(id);
  } catch (error) {
    return null;
  }
};

export const getCategoryByName = async (name, userId) => {
  return await Category.findOne({
    name: new RegExp(`^${name}$`, "i"),
    userId,
  });
};

export const addCategory = async (categoryData) => {
  const category = new Category(categoryData);
  return await category.save();
};

export const updateCategory = async (id, updates) => {
  try {
    return await Category.findByIdAndUpdate(id, updates, { new: true });
  } catch (error) {
    return null;
  }
};

export const deleteCategory = async (id) => {
  try {
    const result = await Category.findByIdAndDelete(id);
    if (result) {
      // Also delete related expenses
      await Expense.deleteMany({ categoryId: id });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const addExpense = async (expenseData) => {
  const expense = new Expense(expenseData);
  return await expense.save();
};

export const updateExpense = async (id, updates) => {
  try {
    return await Expense.findByIdAndUpdate(id, updates, { new: true });
  } catch (error) {
    return null;
  }
};

export const deleteExpense = async (id) => {
  try {
    const result = await Expense.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    return false;
  }
};

export const getExpensesByCategory = async (categoryId, userId) => {
  return await Expense.find({ categoryId, userId });
};

export const getExpensesByMonth = async (year, month, userId) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  return await Expense.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

export const calculateCategorySpending = async (
  categoryId,
  year,
  month,
  userId
) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const expenses = await Expense.find({
    categoryId,
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return expenses.reduce((total, exp) => total + exp.amount, 0);
};

export const getMonthlySummary = async (year, month, userId) => {
  const categories = await Category.find({ userId });

  const summary = await Promise.all(
    categories.map(async (category) => {
      const spent = await calculateCategorySpending(
        category._id,
        year,
        month,
        userId
      );
      const budget = category.monthlyBudget;
      const remaining = budget - spent;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      return {
        categoryId: category._id,
        categoryName: category.name,
        emoji: category.emoji,
        budget,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(2)),
        isOverBudget: spent > budget,
      };
    })
  );

  return summary;
};
