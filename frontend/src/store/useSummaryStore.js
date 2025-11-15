import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const useSummaryStore = create(
  devtools(
    (set) => ({
      // State
      summary: null,
      loading: false,
      error: null,

      // Actions
      fetchMonthlySummary: async (year, month) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.get(`/summary/${year}/${month}`);
          set({ summary: response.data, loading: false });
          return response.data;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to fetch summary";
          set({ error: errorMsg, loading: false });
          toast.error(errorMsg);
        }
      },

      fetchCurrentSummary: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.get("/summary/current");
          set({ summary: response.data, loading: false });
          return response.data;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to fetch current summary";
          set({ error: errorMsg, loading: false });
          toast.error(errorMsg);
        }
      },

      clearError: () => set({ error: null }),

      clearSummary: () => set({ summary: null }),
    }),
    { name: "SummaryStore" }
  )
);

export default useSummaryStore;
