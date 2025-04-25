// src/components/admin/dashboard/AdminDashboard.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
const AdminDashboard = () => {
    const { admin } = useSelector(state => state.adminAuth);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-blue-800 mb-2">Welcome</h2>
                    <p className="text-blue-700">
                        Hello, {admin?.name || 'Admin'}! You are logged in as an administrator.
                    </p>
                </div>

                <div className="bg-green-50 rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-green-800 mb-2">Users</h2>
                    <p className="text-green-700 mb-4">Manage user accounts and permissions.</p>
                    <Link
                        to="/admin/users"
                        className="text-sm text-green-800 font-medium hover:underline"
                    >
                        View All Users →
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;