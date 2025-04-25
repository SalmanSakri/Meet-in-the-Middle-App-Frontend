// src/components/admin/auth/PrivateAdminRoute.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { loadAdmin } from "../redux/slices/adminAuthSlice"

const PrivateAdminRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, isLoading } = useSelector(state => state.adminAuth);
  
  useEffect(() => {
    if (token && !isAuthenticated && !isLoading) {
      dispatch(loadAdmin());
    }
  }, [token, isAuthenticated, isLoading, dispatch]);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Render the protected routes
  return <Outlet />;
};

export default PrivateAdminRoute;