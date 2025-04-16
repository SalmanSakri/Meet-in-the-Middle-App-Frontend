/**
 * @file toastService.js
 * @description Centralized toast notification service with fallback
 */

/**
 * Toast service that handles both react-toastify and fallback notifications
 * Provides a unified API for showing notifications even if react-toastify fails
 */

// Fallback notification with native browser alert (only used if toast library fails)
const fallbackNotification = (message, type) => {
  console.warn("Toast notification fallback used:", type, message);
  // Only use alert for errors in production as a last resort
  if (type === "error" && process.env.NODE_ENV === "production") {
    alert(`Error: ${message}`);
  }
};

/**
 * Shows a success toast notification
 * @param {string} message - Success message to display
 * @param {Object} options - Toast configuration options
 */
export const showSuccess = (message, options = {}) => {
  try {
    // Try to use react-toastify
    const { toast } = require("react-toastify");
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  } catch (error) {
    // Fallback if react-toastify fails
    console.error("Toast library error:", error);
    fallbackNotification(message, "success");
  }
};

/**
 * Shows an error toast notification
 * @param {string} message - Error message to display
 * @param {Object} options - Toast configuration options
 */
export const showError = (message, options = {}) => {
  try {
    // Try to use react-toastify
    const { toast } = require("react-toastify");
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  } catch (error) {
    // Fallback if react-toastify fails
    console.error("Toast library error:", error);
    fallbackNotification(message, "error");
  }
};

/**
 * Shows an info toast notification
 * @param {string} message - Info message to display
 * @param {Object} options - Toast configuration options
 */
export const showInfo = (message, options = {}) => {
  try {
    // Try to use react-toastify
    const { toast } = require("react-toastify");
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  } catch (error) {
    // Fallback if react-toastify fails
    console.error("Toast library error:", error);
    fallbackNotification(message, "info");
  }
};

/**
 * Shows a warning toast notification
 * @param {string} message - Warning message to display
 * @param {Object} options - Toast configuration options
 */
export const showWarning = (message, options = {}) => {
  try {
    // Try to use react-toastify
    const { toast } = require("react-toastify");
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  } catch (error) {
    // Fallback if react-toastify fails
    console.error("Toast library error:", error);
    fallbackNotification(message, "warning");
  }
};

// Export default object with all methods for convenience
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
};
