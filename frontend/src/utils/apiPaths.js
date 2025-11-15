// API Endpoints for use with axios instance
// Base URL is configured in axios instance

export const API_ENDPOINTS = {
  // Categories
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: (id) => `/categories/${id}`,

  // Expenses
  EXPENSES: "/expenses",
  EXPENSE_BY_ID: (id) => `/expenses/${id}`,

  // Summary
  MONTHLY_SUMMARY: (year, month) => `/summary/${year}/${month}`,
  CURRENT_SUMMARY: "/summary/current",

  // Health
  HEALTH: "/health",
};

export default API_ENDPOINTS;
