import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP, resendOTP } from "../../../redux/slices/authSlice";
import LoginImage from "../../../assets/login.svg";
import { toast } from "react-toastify";

/**
 * OTP Verification Component
 * Handles user email verification with OTP code
 */
const OtpVerification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const { user, isLoading, error } = useSelector((state) => state.auth);

  // OTP input state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formError, setFormError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  /**
   * Check if user ID exists, redirect to signup if not
   */
  useEffect(() => {
    if (!user?.id) {
      navigate("/");
    }
  }, [user, navigate]);

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
   * Handle input change in OTP fields
   * Auto-focuses next input field
   * @param {number} index - Current input index
   * @param {string} value - New input value
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
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  /**
   * Handle key press in OTP fields
   * For backspace, focus previous field
   * @param {number} index - Current input index
   * @param {Object} e - Key event
   */
  const handleKeyDown = (index, e) => {
    // On backspace, go to previous field if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  /**
   * Handle OTP verification form submission
   * @param {Object} e - Event object
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setFormError("");

    // Check if OTP is complete
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setFormError("Please enter all 6 digits");
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyOTP({
          userId: user.id,
          otp: otpValue,
          purpose: "verification", // This matches the backend's expected value
        })
      ).unwrap();

      // OTP verified successfully - redirect to dashboard
      toast.success("Email verified successfully!");
      navigate("/layout");
    } catch (err) {
      console.error("OTP verification error:", err);
      setFormError(err || "Verification failed. Please try again.");
    }
  };

  /**
   * Request a new OTP code
   */
  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setResendDisabled(true);
    
    try {
      await dispatch(resendOTP({
        userId: user.id,
        purpose: "verification" // This matches the backend's expected value
      })).unwrap();
      
      toast.success("A new verification code has been sent to your email.");
      
      // Start cooldown timer (60 seconds)
      setCountdown(60);
    } catch (err) {
      console.error("Error resending OTP:", err);
      toast.error(err || "Failed to resend verification code");
      setResendDisabled(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <React.Suspense
          fallback={<div className="w-full h-full bg-gray-200"></div>}
        >
          <img
            src={LoginImage}
            alt="Login Background"
            className="max-w-sm w-full object-contain"
            loading="lazy"
            fetchpriority="low"
          />
        </React.Suspense>
      </div>

      {/* Right Side - OTP Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-8 lg:px-16 py-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Verify Your Email
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            We've sent a 6-digit verification code to your email. Please enter
            the code below to verify your account.
          </p>

          {/* Display error if any */}
          {(error || formError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">
              {formError || error}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 mb-6">
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
                  autoFocus={index === 0}
                />
              ))}
            </div>

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
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Didn't receive the code?
                {countdown > 0 && (
                  <span className="ml-1 text-gray-500">
                    Resend in {countdown}s
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                className={`text-[#B71B36] hover:underline font-medium ${
                  resendDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={resendDisabled}
              >
                Resend Code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;