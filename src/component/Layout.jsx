// src/components/Layout.js
import React, { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt, FaSignOutAlt, FaPlus, FaUser } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const Layout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const handleLogout = () => {
    // Clear authentication data
    Cookies.remove("authToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-[#1f2937] text-white ${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold">MeetingHub</h1>
          ) : (
            <h1 className="text-xl font-bold">MH</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white focus:outline-none"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 mt-6">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-3 hover:bg-[#374151] transition-colors"
          >
            <MdDashboard size={20} />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>

          <Link
            to="/meetings/create"
            className="flex items-center px-4 py-3 hover:bg-[#374151] transition-colors"
          >
            <FaPlus size={20} />
            {isSidebarOpen && <span className="ml-3">Create Meeting</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-gray-500 rounded-full p-2">
              <FaUser className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">{userData.name || "User"}</p>
                <p className="text-xs text-gray-400">{userData.email || ""}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#374151] rounded transition-colors"
          >
            <FaSignOutAlt size={16} />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
