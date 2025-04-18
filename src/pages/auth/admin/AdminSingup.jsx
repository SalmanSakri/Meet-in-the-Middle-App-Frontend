// src/pages/auth/admin/AdminRegister.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../../../services/adminApi";

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      dispatch({
        type: "auth/registerAdmin/rejected",
        payload: { message: "Name and email are required" },
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      dispatch({
        type: "auth/registerAdmin/rejected",
        payload: { message: "Please enter a valid email address" },
      });
      return;
    }

    try {
      const response = await dispatch(useRegisterMutation(formData)).unwrap();
      setSuccess(response.message || "Registration successful");
      setFormData({ name: "", email: "" });

      // Navigate after 3 seconds
      setTimeout(() => {
        navigate("/admin-login");
      }, 3000);
    } catch (err) {
      // Error is handled by the Redux slice
    }
  };

  return (
    <div className="mt-20 flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register New Admin
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error.message}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            <p className="text-sm mt-1">Redirecting to login page...</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter admin name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isLoading ? "Registering..." : "Register Admin"}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/admin-login"
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
