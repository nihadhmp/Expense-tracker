import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
} from "../controllers/categoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/categories - Get all categories
router.get("/", getAllCategories);

// GET /api/categories/:id - Get single category
router.get("/:id", getCategoryById);

// POST /api/categories - Create new category
router.post("/", createCategory);

// PUT /api/categories/:id - Update category
router.put("/:id", updateCategoryById);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", deleteCategoryById);

export default router;
