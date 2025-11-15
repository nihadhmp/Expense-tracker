import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiDollarSign,
  FiFolder,
  FiPieChart,
  FiUser,
  FiX,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

function DashboardLayout() {
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Get user data from localStorage
  const getUserData = () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return { name: "User", email: "user@example.com" };
  };

  const [userData] = useState(getUserData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Home", exact: true },
    {
      path: "/dashboard/expenses",
      icon: TbCurrencyRupee,
      label: "Add Expense",
    },
    { path: "/dashboard/categories", icon: FiFolder, label: "Categories" },
    { path: "/dashboard/summary", icon: FiPieChart, label: "Monthly Report" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl"></span>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                Expense Tracker
              </h1>
            </div>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto justify-center flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <item.icon className="text-lg sm:text-xl" />
                  <span className="hidden xs:inline sm:inline">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
            {/* Profile Icon */}
            <div className="relative">
              <button
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <FiUser className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50"
          onClick={() => setShowProfilePopup(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
              <button
                onClick={() => setShowProfilePopup(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="flex flex-col items-center">
              {/* Profile Image */}
              <div className="mb-4">
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {userData.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Details */}
              <div className="w-full space-y-4">
                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500 font-medium">
                    Name
                  </label>
                  <p className="text-lg text-gray-800 font-semibold">
                    {userData.name}
                  </p>
                </div>

                <div className="border-b pb-3">
                  <label className="text-sm text-gray-500 font-medium">
                    Email
                  </label>
                  <p className="text-lg text-gray-800">{userData.email}</p>
                </div>

                <div className="pb-3">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
