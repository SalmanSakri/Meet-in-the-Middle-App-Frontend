/**
 * @file Login.jsx
 * @description Login component with form validation, Redux integration, and optimized rendering
 * @version 1.3.0
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, resetError } from "../../redux/slices/authSlice";
import { PiEye, PiEyeSlash } from "react-icons/pi";
// Import toast utilities like in SignUp component
import { showSuccess, showInfo, showError } from "../../utils/toastUtils";
import LoadingSpinner from "../../component/LoadingSpinner";
// Lazy load images for better performance
import LoginImage from "../../assets/login.svg";
import AuthImg from "../../assets/auth.svg";

// Email validation regex - compiled once for reuse
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Login component for user authentication
 * Uses Redux for state management and optimized rendering
 *
 * @component
 * @returns {JSX.Element} Login form component
 */
const Login = () => {
  // Hooks for navigation and dispatch
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select only needed parts of state to prevent unnecessary rerenders
  const { isLoading, error, isAuthenticated, otpVerificationRequired } =
    useSelector(
      (state) => ({
        isLoading: state.auth.isLoading,
        error: state.auth.error,
        isAuthenticated: state.auth.isAuthenticated,
        otpVerificationRequired: state.auth.otpVerificationRequired,
      }),
      // Use shallow comparison for performance
      (prev, next) =>
        prev.isLoading === next.isLoading &&
        prev.error === next.error &&
        prev.isAuthenticated === next.isAuthenticated &&
        prev.otpVerificationRequired === next.otpVerificationRequired
    );

  // Form state with single initialization
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /**
   * Effect to handle navigation after successful authentication
   * and display error messages
   */
  useEffect(() => {
    // Reset error on component mount
    dispatch(resetError());
    
    // Navigation logic after authentication
    if (isAuthenticated) {
      // If OTP verification is required, navigate to OTP page
      if (otpVerificationRequired) {
        navigate("/otp-verification");
        showInfo("Please verify your account with the OTP code");
      } else {
        // Otherwise, navigate to dashboard
        navigate("/layout");
        showSuccess("Login successful!");
      }
    }
  }, [dispatch, isAuthenticated, otpVerificationRequired, navigate]);

  /**
   * Effect to handle error display separately for better error management
   */
  useEffect(() => {
    if (error && submitAttempted) {
      showError(error);
    }
  }, [error, submitAttempted]);

  /**
   * Updates form data when input fields change
   * Uses event delegation for better performance
   *
   * @param {Object} e - Event object
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Update form data using functional update
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error for this field when modified
    setFormErrors((prevErrors) =>
      prevErrors[name] ? { ...prevErrors, [name]: "" } : prevErrors
    );
  }, []);

  /**
   * Toggle password visibility
   * Simple state toggle with memoization
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Validates form input fields
   * Moved validation logic to a separate memoized function
   * for better performance and reusability
   *
   * @returns {boolean} - True if validation passes, false otherwise
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Email validation - optimized with early returns
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation - quick check
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    // Set validation errors
    setFormErrors(newErrors);
    return isValid;
  }, [formData]);

  /**
   * Handles form submission for user login
   * Dispatches login action to Redux
   *
   * @param {Object} e - Event object
   */
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitAttempted(true);

      // Validate form before submission
      if (!validateForm()) {
        return;
      }
      
      try {
        // Dispatch login action to redux
        await dispatch(loginUser(formData)).unwrap();
        // Navigation is handled by useEffect
      } catch (err) {
        // Make sure we display the error message even if it's caught here
        console.error("Login dispatch error:", err);
        if (err?.message) {
          showError(err.message);
        }
      }
    },
    [formData, dispatch, validateForm]
  );

  // Memoized error message display - similar to SignUp component
  const ErrorDisplay = useMemo(() => {
    // Only show redux errors here, form validation errors are shown inline
    if (error && submitAttempted) {
      return (
        <div
          className="bg-red-50 text-red-600 p-3 rounded-lg mb-2 text-center"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      );
    }
    return null;
  }, [error, submitAttempted]);

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image Section with lazy loading */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-[#fdf5f6]">
        <img
          src={LoginImage}
          alt="Login Background"
          className="max-w-sm w-full object-contain"
          loading="lazy"
          fetchpriority="low"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-16 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Illustration */}
          <div className="flex justify-center mb-1">
            <img
              src={AuthImg}
              alt="Login Illustration"
              className="h-40 w-48"
              loading="lazy"
            />
          </div>

          <h1 className="text-2xl font-semibold text-center mb-1">
            Login to User Panel
          </h1>
          <p className="text-gray-500 mb-1 text-center">
            Please enter your email and password to continue
          </p>

          {/* Display error messages from Redux - Now using ErrorDisplay component */}
          {ErrorDisplay}

          {/* Login Form with improved validation and accessibility */}
          <form onSubmit={handleLogin} noValidate>
            {/* Email field */}
            <div className="mb-1">
              <label
                htmlFor="email"
                className="block font-bold text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="example@domain.com"
                className={`w-full p-3 border ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg bg-[#FFFAFB] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50`}
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? "email-error" : undefined}
              />
              {formErrors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1 mb-1">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password field with toggle visibility */}
            <div className="mb-1 relative">
              <label
                htmlFor="password"
                className="block font-bold text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  className={`w-full p-3 border ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 bg-[#FFFAFB] focus:ring-[#B71B36]/50`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  aria-invalid={!!formErrors.password}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                      <PiEye size={24} aria-hidden="true" />
                 
                  ) : (
                     <PiEyeSlash size={24} aria-hidden="true" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p
                  id="password-error"
                  className="text-red-500 text-sm mt-1 mb-1"
                >
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end mb-1">
              <Link
                to="/forget-password"
                className="text-[#B71B36] hover:underline text-sm font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#B71B36] hover:bg-[#A01830] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 transition"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? <LoadingSpinner text="Logging in..." /> : "Login"}
            </button>

            {/* Link to Signup */}
            <div className="mt-1 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/"
                  className="text-[#B71B36] hover:underline font-semibold"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;