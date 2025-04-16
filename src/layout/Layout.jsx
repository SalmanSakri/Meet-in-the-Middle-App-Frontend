/**
 * @file Layout.jsx
 * @description Main layout component for the meeting application
 */
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import { useLocation } from "react-router-dom";
// import LogoutPopup from "../component/Auth/LogoutPopup";

/**
 * Layout component that wraps all pages with common UI elements
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in layout
 * @returns {React.Component} - Layout component
 */
const Layout = ({ children }) => {
  const [showMobileSideBar, setShowMobileSideBar] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const location = useLocation();

  // Hide mobile sidebar on route change and on small screens
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setShowMobileSideBar(false);
    }
  }, [location]);

  /**
   * Handle logout button click
   */
  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  /**
   * Handle close of logout popup
   */
  const handleCloseLogoutPopup = () => {
    setShowLogoutPopup(false);
  };

  return (
    <div className="flex h-screen relative">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <Sidebar onLogoutClick={handleLogoutClick} />
      </div>

      {/* Right Side (Main Content) */}
      <div className="relative flex flex-col w-full min-h-screen">
        {/* Mobile Sidebar - Only shown when toggled */}
        {showMobileSideBar && (
          <div className="absolute left-0 top-[90px] block sm:hidden z-50">
            <Sidebar onLogoutClick={handleLogoutClick} />
          </div>
        )}

        {/* Header */}
        <Header
          setShowMobileSideBar={setShowMobileSideBar}
          showMobileSideBar={showMobileSideBar}
          onLogoutClick={handleLogoutClick}
        />

        {/* Main Content Area */}
        <div className="relative p-3 w-full flex-grow overflow-auto bg-gray-100">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default Layout;
