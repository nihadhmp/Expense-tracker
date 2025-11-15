import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axios";
import API_ENDPOINTS from "../../utils/apiPaths";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    monthlyBudget: "",
  });

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

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_ENDPOINTS.CATEGORIES, formData);
      toast.success("Category added successfully!");
      setShowAddModal(false);
      setFormData({ name: "", monthlyBudget: "" });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to add category");
      console.error(error);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        API_ENDPOINTS.CATEGORY_BY_ID(editingCategory._id || editingCategory.id),
        formData
      );
      toast.success("Category updated successfully!");
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: "", monthlyBudget: "" });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update category");
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This will also delete all related expenses.`
      )
    ) {
      try {
        await axiosInstance.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category");
        console.error(error);
      }
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      monthlyBudget: category.monthlyBudget,
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Budget Categories
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Manage your spending categories and monthly budgets
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            + Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm">Monthly Budget</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">
                  ₹{category.monthlyBudget?.toFixed(2) || "0.00"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleDeleteCategory(category._id, category.name)
                  }
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No categories yet. Create your first category!
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Food, Rent, Transport"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyBudget: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: "", monthlyBudget: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Category</h2>
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyBudget: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                    setFormData({ name: "", monthlyBudget: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
