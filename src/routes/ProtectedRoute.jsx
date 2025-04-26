import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuthStatus } from "../redux/slices/authSlice";

/**
 * ProtectedRoute component that guards routes requiring authentication
 * Integrates with Redux authentication state and handles redirects
 */
const ProtectedRoute = ({ redirectPath = "/login" }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  // Verify authentication status when component mounts
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to={redirectPath} replace />;
  }

  // If user has specific roles that need to be checked, you can add that logic here
  // For example, if only admin users should access certain routes

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;