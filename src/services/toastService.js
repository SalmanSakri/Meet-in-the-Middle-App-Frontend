/**
 * @file toastService.js
 * @description Production-ready toast notification service with lazy loading and fallbacks
 * @version 1.1.0
 */

// Import the CSS only if it's available
try {
  // Optional: Dynamically import CSS only if needed
  if (typeof document !== "undefined") {
    import("react-toastify/dist/ReactToastify.css");
  }
} catch (e) {
  // CSS import failure is not critical
  console.warn("Toast CSS could not be loaded, falling back to basic styling");
}

// Configuration constants
const TOAST_CONFIG = {
  DEFAULT_POSITION: "top-right",
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000,
  INFO_DURATION: 3000,
};

// Keep track of toast library availability
let toastLibrary = null;
let toastLibraryLoading = false;
let toastQueue = [];

/**
 * Lazily load toast library on demand
 * @returns {Promise} - Promise resolving to toast library
 */
const getToastLibrary = async () => {
  // Return cached instance if available
  if (toastLibrary) return toastLibrary;

  // If already loading, wait for it
  if (toastLibraryLoading) {
    return new Promise((resolve) => {
      // Check every 100ms if library is loaded
      const checkInterval = setInterval(() => {
        if (toastLibrary) {
          clearInterval(checkInterval);
          resolve(toastLibrary);
        }
      }, 100);

      // Set timeout to prevent infinite waiting
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null); // Will trigger fallback
      }, 5000);
    });
  }

  // Start loading the library
  toastLibraryLoading = true;

  try {
    // Dynamic import for code splitting and better performance
    const imported = await import("react-toastify");
    toastLibrary = imported.toast;

    // Process any queued notifications
    processQueue();

    return toastLibrary;
  } catch (error) {
    console.error("Failed to load toast library:", error);
    toastLibraryLoading = false;
    return null;
  }
};

/**
 * Process any queued toast notifications
 */
const processQueue = () => {
  if (toastQueue.length > 0 && toastLibrary) {
    toastQueue.forEach((item) => {
      try {
        toastLibrary[item.type](item.message, item.options);
      } catch (e) {
        fallbackNotification(item.message, item.type);
      }
    });
    toastQueue = [];
  }
};

/**
 * Fallback notification system when toast library fails
 * @param {string} message - Message to display
 * @param {string} type - Notification type
 */
const fallbackNotification = (message, type) => {
  // Create a custom notification element
  if (typeof document !== "undefined") {
    try {
      // Try to create a custom notification element
      const notification = document.createElement("div");
      notification.className = `toast-fallback toast-${type}`;
      notification.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: toast-in 0.3s ease-out;
      `;

      // Apply color based on type
      switch (type) {
        case "success":
          notification.style.backgroundColor = "#4caf50";
          break;
        case "error":
          notification.style.backgroundColor = "#f44336";
          break;
        case "warning":
          notification.style.backgroundColor = "#ff9800";
          break;
        case "info":
        default:
          notification.style.backgroundColor = "#2196f3";
      }

      notification.textContent = message;
      document.body.appendChild(notification);

      // Auto remove after duration
      setTimeout(
        () => {
          notification.style.animation = "toast-out 0.3s ease-in";
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 290);
        },
        type === "error" ? 5000 : 3000
      );

      // Add css animation
      if (!document.getElementById("toast-fallback-styles")) {
        const style = document.createElement("style");
        style.id = "toast-fallback-styles";
        style.textContent = `
          @keyframes toast-in {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes toast-out {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-20px); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      return;
    } catch (e) {
      // If DOM manipulation fails, fall back to console
      console.error(`${type.toUpperCase()}: ${message}`);
    }
  }

  // Last resort fallback - console and alert
  console[type === "error" ? "error" : type === "warning" ? "warn" : "info"](
    `${type.toUpperCase()}: ${message}`
  );

  // Only use alert for critical errors in production as absolute last resort
  if (
    type === "error" &&
    process.env.NODE_ENV === "production" &&
    message.includes("critical")
  ) {
    try {
      alert(`Error: ${message}`);
    } catch {}
  }
};

/**
 * Generic toast display function with queuing capability
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, etc)
 * @param {Object} options - Custom options to override defaults
 */
const showToast = async (message, type, options = {}) => {
  try {
    // Check for undefined or empty message
    if (!message) {
      console.warn("Toast notification called with empty message");
      message = type === "error" ? "An error occurred" : "Operation completed";
    }

    // Get configured toast library
    const toast = await getToastLibrary();

    // Set default duration based on type
    let autoClose;
    switch (type) {
      case "success":
        autoClose = TOAST_CONFIG.SUCCESS_DURATION;
        break;
      case "error":
        autoClose = TOAST_CONFIG.ERROR_DURATION;
        break;
      case "warning":
        autoClose = TOAST_CONFIG.WARNING_DURATION;
        break;
      case "info":
      default:
        autoClose = TOAST_CONFIG.INFO_DURATION;
    }

    // Merge default options with provided options
    const toastOptions = {
      position: TOAST_CONFIG.DEFAULT_POSITION,
      autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    };

    // If library is available, show toast
    if (toast) {
      toast[type](message, toastOptions);
    } else {
      // Queue toast if library is loading
      if (toastLibraryLoading) {
        toastQueue.push({ message, type, options: toastOptions });
      } else {
        // Fallback if library failed to load
        fallbackNotification(message, type);
      }
    }
  } catch (error) {
    console.error("Toast display error:", error);
    fallbackNotification(message, type);
  }
};

/**
 * Shows a success toast notification
 * @param {string} message - Success message to display
 * @param {Object} options - Toast configuration options
 */
export const showSuccess = (message, options = {}) => {
  return showToast(message, "success", options);
};

/**
 * Shows an error toast notification
 * @param {string} message - Error message to display
 * @param {Object} options - Toast configuration options
 */
export const showError = (message, options = {}) => {
  return showToast(message, "error", options);
};

/**
 * Shows an info toast notification
 * @param {string} message - Info message to display
 * @param {Object} options - Toast configuration options
 */
export const showInfo = (message, options = {}) => {
  return showToast(message, "info", options);
};

/**
 * Shows a warning toast notification
 * @param {string} message - Warning message to display
 * @param {Object} options - Toast configuration options
 */
export const showWarning = (message, options = {}) => {
  return showToast(message, "warning", options);
};

/**
 * Clear all active toast notifications
 */
export const clearAllToasts = async () => {
  try {
    const toast = await getToastLibrary();
    if (toast && toast.dismiss) {
      toast.dismiss();
    }
  } catch (error) {
    console.error("Error clearing toasts:", error);
  }
};

/**
 * Toast service initialization - can be called early to preload the library
 */
export const initToastService = () => {
  // Start loading the toast library in the background
  getToastLibrary().catch(() => {
    // Silent catch - errors are handled in getToastLibrary
  });
};

// Export default object with all methods
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  clear: clearAllToasts,
  init: initToastService,
};
