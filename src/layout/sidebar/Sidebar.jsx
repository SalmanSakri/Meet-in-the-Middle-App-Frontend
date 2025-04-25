import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaArrowLeft } from "react-icons/fa";
import { IoCalendarOutline, IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { TbMessages } from "react-icons/tb";
import { IoMdCreate } from "react-icons/io";
import { BiMap } from "react-icons/bi";
import { RiAdminFill } from "react-icons/ri";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

/**
 * Sidebar component with navigation links for the meeting application
 * @returns {React.Component} - Sidebar component
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { currentMeeting } = useSelector((state) => state.meetings);

  const handleLogout = () => {
    // Clear authentication data
    Cookies.remove("authToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/"), 500);
  };

  /**
   * Toggle sidebar collapsed state
   */
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`${
          collapsed ? "w-16" : "w-64"
        } h-screen hidden sm:block transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex border h-20 border-b-black justify-between items-center bg-blue-500 text-white px-5">
          <h1
            className={`${
              collapsed ? "hidden" : "block"
            } text-lg flex flex-col py-2`}
          >
            <span>Meeting Pro</span>
          </h1>
          <span
            onClick={toggleCollapsed}
            className={`cursor-pointer font-bold text-xl hidden sm:block transition-transform duration-300 ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          >
            <FaArrowLeft />
          </span>
        </div>

        {/* Navigation Links */}
        <div
          className={`${collapsed ? "mx-2" : "mx-4"} my-4 bg-white space-y-3`}
        >
          {/* Dashboard Link */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex cursor-pointer space-x-3 items-center text-base shadow-sm rounded-lg px-3 py-2 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <MdDashboard />
            </span>
            <p className={`${collapsed ? "hidden" : "block"} truncate`}>
              Dashboard
            </p>
          </NavLink>

          {/* Meetings Link */}
          {/* <NavLink
            to="/meetings"
            className={({ isActive }) =>
              `flex cursor-pointer space-x-3 items-center text-base shadow-sm rounded-lg px-3 py-2 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <IoCalendarOutline />
            </span>
            <p className={`${collapsed ? "hidden" : "block"} truncate`}>
              Meetings
            </p>
          </NavLink> */}

          {/* CreateMeeting Link */}
          <NavLink
            to="/create-meeting"
            className={({ isActive }) =>
              `flex cursor-pointer space-x-3 items-center text-base shadow-sm rounded-lg px-3 py-2 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <IoMdCreate />
            </span>
            <p className={`${collapsed ? "hidden" : "block"} truncate`}>
              CreateMeeting
            </p>
          </NavLink>
          {/* Messages Link */}
          {/* <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex cursor-pointer space-x-3 items-center text-base shadow-sm rounded-lg px-3 py-2 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <TbMessages />
            </span>
            <p className={`${collapsed ? "hidden" : "block"} truncate`}>
              Messages
            </p>
          </NavLink> */}

          {/* Admin deshbord */}
          <NavLink
            to="/admin/singup"
            className={({ isActive }) =>
              `flex cursor-pointer space-x-3 items-center text-base shadow-sm rounded-lg px-3 py-2 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <RiAdminFill />
            </span>
            <p className={`${collapsed ? "hidden" : "block"} truncate`}>
              Admin Dashboard
            </p>
          </NavLink>

          {/* Logout Button */}
          <div
            onClick={handleLogout}
            className="flex cursor-pointer space-x-3 items-center text-base shadow-sm rounded-lg px-3 py-2 font-medium border border-gray-300 transition-all duration-200 bg-gray-50 text-blue-500 hover:bg-red-50 hover:text-red-500"
          >
            <span className="text-xl">
              <IoLogOut />
            </span>
            <p className={`${collapsed ? "hidden" : "block"} truncate`}>
              Logout
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="w-16 h-screen block sm:hidden bg-white shadow-md">
        <div className="h-12 bg-blue-500 flex items-center justify-center text-white">
          <span className="font-bold text-lg">MPP</span>
        </div>
        <div className="p-2 bg-white space-y-3">
          {/* Mobile Dashboard Link */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex cursor-pointer items-center justify-center text-base shadow-sm rounded-lg p-3 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <MdDashboard />
            </span>
          </NavLink>

          {/* Mobile Meetings Link */}
          <NavLink
            to="/meetings"
            className={({ isActive }) =>
              `flex cursor-pointer items-center justify-center text-base shadow-sm rounded-lg p-3 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <IoCalendarOutline />
            </span>
          </NavLink>

          {/* Mobile Location Link */}
          <NavLink
            to="/location-suggestions"
            className={({ isActive }) =>
              `flex cursor-pointer items-center justify-center text-base shadow-sm rounded-lg p-3 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <BiMap />
            </span>
          </NavLink>

          {/* Mobile Messages Link */}
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex cursor-pointer items-center justify-center text-base shadow-sm rounded-lg p-3 font-medium border 
              border-gray-300 transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "bg-gray-50 text-blue-500 hover:bg-blue-50"
              }`
            }
          >
            <span className="text-xl">
              <TbMessages />
            </span>
          </NavLink>

          {/* Mobile Logout Button */}
          <div
            onClick={handleLogout}
            className="flex cursor-pointer items-center justify-center text-base shadow-sm rounded-lg p-3 font-medium border border-gray-300 transition-all duration-200 bg-gray-50 text-blue-500 hover:bg-red-50 hover:text-red-500"
          >
            <span className="text-xl">
              <IoLogOut />
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
