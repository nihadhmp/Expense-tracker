import { getMonthlySummary } from "../models.js";

// Get monthly summary
export const getMonthlySummaryByDate = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const summary = await getMonthlySummary(year, month, req.userId);

    // Calculate totals
    const totalBudget = summary.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = summary.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    res.json({
      year,
      month,
      categories: summary,
      totals: {
        budget: parseFloat(totalBudget.toFixed(2)),
        spent: parseFloat(totalSpent.toFixed(2)),
        remaining: parseFloat(totalRemaining.toFixed(2)),
        percentage: parseFloat(((totalSpent / totalBudget) * 100).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

// Get current month summary
export const getCurrentMonthlySummary = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const summary = await getMonthlySummary(year, month, req.userId);

    const totalBudget = summary.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = summary.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    res.json({
      year,
      month,
      categories: summary,
      totals: {
        budget: parseFloat(totalBudget.toFixed(2)),
        spent: parseFloat(totalSpent.toFixed(2)),
        remaining: parseFloat(totalRemaining.toFixed(2)),
        percentage: parseFloat(((totalSpent / totalBudget) * 100).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch current summary" });
  }
};
