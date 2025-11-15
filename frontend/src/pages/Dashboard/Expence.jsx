import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axios";
import API_ENDPOINTS from "../../utils/apiPaths";
import moment from "moment";
import { FiAlertCircle, FiCheckCircle, FiTrash2 } from "react-icons/fi";

function Expence() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: moment().format("YYYY-MM-DD"),
  });
  const [budgetStatus, setBudgetStatus] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
      setCategories([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.EXPENSES);
      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to fetch expenses");
      console.error(error);
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.EXPENSES, {
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      });

      const { budgetStatus: status } = response.data;
      setBudgetStatus(status);

      if (status.isOverBudget) {
        toast.error(
          `⚠️ Over Budget! ${status.categoryName}: ₹${status.newTotal.toFixed(
            2
          )} / ₹${status.budget.toFixed(2)}`,
          { duration: 4000 }
        );
      } else {
        toast.success(
          `✅ Within Budget! ${status.categoryName}: ₹${status.newTotal.toFixed(
            2
          )} / ₹${status.budget.toFixed(2)}`,
          { duration: 4000 }
        );
      }

      // Reset form
      setFormData({
        categoryId: "",
        amount: "",
        description: "",
        date: moment().format("YYYY-MM-DD"),
      });

      fetchExpenses();
    } catch (error) {
      toast.error("Failed to add expense");
      console.error(error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axiosInstance.delete(API_ENDPOINTS.EXPENSE_BY_ID(id));
        toast.success("Expense deleted!");
        fetchExpenses();
        setBudgetStatus(null);
      } catch (error) {
        toast.error("Failed to delete expense");
        console.error(error);
      }
    }
  };

  const selectedCategory = Array.isArray(categories)
    ? categories.find((cat) => cat._id === formData.categoryId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
          Add Expense
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Expense Form */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 sm:mb-6">New Expense</h2>
            <form onSubmit={handleAddExpense}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} (₹{cat.monthlyBudget})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="0.00"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  rows="3"
                  placeholder="Optional notes about this expense"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base sm:py-3"
              >
                Add Expense
              </button>
            </form>

            {/* Budget Status Alert */}
            {budgetStatus && (
              <div
                className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg ${
                  budgetStatus.isOverBudget
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {budgetStatus.isOverBudget ? (
                    <FiAlertCircle className="text-red-600 text-base sm:text-2xl flex-shrink-0 mt-0.5" />
                  ) : (
                    <FiCheckCircle className="text-green-600 text-base sm:text-2xl flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`font-semibold mb-1 sm:mb-2 ${
                        budgetStatus.isOverBudget
                          ? "text-red-800"
                          : "text-green-800"
                      }`}
                    >
                      {budgetStatus.isOverBudget
                        ? "⚠️ Over Budget!"
                        : "✅ Within Budget"}
                    </h3>
                    <p className="text-gray-700 text-xs sm:text-sm mb-1 sm:mb-2">
                      <strong>{budgetStatus.categoryName}</strong>
                    </p>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p>
                        Budget:{" "}
                        <strong>₹{budgetStatus.budget.toFixed(2)}</strong>
                      </p>
                      <p>
                        Previous Spending:{" "}
                        <strong>
                          ₹{budgetStatus.previousSpending.toFixed(2)}
                        </strong>
                      </p>
                      <p>
                        New Total:{" "}
                        <strong>₹{budgetStatus.newTotal.toFixed(2)}</strong>
                      </p>
                      <p
                        className={
                          budgetStatus.remaining >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        Remaining:{" "}
                        <strong>₹{budgetStatus.remaining.toFixed(2)}</strong>
                      </p>
                      <p>
                        Usage:{" "}
                        <strong>{budgetStatus.percentage.toFixed(1)}%</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Budget Preview */}
            {selectedCategory && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">
                  {selectedCategory.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Monthly Budget:{" "}
                  <strong>₹{selectedCategory.monthlyBudget.toFixed(2)}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 sm:mb-6">
              Recent Expenses
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No expenses yet
                </p>
              ) : (
                expenses
                  .slice()
                  .reverse()
                  .map((expense) => (
                    <div
                      key={expense._id || expense.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {expense.categoryName}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {expense.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {moment(expense.date).format("MMM DD, YYYY")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-lg font-bold text-gray-800">
                            ₹{expense.amount?.toFixed(2) || "0.00"}
                          </span>
                          <button
                            onClick={() =>
                              handleDeleteExpense(expense._id || expense.id)
                            }
                            className="text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg transition-colors"
                            title="Delete expense"
                          >
                            <FiTrash2 className="text-sm sm:text-base" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expence;
