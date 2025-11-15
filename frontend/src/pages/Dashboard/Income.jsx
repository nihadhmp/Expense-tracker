import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axios";
import API_ENDPOINTS from "../../utils/apiPaths";
import moment from "moment";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

function MonthlySummary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    year: moment().year(),
    month: moment().month(),
  });
  const [loading, setLoading] = useState(false);

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const fetchSummary = async (year, month) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.MONTHLY_SUMMARY(year, month)
      );
      setSummary(response.data);
    } catch (error) {
      toast.error("Failed to fetch summary");
      console.error(error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate.year, selectedDate.month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleMonthChange = (direction) => {
    const newDate = moment(
      `${selectedDate.year}-${selectedDate.month + 1}`,
      "YYYY-M"
    );
    if (direction === "prev") {
      newDate.subtract(1, "month");
    } else {
      newDate.add(1, "month");
    }
    setSelectedDate({
      year: newDate.year(),
      month: newDate.month(),
    });
  };

  const monthName = moment().month(selectedDate.month).format("MMMM");

  // Check if selected month is current month
  const isCurrentMonth =
    selectedDate.year === moment().year() &&
    selectedDate.month === moment().month();

  // Prepare data for charts
  const barChartData =
    summary?.categories.map((cat) => ({
      name: cat.categoryName,
      Budget: cat.budget,
      Spent: cat.spent,
    })) || [];

  const pieChartData =
    summary?.categories
      .filter((cat) => cat.spent > 0)
      .map((cat) => ({
        name: cat.categoryName,
        value: cat.spent,
      })) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Monthly Summary
          </h1>

          {/* Month Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white p-4 rounded-xl shadow-md">
            <FiCalendar className="text-blue-600 text-xl sm:text-2xl" />
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
              <button
                onClick={() => handleMonthChange("prev")}
                className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                ← Prev
              </button>
              <div className="flex-1 sm:flex-none text-center min-w-[180px]">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {monthName} {selectedDate.year}
                </h2>
              </div>
              {!isCurrentMonth && (
                <button
                  onClick={() => handleMonthChange("next")}
                  className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading summary...</p>
          </div>
        ) : summary ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TbCurrencyRupee className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Budget</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      ₹{summary.totals.budget?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <FiTrendingUp className="text-orange-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Spent</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      ₹{summary.totals.spent?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        summary.totals.percentage > 100
                          ? "bg-red-600"
                          : "bg-orange-600"
                      }`}
                      style={{
                        width: `${Math.min(summary.totals.percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {summary.totals.percentage?.toFixed(1) || "0.0"}% of budget
                    used
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`${
                      summary.totals.remaining >= 0
                        ? "bg-green-100"
                        : "bg-red-100"
                    } p-3 rounded-lg`}
                  >
                    <FiTrendingDown
                      className={`${
                        summary.totals.remaining >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      } text-2xl`}
                    />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Remaining</p>
                    <h3
                      className={`text-2xl font-bold ${
                        summary.totals.remaining >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹
                      {Math.abs(summary.totals.remaining)?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                </div>
                {summary.totals.remaining < 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    Over budget by ₹
                    {Math.abs(summary.totals.remaining)?.toFixed(2) || "0.00"}
                  </p>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Bar Chart */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  Budget vs Spending
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "14px" }} />
                    <Bar dataKey="Budget" fill="#3b82f6" />
                    <Bar dataKey="Spent" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  Spending Distribution
                </h3>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                    No spending data for this month
                  </div>
                )}
              </div>
            </div>

            {/* Category Details Table */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Category Breakdown
              </h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">
                        Category
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">
                        Budget
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">
                        Spent
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">
                        Remaining
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">
                        %
                      </th>
                      <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.categories.map((category) => (
                      <tr
                        key={category.categoryId || category._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">
                            {category.categoryName}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-700">
                          ₹{category.budget?.toFixed(2) || "0.00"}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-800">
                          ₹{category.spent?.toFixed(2) || "0.00"}
                        </td>
                        <td
                          className={`text-right py-3 px-4 font-semibold ${
                            category.remaining >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ₹{category.remaining?.toFixed(2) || "0.00"}
                        </td>
                        <td className="text-right py-3 px-4">
                          {category.percentage?.toFixed(1) || "0.0"}%
                        </td>
                        <td className="text-center py-3 px-4">
                          {category.isOverBudget ? (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              Over Budget
                            </span>
                          ) : category.percentage > 80 ? (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                              Warning
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              On Track
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Get Started with Expense Tracking
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Create categories and add expenses to see your monthly spending
              report.
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
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlySummary;
