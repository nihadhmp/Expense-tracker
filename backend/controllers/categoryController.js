import {
  Category,
  Expense,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} from "../models.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get single category
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, monthlyBudget, emoji } = req.body;

    if (!name || monthlyBudget === undefined) {
      return res
        .status(400)
        .json({ error: "Name and monthly budget are required" });
    }

    const newCategory = await addCategory({
      userId: req.userId,
      name,
      monthlyBudget: parseFloat(monthlyBudget),
      emoji: emoji || "📁",
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Update category
export const updateCategoryById = async (req, res) => {
  try {
    const { name, monthlyBudget, emoji } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (monthlyBudget !== undefined)
      updates.monthlyBudget = parseFloat(monthlyBudget);
    if (emoji !== undefined) updates.emoji = emoji;

    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );

    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete category
export const deleteCategoryById = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (category) {
      // Also delete related expenses
      await Expense.deleteMany({
        categoryId: req.params.id,
        userId: req.userId,
      });
      res.json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};
