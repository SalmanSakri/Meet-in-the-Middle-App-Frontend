/**
 * @file toastUtils.js
 * @description Centralized toast notification functions
 */

import { toast } from "react-toastify";

// Default toast configuration
const defaultConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Shows a success toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, { ...defaultConfig, ...options });
};

/**
 * Shows an error toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showError = (message, options = {}) => {
  toast.error(message, { ...defaultConfig, ...options });
};

/**
 * Shows an info toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, { ...defaultConfig, ...options });
};

/**
 * Shows a warning toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Optional toast configuration options
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, { ...defaultConfig, ...options });
};
