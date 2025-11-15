import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const useCategoryStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        categories: [],
        loading: false,
        error: null,

        // Actions
        fetchCategories: async () => {
          set({ loading: true, error: null });
          try {
            const response = await axiosInstance.get("/categories");
            set({ categories: response.data, loading: false });
          } catch (error) {
            const errorMsg =
              error.response?.data?.error || "Failed to fetch categories";
            set({ error: errorMsg, loading: false });
            toast.error(errorMsg);
          }
        },

        addCategory: async (categoryData) => {
          set({ loading: true, error: null });
          try {
            const response = await axiosInstance.post(
              "/categories",
              categoryData
            );
            set((state) => ({
              categories: [...state.categories, response.data],
              loading: false,
            }));
            toast.success("Category created successfully");
            return response.data;
          } catch (error) {
            const errorMsg =
              error.response?.data?.error || "Failed to create category";
            set({ error: errorMsg, loading: false });
            toast.error(errorMsg);
            throw error;
          }
        },

        updateCategory: async (id, updates) => {
          set({ loading: true, error: null });
          try {
            const response = await axiosInstance.put(
              `/categories/${id}`,
              updates
            );
            set((state) => ({
              categories: state.categories.map((cat) =>
                cat._id === id ? response.data : cat
              ),
              loading: false,
            }));
            toast.success("Category updated successfully");
            return response.data;
          } catch (error) {
            const errorMsg =
              error.response?.data?.error || "Failed to update category";
            set({ error: errorMsg, loading: false });
            toast.error(errorMsg);
            throw error;
          }
        },

        deleteCategory: async (id) => {
          set({ loading: true, error: null });
          try {
            await axiosInstance.delete(`/categories/${id}`);
            set((state) => ({
              categories: state.categories.filter((cat) => cat._id !== id),
              loading: false,
            }));
            toast.success("Category deleted successfully");
          } catch (error) {
            const errorMsg =
              error.response?.data?.error || "Failed to delete category";
            set({ error: errorMsg, loading: false });
            toast.error(errorMsg);
            throw error;
          }
        },

        getCategoryById: (id) => {
          return get().categories.find((cat) => cat._id === id);
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: "category-storage",
        partialize: (state) => ({ categories: state.categories }),
      }
    ),
    { name: "CategoryStore" }
  )
);

export default useCategoryStore;
