/**
 * @file FormComponents.jsx
 * @description Reusable form components for authentication flows
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { evaluatePasswordStrength } from "../utilitys/validationUtils";

/**
 * Text input field component with validation
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Text input component
 */
export const FormInput = ({
  id,
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  className = "",
  ...rest
}) => {
  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className="block font-bold text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full p-3 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg bg-[#FFFAFB] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 ${className}`}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1 mb-2">
          {error}
        </p>
      )}
    </div>
  );
};

FormInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Password input field component with toggle visibility
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Password input component
 */
export const PasswordInput = ({
  id,
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  showStrengthMeter = false,
  className = "",
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Calculate password strength if needed
  const passwordStrength = showStrengthMeter
    ? evaluatePasswordStrength(value)
    : null;

  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className="block font-bold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className={`w-full p-3 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 bg-[#FFFAFB] focus:ring-[#B71B36]/50 ${className}`}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <PiEyeSlash size={24} aria-hidden="true" />
          ) : (
            <PiEye size={24} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Password strength meter */}
      {showStrengthMeter && value && (
        <div className="mt-1">
          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full ${passwordStrength.colorClass}`}
              style={{
                width: `${Math.min(100, passwordStrength.score * 20)}%`,
              }}
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
      )}

      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1 mb-2">
          {error}
        </p>
      )}
    </div>
  );
};

PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  showStrengthMeter: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * OTP input field component with auto-focus functionality
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} OTP input component
 */
export const OTPInput = ({
  value = ["", "", "", "", "", ""],
  onChange,
  error,
  length = 6,
}) => {
  const handleOtpChange = (index, newValue) => {
    // Allow only numbers
    if (newValue && !/^\d+$/.test(newValue)) {
      return;
    }

    // Update OTP state
    const newOtp = [...value];
    newOtp[index] = newValue;
    onChange(newOtp);

    // Auto-focus next input
    if (newValue && index < length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // On backspace, go to previous field if current is empty
    if (e.key === "Backspace" && !value[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 xs:gap-1 sm:gap-2 md:gap-3 mb-4">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            className="w-10 h-12 xs:w-10 sm:w-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50"
            value={value[index]}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            autoFocus={index === 0}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}
    </div>
  );
};

OTPInput.propTypes = {
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  length: PropTypes.number,
};

/**
 * Submit button component with loading state
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Submit button component
 */
export const SubmitButton = ({
  text,
  loadingText,
  isLoading,
  disabled,
  className = "",
  ...rest
}) => {
  return (
    <button
      type="submit"
      className={`w-full bg-[#B71B36] hover:bg-[#A01830] text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B71B36] disabled:bg-[#d88a97] disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          {loadingText || "Loading..."}
        </span>
      ) : (
        text
      )}
    </button>
  );
};

SubmitButton.propTypes = {
  text: PropTypes.string.isRequired,
  loadingText: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Error display component for form validation and API errors
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element|null} Error display component or null
 */
export const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div
      className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center"
      role="alert"
    >
      {error}
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.string,
};

/**
 * Auth layout component for consistent styling across auth pages
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Auth layout component
 */
export const AuthLayout = ({
  children,
  image,
  imageAlt = "Authentication Image",
  rightSideContent,
}) => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image Section with lazy loading */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <React.Suspense
          fallback={
            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
          }
        >
          <img
            src={image}
            alt={imageAlt}
            className="max-w-md w-full object-contain"
            loading="lazy"
            fetchPriority="low"
          />
        </React.Suspense>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-8">
        <div className="max-w-md w-full mx-auto">{children}</div>
      </div>

      {/* Optional content for right side */}
      {rightSideContent}
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  image: PropTypes.string.isRequired,
  imageAlt: PropTypes.string,
  rightSideContent: PropTypes.node,
};

/**
 * Form header component for consistent styling across auth forms
 *
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Form header component
 */
export const FormHeader = ({ title, subtitle, logo, logoAlt = "Logo" }) => {
  return (
    <>
      {/* Logo/Illustration with lazy loading */}
      {logo && (
        <div className="flex justify-center mb-6">
          <React.Suspense
            fallback={
              <div className="h-24 w-auto bg-gray-100 rounded animate-pulse"></div>
            }
          >
            <img
              src={logo}
              alt={logoAlt}
              className="h-24 w-auto mb-4"
              loading="lazy"
            />
          </React.Suspense>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 text-center">{title}</h1>
      {subtitle && (
        <p className="text-gray-500 text-center mt-1 mb-6">{subtitle}</p>
      )}
    </>
  );
};

FormHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  logo: PropTypes.string,
  logoAlt: PropTypes.string,
};
