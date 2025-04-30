
import React, { useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { IoIosMenu } from "react-icons/io";
import { LuCircleUserRound } from "react-icons/lu";
import { logoutUser } from '../../redux/slices/authSlice';
/**
 * Header component with navigation and user controls
 * @param {Object} props - Component props
 * @param {boolean} props.showMobileSideBar - Current state of mobile sidebar visibility
 * @param {Function} props.setShowMobileSideBar - Function to toggle mobile sidebar
 * @param {Function} props.onLogoutClick - Function to handle logout
 * @returns {React.Component} - Header component
 */
const Header = ({ showMobileSideBar, setShowMobileSideBar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);


  }, []);


  /**
   * Toggle mobile sidebar visibility
   */
  const toggleMobileSidebar = () => {
    setShowMobileSideBar(!showMobileSideBar);
  };

  // Get the display name in correct order of priority
  const getDisplayName = () => {
    return userData?.fullName || userData?.name || "User";
  };
  


  const handleProfileAction = (value) => {
    if (value === "logout") {
      dispatch(logoutUser()).then(() => {
        navigate("/login");
      });
    } else if (value === "profile") {
      navigate("/user/profile");
    }
    setIsOpen(false);
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
      {isSidebarOpen && (
        <div className="hidden sm:block mr-4">
          <p className="text-xl">
            <span className=" font-bold mr-2">Hii</span>
            <span className="font-medium">{getDisplayName()}</span>

          </p>
          {/* <p className="text-black ">{userData?.email || ""}</p> */}
        </div>
      )}
      {/* User Profile & Actions */}
      <div className="flex items-center">
        {/* User info - visible based on sidebar state */}


        {/* User avatar and dropdown */}
        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 hover:rounded-lg">
          {userData?.image ? (
            <img
              src={userData.image}
              className="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
            />
          ) : (
            <LuCircleUserRound className="text-3xl text-gray-700" />
          )}

<div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 bg-transparent outline-none cursor-pointer"
      >
        {userData?.email || "Hi"}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 bg-white border rounded shadow-md">
          <button
            onClick={() => handleProfileAction("profile")}
            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            Profile
          </button>
          <button
            onClick={() => handleProfileAction("logout")}
            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
