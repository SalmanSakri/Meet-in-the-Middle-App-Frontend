/**
 * @file SignUp.jsx
 * @description Improved SignUp component with separate validation and responsive design
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  resetError,
  resetRegistrationSuccess,
} from "../../redux/slices/authSlice";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import LoadingSpinner from "../../component/LoadingSpinner";
import SignupImage from "../../assets/singup.svg";
import AuthImg from "../../assets/auth.svg";

// Import validation utilities
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  checkPasswordStrength,
} from "../../utils/validationUtils";

// Import toast utilities
import { showSuccess, showInfo, showError } from "../../utils/toastUtils";

/**
 * Signup component for user registration
 * Uses Redux for state management and optimized rendering
 *
 * @component
 * @returns {JSX.Element} Signup form component
 */
const SignUp = () => {
  // Hooks for navigation and dispatch
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select only needed parts of state to prevent unnecessary rerenders
  const { isLoading, error, registrationSuccess, otpVerificationRequired,user } =
    useSelector(
      (state) => ({
        isLoading: state.auth.isLoading,
        error: state.auth.error,
        registrationSuccess: state.auth.registrationSuccess,
        otpVerificationRequired: state.auth.otpVerificationRequired,
        user: state.auth.user,
      }),
      // Use shallow comparison for performance
      (prev, next) =>
        prev.isLoading === next.isLoading &&
        prev.error === next.error &&
        prev.registrationSuccess === next.registrationSuccess &&
        prev.otpVerificationRequired === next.otpVerificationRequired &&
         prev.user === next.user
    );

  // Form state with single initialization
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  });

  /**
   * Effect to handle navigation after successful registration
   */
 useEffect(() => {
   // Reset error on component mount
   dispatch(resetError());

   // Monitor registration status and navigate accordingly
   if (registrationSuccess) {
     // Check if we have a user ID before navigating
     if (user && user.id) {
       if (!otpVerificationRequired) {
         console.log("Navigating to OTP verification page");
         // Make sure to clear registration success flag to prevent navigation loops
         dispatch(resetRegistrationSuccess());
         // Navigate to OTP verification page with user ID
         navigate("/otp-verification", {
           state: { userId: user.id },
         });

         showInfo("Please verify your account with the OTP sent to your email");
       } else {
         console.log("Navigating to login page");
         dispatch(resetRegistrationSuccess());
         navigate("/login");
         showSuccess("Registration successful! Please login to continue.");
       }
     } else {
       console.error("Registration succeeded but no user ID was returned");
       showError("Registration error: Missing user information");
       dispatch(resetRegistrationSuccess());
     }
   }

   // Handle error displays
   if (error && submitAttempted) {
     showError(error);
   }
 }, [
   registrationSuccess,
   otpVerificationRequired,
   navigate,
   error,
   dispatch,
   submitAttempted,
   user,
 ]);

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

    // Check password strength if password field is changed
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  }, []);

  /**
   * Toggle password visibility
   * Simple state toggle with memoization
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Toggle confirm password visibility
   * Simple state toggle with memoization
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  /**
   * Validates form input fields using the validation utilities
   * @returns {boolean} - True if validation passes, false otherwise
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    const nameError = validateName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
      isValid = false;
    }

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }

    // Password validation
    const passwordError = validatePassword(formData.password, true);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    // Confirm password validation
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
      isValid = false;
    }

    // Set validation errors
    setFormErrors(newErrors);
    return isValid;
  }, [formData]);

  /**
   * Handles form submission for user registration
   * Dispatches register action to Redux
   *
   * @param {Object} e - Event object
   */
  const handleSignup = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitAttempted(true);

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      try {
        // Create userData object (omitting confirmPassword)
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

        // Dispatch register action to redux
        const result = await dispatch(registerUser(userData)).unwrap();
        console.log("Registration result:", result);
        // Navigation is handled by useEffect
      } catch (err) {
        // Error is handled in the redux slice
        console.error("Registration dispatch error:", err);
        // Show error toast if not shown by useEffect
        if (err.message) {
          showError(err.message);
        }
      }
    },
    [formData, dispatch, validateForm]
  );

  // Memoized password strength indicator
  const PasswordStrengthIndicator = useMemo(() => {
    if (!formData.password) return null;

    const getColorClass = () => {
      if (passwordStrength.score <= 2) return "bg-red-500";
      if (passwordStrength.score <= 4) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <div className="mt-1">
        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColorClass()}`}
            style={{ width: `${Math.min(100, passwordStrength.score * 20)}%` }}
          ></div>
        </div>
        <p
          className={`text-xs mt-1 ${
            passwordStrength.score <= 2
              ? "text-red-500"
              : passwordStrength.score <= 4
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {passwordStrength.message}
        </p>
      </div>
    );
  }, [formData.password, passwordStrength]);

  // Memoized error message display
  const ErrorDisplay = useMemo(() => {
    // Only show redux errors here, form validation errors are shown inline
    if (error && submitAttempted) {
      return (
        <div
          className="bg-red-50 text-red-600 p-2 rounded-lg mb-3 text-center"
          role="alert"
        >
          {error}
        </div>
      );
    }
    return null;
  }, [error, submitAttempted]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side - Image Section with lazy loading - Hidden on small devices */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center p-4 sm:p-6 md:p-8">
   
          <img
            src={SignupImage}
            alt="Signup Background"
            className="max-w-md w-full object-contain"
            loading="lazy"
          />
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        <div className="max-w-md w-full mx-auto">
          {/* Logo/Illustration with lazy loading */}
          <div className="flex justify-center sm:mb-3">
            <React.Suspense
              fallback={
                <div className="h-20 w-20 sm:h-24 sm:w-auto bg-gray-100 rounded animate-pulse"></div>
              }
            >
              <img
                src={AuthImg}
                alt="Signup Illustration"
                className="h-20 sm:h-24 w-auto"
                loading="lazy"
              />
            </React.Suspense>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
            Create Admin Account
          </h1>
          <p className="text-gray-500 text-center mt-1 text-sm sm:text-base">
            Please fill in the details to create your account
          </p>

          {/* Display error messages from Redux */}
          {ErrorDisplay}

          {/* Signup Form with improved validation and accessibility */}
          <form onSubmit={handleSignup} noValidate className="">
            {/* Name field */}
            <div className="mb-1">
              <label
                htmlFor="name"
                className="block font-bold text-gray-700 mb-1 text-sm sm:text-base"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                className={`w-full p-2 border ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                } rounded-lg bg-[#FFFAFB] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50`}
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && (
                <p
                  id="name-error"
                  className="text-red-500 text-xs sm:text-sm mt-1 mb-1"
                >
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="mb-2">
              <label
                htmlFor="email"
                className="block font-bold text-gray-700 mb-1 text-sm sm:text-base"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="example@domain.com"
                className={`w-full p-2 border ${
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
                <p
                  id="email-error"
                  className="text-red-500 text-xs sm:text-sm mt-1 mb-1"
                >
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password field with toggle visibility */}
            <div className="mb- relative">
              <label
                htmlFor="password"
                className="block font-bold text-gray-700 mb-1x text-sm sm:text-base"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  className={`w-full p-2  border ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 bg-[#FFFAFB] focus:ring-[#B71B36]/50`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
                    <PiEyeSlash
                      size={20}
                      className="sm:text-xl"
                      aria-hidden="true"
                    />
                  ) : (
                    <PiEye
                      size={20}
                      className="sm:text-xl"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              {PasswordStrengthIndicator}
              {formErrors.password && (
                <p
                  id="password-error"
                  className="text-red-500 text-xs sm:text-sm mt-1 mb-1"
                >
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password field with toggle visibility */}
            <div className="mb-2 relative">
              <label
                htmlFor="confirmPassword"
                className="block font-bold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  className={`w-full p-2 border ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 bg-[#FFFAFB] focus:ring-[#B71B36]/50`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  aria-invalid={!!formErrors.confirmPassword}
                  aria-describedby={
                    formErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <PiEyeSlash
                      size={20}
                      className="sm:text-xl"
                      aria-hidden="true"
                    />
                  ) : (
                    <PiEye
                      size={20}
                      className="sm:text-xl"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-red-500 text-xs sm:text-sm mt-1 mb-1"
                >
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#B71B36] hover:bg-[#A01830] text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B71B36]"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner text="Creating account..." />
              ) : (
                "Create Account"
              )}
            </button>
            {/* Link to Login */}
            <div className="mt-1 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#B71B36] hover:underline font-semibold"
                >
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
