/**
 * @file Header.jsx
 * @description Header component for the meeting application
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { LuCircleUserRound } from "react-icons/lu";
import Cookies from "js-cookie";

/**
 * Header component with navigation and user controls
 * @param {Object} props - Component props
 * @param {boolean} props.showMobileSideBar - Current state of mobile sidebar visibility
 * @param {Function} props.setShowMobileSideBar - Function to toggle mobile sidebar
 * @param {Function} props.onLogoutClick - Function to handle logout
 * @returns {React.Component} - Header component
 */
const Header = ({ showMobileSideBar, setShowMobileSideBar, onLogoutClick }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    try {
      const storedUserData = JSON.parse(
        localStorage.getItem("userData") || "{}"
      );
      if (storedUserData && (storedUserData.id || storedUserData._id)) {
        setUserData(storedUserData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  /**
   * Handle profile dropdown selection changes
   * @param {Object} event - Change event
   */
  const handleProfileAction = (event) => {
    const action = event.target.value;

    switch (action) {
      case "profile":
        navigate("/profile");
        break;
      case "logout":
        onLogoutClick();
        break;
      default:
        // Do nothing for default/current user option
        break;
    }

    // Reset dropdown to default after selection
    event.target.value = "";
  };

  /**
   * Toggle mobile sidebar visibility
   */
  const toggleMobileSidebar = () => {
    setShowMobileSideBar(!showMobileSideBar);
  };

  return (
    <div className="w-full h-[90px] flex justify-between items-center p-[20px] bg-white shadow-md">
      {/* Mobile Menu Toggle */}
      <div
        onClick={toggleMobileSidebar}
        className="block sm:hidden cursor-pointer font-bold text-xl z-50"
      >
        <IoIosMenu className="text-2xl" />
      </div>

      {/* Search area (placeholder for future functionality) */}
      <div className="relative hidden sm:block">
        {/* Search component can be added here */}
      </div>

      {/* User Profile & Actions */}
      <div className="flex space-x-6 items-center">
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 hover:rounded-lg">
          {userData?.image ? (
            <img
              src={userData.image}
              className="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
            />
          ) : (
            <LuCircleUserRound className="text-3xl text-gray-700" />
          )}

          <select
            className="outline-none p-2 text-lg bg-transparent cursor-pointer"
            onChange={handleProfileAction}
            value=""
          >
            <option value="" disabled>
              {userData?.fullName || "User"}
            </option>
            <option value="profile">Profile</option>
            <option value="logout" onClick={onLogoutClick}>
              Logout
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Header;
