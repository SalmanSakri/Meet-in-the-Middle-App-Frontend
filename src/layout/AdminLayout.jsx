// src/components/admin/layout/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './header/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;