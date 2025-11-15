import express from "express";
import {
  getMonthlySummaryByDate,
  getCurrentMonthlySummary,
} from "../controllers/summaryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/summary/current - Get current month summary
router.get("/current", getCurrentMonthlySummary);

// GET /api/summary/:year/:month - Get monthly summary
router.get("/:year/:month", getMonthlySummaryByDate);

export default router;
