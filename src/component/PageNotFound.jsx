import React from 'react'
import { Link } from "react-router-dom";
const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        The page you are looking for might have been removed or is temporarily
        unavailable.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-[#B71B36] text-white rounded-lg hover:bg-[#a01830] transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default PageNotFound