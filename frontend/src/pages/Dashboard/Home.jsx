import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axios";
import API_ENDPOINTS from "../../utils/apiPaths";
import moment from "moment";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiFolder,
  FiPlus,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

function Home() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, expensesRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.CURRENT_SUMMARY),
        axiosInstance.get(API_ENDPOINTS.EXPENSES),
      ]);
      setSummary(summaryRes.data);

      // Handle expenses data - ensure it's an array
      const expenses = Array.isArray(expensesRes.data) ? expensesRes.data : [];
      setRecentExpenses(expenses.slice(-5).reverse());
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
      // Set empty defaults on error
      setSummary(null);
      setRecentExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthName = moment().format("MMMM YYYY");

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Budget-Aware Expense Tracker
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Track spending, manage budgets, and view reports
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Current Month: <strong>{monthName}</strong>
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        ) : summary &&
          summary.totals &&
          summary.totals.budget !== undefined &&
          summary.totals.spent !== undefined &&
          summary.totals.percentage !== undefined &&
          summary.totals.remaining !== undefined ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <TbCurrencyRupee className="text-2xl sm:text-3xl" />
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">
                      Total Budget
                    </p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      ₹{summary.totals.budget?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FiTrendingUp className="text-2xl sm:text-3xl" />
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">
                      Total Spent
                    </p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      ₹{summary.totals.spent?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-orange-100 mt-2">
                  {summary.totals.percentage?.toFixed(1) || "0.0"}% of budget
                </p>
              </div>

              <div
                className={`bg-gradient-to-br ${
                  summary.totals.remaining >= 0
                    ? "from-green-500 to-green-600"
                    : "from-red-500 to-red-600"
                } rounded-xl shadow-lg p-4 sm:p-6 text-white`}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FiTrendingDown className="text-2xl sm:text-3xl" />
                  <div>
                    <p
                      className={`text-xs sm:text-sm ${
                        summary.totals.remaining >= 0
                          ? "text-green-100"
                          : "text-red-100"
                      }`}
                    >
                      {summary.totals.remaining >= 0
                        ? "Remaining"
                        : "Over Budget"}
                    </p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      ₹
                      {Math.abs(summary.totals.remaining)?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FiPieChart className="text-2xl sm:text-3xl" />
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">
                      Categories
                    </p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      {summary.categories.length}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-purple-100 mt-2">
                  {summary.categories.filter((c) => c.isOverBudget).length} over
                  budget
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <button
                onClick={() => navigate("/dashboard/expenses")}
                className="bg-white hover:shadow-xl transition-shadow rounded-xl p-4 sm:p-6 text-left group"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <div className="bg-blue-100 p-3 sm:p-4 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FiPlus className="text-blue-600 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Add Expense
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  Record a new purchase and check your budget status
                </p>
              </button>

              <button
                onClick={() => navigate("/dashboard/categories")}
                className="bg-white hover:shadow-xl transition-shadow rounded-xl p-4 sm:p-6 text-left group"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <div className="bg-green-100 p-3 sm:p-4 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FiFolder className="text-green-600 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Manage Categories
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  Create and edit spending categories and budgets
                </p>
              </button>

              <button
                onClick={() => navigate("/dashboard/summary")}
                className="bg-white hover:shadow-xl transition-shadow rounded-xl p-4 sm:p-6 text-left group sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <div className="bg-purple-100 p-3 sm:p-4 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FiPieChart className="text-purple-600 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    View Reports
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  See detailed monthly spending reports and charts
                </p>
              </button>
            </div>

            {/* Category Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Category Status</h2>
                <div className="space-y-3">
                  {summary.categories.map((category, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {category.categoryName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ₹{category.spent?.toFixed(2) || "0.00"} / ₹
                            {category.budget?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-semibold ${
                              category.isOverBudget
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {category.isOverBudget ? "Over" : "Remaining"}
                          </span>
                          <p
                            className={`font-bold ${
                              category.isOverBudget
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            ₹
                            {Math.abs(category.remaining)?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            category.isOverBudget
                              ? "bg-red-600"
                              : category.percentage > 80
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${Math.min(category.percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {category.percentage?.toFixed(1) || "0.0"}% used
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Expenses */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
                {recentExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {recentExpenses.map((expense) => (
                      <div
                        key={expense._id || expense.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {expense.categoryName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {expense.description || "No description"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {moment(expense.date).format("MMM DD, YYYY")}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-gray-800">
                            ₹{expense.amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No expenses yet</p>
                    <button
                      onClick={() => navigate("/dashboard/expenses")}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first expense →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Expense Tracker!
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Start tracking your expenses by creating categories and adding
              your first expense.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/dashboard/categories")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Categories
              </button>
              <button
                onClick={() => navigate("/dashboard/expenses")}
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Add Expense
              </button>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-blue-600 text-3xl mb-3">1</div>
                <h3 className="font-semibold text-lg mb-2">
                  Create Categories
                </h3>
                <p className="text-gray-600 text-sm">
                  Set up spending categories like Food, Rent, Transport with
                  monthly budgets.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-blue-600 text-3xl mb-3">2</div>
                <h3 className="font-semibold text-lg mb-2">Track Expenses</h3>
                <p className="text-gray-600 text-sm">
                  Record your daily purchases and see how they affect your
                  budgets.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-blue-600 text-3xl mb-3">3</div>
                <h3 className="font-semibold text-lg mb-2">View Reports</h3>
                <p className="text-gray-600 text-sm">
                  Get insights into your spending patterns with detailed monthly
                  reports.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
