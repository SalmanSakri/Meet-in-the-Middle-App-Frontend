// ForgetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AuthImg from "../../../assets/auth.svg";
import { requestPasswordReset, resetError, clearPasswordResetData } from "../../../redux/slices/authSlice";

/**
 * ForgetPassword Component
 * Handles password reset request by sending OTP to user's email using Redux
 */
const ForgetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { 
    isLoading, 
    error, 
    passwordResetRequested, 
    passwordResetEmail, 
    passwordResetUserId 
  } = useSelector(
    (state) => state.auth
  );

  // Form state
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  // Clear any existing password reset data when component mounts
  useEffect(() => {
    dispatch(clearPasswordResetData());
  }, [dispatch]);

  /**
   * Updates email state when input field changes
   * @param {Object} e - Event object
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when field is modified
    setLocalError("");
    if (error) dispatch(resetError());
  };

  /**
   * Validates email format using improved regex
   * @returns {boolean} - True if validation passes, false otherwise
   */
  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  /**
   * Handles form submission for password reset
   * Dispatches Redux action to initiate reset flow with OTP
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    if (!validateEmail()) {
      return;
    }

    // Clear previous errors
    setLocalError("");
    if (error) dispatch(resetError());

    // Dispatch password reset request action
    try {
      await dispatch(requestPasswordReset(email)).unwrap();
    } catch (err) {
      console.error("Password reset request error:", err);
      setLocalError(typeof err === 'string' ? err : "Failed to send reset link");
    }
  };

  // Effect to navigate after successful password reset request
  useEffect(() => {
    if (passwordResetRequested && passwordResetEmail && passwordResetUserId) {
      toast.success("OTP sent successfully to your email!");
      // Pass email and userId in the URL for better UX if Redux state is lost
      navigate(`/create-password?email=${encodeURIComponent(passwordResetEmail)}&userId=${passwordResetUserId}`);
    }
  }, [passwordResetRequested, passwordResetEmail, passwordResetUserId, navigate]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Right Side - Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8">
        <div className="max-w-md w-full">
          {/* Logo/Illustration */}
          <div className="flex justify-center mb-6">
            <img
              src={AuthImg}
              alt="Login Illustration"
              className="h-40 w-auto sm:h-48"
              loading="lazy"
            />
          </div>

          {/* Form Header */}
          <div className="w-full mb-6 text-center">
            <h2 className="text-2xl font-semibold">Forgot Password?</h2>
            <p className="text-gray-500 mt-2">
              Please enter your registered email to receive a password reset
              code
            </p>
          </div>

          {/* Display error if any */}
          {(localError || error) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
              {localError || error}
            </div>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="w-full mb-4">
              <label 
                htmlFor="email"
                className="block font-bold text-gray-700 mb-2 text-sm sm:text-base">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="example@domain.com"
                className={`w-full p-3 border ${
                  localError || error ? "border-red-500" : "border-gray-300"
                } rounded-lg bg-[#FFFAFB] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50`}
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#B71B36] text-white py-3 rounded-lg mb-4 hover:bg-[#a01830] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 disabled:bg-[#d88a97] disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-[#B71B36] hover:underline font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Left Side - Image Section (Hidden on Mobile) */}
      <div className="hidden md:block md:w-1/2">
        <div className="h-full bg-[#f5f5f5] flex items-center justify-center">
          {/* Password reset illustration/info */}
          <div className="max-w-md text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-gray-600">
              We'll send you a one-time password (OTP) to verify your identity.
              After verification, you'll be able to create a new password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;