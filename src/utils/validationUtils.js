/**
 * @file validationUtils.js
 * @description Centralized validation functions for form inputs
 */

// Email validation regex - compiled once for reuse
export const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Password strength regex - at least 8 chars, 1 uppercase, 1 lowercase, 1 number
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

/**
 * Validates password format and strength
 * @param {string} password - The password to validate
 * @param {boolean} isStrict - Whether to enforce strong password requirements
 * @returns {string|null} - Error message or null if valid
 */
export const validatePassword = (password, isStrict = true) => {
  if (!password) {
    return "Password is required";
  }

  if (isStrict && !PASSWORD_STRENGTH_REGEX.test(password)) {
    return "Password must be at least 8 characters with uppercase, lowercase, and numbers";
  } else if (!isStrict && password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};

/**
 * Validates password confirmation matches original password
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password to check
 * @returns {string|null} - Error message or null if valid
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

/**
 * Validates name input
 * @param {string} name - The name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateName = (name) => {
  if (!name.trim()) {
    return "Name is required";
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  return null;
};

/**
 * Validates OTP format
 * @param {string} otp - The OTP to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateOTP = (otp) => {
  if (!otp.trim()) {
    return "OTP is required";
  }
  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    return "OTP must be 6 digits";
  }
  return null;
};

/**
 * Evaluates password strength and returns a score with feedback
 * @param {string} password - The password to evaluate
 * @returns {Object} - Object containing score and message
 */
export const checkPasswordStrength = (password) => {
  let score = 0;
  let message = "";

  if (!password) {
    return { score: 0, message: "" };
  }

  // Increment score based on various criteria
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Set message based on score
  if (score <= 2) message = "Weak password";
  else if (score <= 4) message = "Moderate password";
  else message = "Strong password";

  return { score, message };
};
