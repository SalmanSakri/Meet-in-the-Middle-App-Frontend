// CreatePassword.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, resetError, resendOTP, clearPasswordResetData } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import AuthImage from "../../../assets/auth.svg";

/**
 * CreatePassword Component
 * Handles password reset flow with OTP verification
 */
const CreatePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Create ref for first OTP input for focus management
  const firstOtpRef = useRef(null);
  
  // Get auth state from Redux
  const { 
    isLoading, 
    error, 
    passwordResetSuccess,
    passwordResetUserId,
    passwordResetEmail
  } = useSelector((state) => state.auth);

  // Form state
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password validation state
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  /**
   * Effect to redirect after successful password reset
   */
  useEffect(() => {
    if (passwordResetSuccess) {
      toast.success("Password reset successful! Please login with your new password.");
      // Clear sensitive data before redirecting
      dispatch(clearPasswordResetData());
      navigate("/login");
    }
  }, [passwordResetSuccess, navigate, dispatch]);

  /**
   * Check if we have the necessary data to reset password
   * Either from Redux state or URL query parameters
   */
  useEffect(() => {
    // Try to get data from URL query params if missing in Redux state
    const searchParams = new URLSearchParams(location.search);
    const userIdFromUrl = searchParams.get("userId");
    const emailFromUrl = searchParams.get("email");
    
    if (!passwordResetUserId && !userIdFromUrl) {
      toast.error("Missing information to reset password");
      navigate("/forget-password");
      return;
    }
    
    // Focus first OTP input when component mounts
    if (firstOtpRef.current) {
      setTimeout(() => firstOtpRef.current.focus(), 100);
    }
    
    // Cleanup function to clear password reset data when unmounting
    return () => {
      if (passwordResetSuccess) {
        dispatch(clearPasswordResetData());
      }
    };
  }, [passwordResetUserId, passwordResetEmail, navigate, location.search, dispatch]);

  /**
   * Countdown timer for OTP resend cooldown
   */
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  /**
   * Reset OTP fields and focus on first input
   * @param {boolean} shouldFocus - Whether to focus the first input
   */
  const resetOtpFields = (shouldFocus = true) => {
    setOtp(Array(6).fill(""));
    if (shouldFocus && firstOtpRef.current) {
      setTimeout(() => {
        firstOtpRef.current.focus();
      }, 10);
    }
  };

  /**
   * Handle OTP input change
   * @param {number} index - OTP digit index
   * @param {string} value - New value
   */
  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  /**
   * Handle key press in OTP fields
   * @param {number} index - Field index
   * @param {Object} e - Key event
   */
  const handleKeyDown = (index, e) => {
    // On backspace, go to previous field if current is empty
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          // Optionally clear the previous field
          const newOtp = [...otp];
          newOtp[index - 1] = "";
          setOtp(newOtp);
        }
      } else if (otp[index] && index >= 0) {
        // Clear current field on backspace when it has content
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    
    // On arrow left/right, navigate between fields
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  /**
   * Handle pasting OTP code
   * @param {Object} e - Paste event
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // If it's a 6-digit number, fill all fields
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last field
      document.getElementById('otp-5').focus();
    }
  };

  /**
   * Check password strength and update indicators
   * @param {string} newPassword - Password to validate
   */
  const checkPasswordStrength = (newPassword) => {
    setPasswordStrength({
      length: newPassword.length >= 6,
      hasNumber: /\d/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    });
  };

  /**
   * Handle password input change
   * @param {Object} e - Event object
   */
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
    
    // Clear error when field is modified
    if (localError) setLocalError("");
    if (error) dispatch(resetError());
  };

  /**
   * Handle confirm password input change
   * @param {Object} e - Event object
   */
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    
    // Clear error when field is modified
    if (localError) setLocalError("");
    if (error) dispatch(resetError());
  };

  /**
   * Validate the reset password form
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateForm = () => {
    // Clear previous errors
    setLocalError("");
    
    // Check OTP
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setLocalError("Please enter all 6 OTP digits");
      return false;
    }

    // Check password
    if (!password) {
      setLocalError("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return false;
    }
    
    if (!/\d/.test(password)) {
      setLocalError("Password must contain at least one number");
      return false;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setLocalError("Password must contain at least one special character");
      return false;
    }

    // Check password match
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }

    return true;
  };

  /**
   * Request a new OTP code
   */
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    const userId = passwordResetUserId || new URLSearchParams(location.search).get("userId");
    if (!userId) {
      setLocalError("Missing user information. Please try again from the password reset page.");
      return;
    }
    
    setResendDisabled(true);
    setLocalError("");
    if (error) dispatch(resetError());
    
    try {
      await dispatch(resendOTP({
        userId: userId,
        purpose: "password_reset" // Specific purpose for password reset
      })).unwrap();
      
      toast.success("A new verification code has been sent to your email.");
      resetOtpFields(true);
      
      // Start cooldown timer (60 seconds)
      setCountdown(60);
    } catch (err) {
      console.error("Error resending OTP:", err);
      setLocalError(typeof err === 'string' ? err : "Failed to resend verification code");
      setResendDisabled(false);
    }
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setLocalError("");
    if (error) dispatch(resetError());
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    const userId = passwordResetUserId || new URLSearchParams(location.search).get("userId");
    if (!userId) {
      setLocalError("Missing user information. Please try again from the password reset page.");
      return;
    }

    // Dispatch reset password action
    try {
      await dispatch(resetPassword({
        userId: userId,
        otp: otp.join(""),
        newPassword: password
      })).unwrap();
    } catch (err) {
      console.error("Password reset error:", err);
      setLocalError(typeof err === 'string' ? err : "Password reset failed");
    }
  };

  // Get display email (masked or full)
  const displayEmail = passwordResetEmail || new URLSearchParams(location.search).get("email") || "";
  const maskedEmail = displayEmail ? 
    `${displayEmail.substring(0, 3)}...${displayEmail.substring(displayEmail.indexOf('@') || 0)}` : 
    "your email";

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Form side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">Create New Password</h2>
            <p className="text-gray-500 mt-2">
              Enter the verification code sent to {maskedEmail}
            </p>
          </div>

          {/* Display error if any */}
          {(localError || error) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* OTP Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="otp-0" className="block font-bold text-gray-700">
                  Verification Code
                </label>
                <button 
                  type="button"
                  onClick={() => resetOtpFields()}
                  className="text-sm text-[#B71B36] hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50"
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={index === 0 ? firstOtpRef : null}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                ))}
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className={`text-sm text-[#B71B36] hover:underline font-medium ${
                    resendDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={resendDisabled}
                >
                  {countdown > 0 ? `Resend OTP (${countdown}s)` : "Resend OTP"}
                </button>
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block font-bold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-[#FFFAFB] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Password strength indicators */}
              <div className="mt-2 text-sm">
                <p className={passwordStrength.length ? "text-green-600" : "text-gray-500"}>
                  ✓ At least 6 characters
                </p>
                <p className={passwordStrength.hasNumber ? "text-green-600" : "text-gray-500"}>
                  ✓ Contains a number
                </p>
                <p className={passwordStrength.hasSpecialChar ? "text-green-600" : "text-gray-500"}>
                  ✓ Contains a special character
                </p>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block font-bold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full p-3 border ${
                    confirmPassword && password !== confirmPassword 
                      ? "border-red-500" 
                      : "border-gray-300"
                  } rounded-lg bg-[#FFFAFB] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50`}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#B71B36] text-white py-3 rounded-lg mb-4 hover:bg-[#a01830] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 disabled:bg-[#B71B36]/50 disabled:cursor-not-allowed"
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
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
            
            {/* Back to Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#B71B36] hover:underline font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image side */}
      <div className="hidden md:block md:w-1/2">
        <div className="h-full bg-[#f5f5f5] flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <img
              src={AuthImage}
              alt="Password Reset"
              className="max-w-xs mx-auto mb-6"
              loading="lazy"
            />
            <h3 className="text-xl font-bold mb-2">Secure Password Reset</h3>
            <p className="text-gray-600">
              Create a strong password that you haven't used before. A good password includes a mix of letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;