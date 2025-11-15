import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const useExpenseStore = create(
  devtools(
    (set, get) => ({
      // State
      expenses: [],
      loading: false,
      error: null,

      // Actions
      fetchExpenses: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters.year) params.append("year", filters.year);
          if (filters.month !== undefined)
            params.append("month", filters.month);
          if (filters.categoryId)
            params.append("categoryId", filters.categoryId);

          const response = await axiosInstance.get(
            `/expenses?${params.toString()}`
          );
          set({ expenses: response.data, loading: false });
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to fetch expenses";
          set({ error: errorMsg, loading: false });
          toast.error(errorMsg);
        }
      },

      addExpense: async (expenseData) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post("/expenses", expenseData);
          const newExpense = response.data.expense;
          const budgetStatus = response.data.budgetStatus;

          set((state) => ({
            expenses: [...state.expenses, newExpense],
            loading: false,
          }));

          // Show budget status notification
          if (budgetStatus.isOverBudget) {
            toast.error(
              `⚠️ ${budgetStatus.categoryName} is over budget! Spent: ₹${budgetStatus.newTotal}`,
              { duration: 5000 }
            );
          } else if (budgetStatus.percentage > 80) {
            toast(
              `⚠️ Warning: ${
                budgetStatus.categoryName
              } is at ${budgetStatus.percentage.toFixed(1)}% of budget`,
              { duration: 4000 }
            );
          } else {
            toast.success("Expense added successfully");
          }

          return response.data;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to add expense";
          set({ error: errorMsg, loading: false });
          toast.error(errorMsg);
          throw error;
        }
      },

      updateExpense: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.put(`/expenses/${id}`, updates);
          set((state) => ({
            expenses: state.expenses.map((exp) =>
              exp._id === id || exp.id === id ? response.data : exp
            ),
            loading: false,
          }));
          toast.success("Expense updated successfully");
          return response.data;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to update expense";
          set({ error: errorMsg, loading: false });
          toast.error(errorMsg);
          throw error;
        }
      },

      deleteExpense: async (id) => {
        set({ loading: true, error: null });
        try {
          await axiosInstance.delete(`/expenses/${id}`);
          set((state) => ({
            expenses: state.expenses.filter(
              (exp) => exp._id !== id && exp.id !== id
            ),
            loading: false,
          }));
          toast.success("Expense deleted successfully");
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to delete expense";
          set({ error: errorMsg, loading: false });
          toast.error(errorMsg);
          throw error;
        }
      },

      getExpenseById: (id) => {
        return get().expenses.find((exp) => exp._id === id || exp.id === id);
      },

      clearError: () => set({ error: null }),
    }),
    { name: "ExpenseStore" }
  )
);

export default useExpenseStore;
