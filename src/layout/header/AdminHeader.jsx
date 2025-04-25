// src/components/admin/layout/AdminHeader.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../redux/slices/adminAuthSlice';

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector(state => state.adminAuth);
  
  const handleLogout = () => {
    dispatch(logoutAdmin())
      .unwrap()
      .then(() => {
        navigate('/admin/login');
      });
  };
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin/dashboard" className="text-xl font-bold text-blue-600">
                Admin Portal
              </Link>
            </div>
            <nav className="ml-8 flex items-center space-x-4">
              <Link 
                to="/admin/dashboard" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/users" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Users
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-4">
                {admin?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;