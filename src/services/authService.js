/**
 * @file authService.js
 * @description Authentication service with API integration and secure token management
 * @version 1.1.0
 */
const API_URL = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";
import Cookies from "js-cookie";

// Configuration constants
const API_CONFIG = {
  BASE_URL: API_URL || "https://auth-banckend.onrender.com/api/auth",
  TOKEN_EXPIRY: 7, // 7 days
  COOKIE_NAME: "authToken",
  SESSION_EMAIL_KEY: "email",
  LOCAL_STORAGE_USER_KEY: "userData",
};

/**
 * Create axios instance with default config and interceptors
 * Using memoization pattern to ensure single instance
 */
const createApiInstance = () => {
  // Create base API instance with defaults
  const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    // Adding timeout to prevent hanging requests
    timeout: 10000,
  });

  // Add request interceptor to include auth token in headers
  api.interceptors.request.use(
    (config) => {
      // Get token from secure cookie storage
      const token = Cookies.get(API_CONFIG.COOKIE_NAME);

      // Attach token to Authorization header if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for common error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle expired tokens or unauthorized access
      if (error.response && error.response.status === 401) {
        // Clear invalid tokens
        Cookies.remove(API_CONFIG.COOKIE_NAME);
        sessionStorage.removeItem(API_CONFIG.SESSION_EMAIL_KEY);
        localStorage.removeItem(API_CONFIG.LOCAL_STORAGE_USER_KEY);
        
        // Only redirect if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Memoized API instance - created once and reused
const api = createApiInstance();

/**
 * Custom error handler for API errors with detailed classification
 * @param {Error} error - Axios error object
 * @returns {Object} - Formatted error object with status and message
 */
const handleApiError = (error) => {
  // Default error structure for consistency
  const errorResponse = {
    status: 500,
    message: "Something went wrong. Please try again later.",
    details: null,
  };

  // Handle server response errors (400-500 status codes)
  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.message =
      (error.response.data && error.response.data.message) || 
      `Error: ${error.response.status}`;
    errorResponse.details = error.response.data;

    // Special handling for common error codes
    if (error.response.status === 429) {
      errorResponse.message = "Too many requests. Please try again later.";
    }
  }
  // Handle network errors (no response received)
  else if (error.request) {
    errorResponse.status = 0;
    errorResponse.message =
      "Network error: Server unavailable. Please check your connection.";
  }
  // Handle request setup errors
  else {
    errorResponse.message = error.message || "Unknown error occurred";
  }

  // Log error for debugging but avoid sensitive data
  console.error("API Error:", {
    status: errorResponse.status,
    message: errorResponse.message,
  });

  return errorResponse;
};

/**
 * Token and user data management utilities with enhanced security
 */
const dataManager = {
  /**
   * Store authentication token securely
   * @param {string} token - JWT token
   */
  setToken: (token) => {
    if (!token) return;
    
    Cookies.set(API_CONFIG.COOKIE_NAME, token, {
      expires: API_CONFIG.TOKEN_EXPIRY,
      secure: true,
      sameSite: "strict",
      // Path restriction for added security
      path: "/",
    });
  },

  /**
   * Remove authentication token
   */
  removeToken: () => {
    Cookies.remove(API_CONFIG.COOKIE_NAME, { path: "/" });
  },

  /**
   * Check if token exists and is valid
   * @returns {boolean} - Token validity status
   */
  isTokenValid: () => {
    const token = Cookies.get(API_CONFIG.COOKIE_NAME);
    if (!token) return false;

    // Basic JWT structure validation (not checking expiry)
    const tokenParts = token.split(".");
    return tokenParts.length === 3;
  },

  /**
   * Store user data securely in localStorage
   * @param {Object} userData - User data to store
   */
  setUserData: (userData) => {
    if (!userData) return;

    // Only store necessary user data, avoid storing sensitive information
    const sanitizedUserData = {
      id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "user",
      // Add other non-sensitive fields as needed
    };

    try {
      localStorage.setItem(
        API_CONFIG.LOCAL_STORAGE_USER_KEY,
        JSON.stringify(sanitizedUserData)
      );
    } catch (e) {
      console.error("Failed to store user data:", e);
    }
  },

  /**
   * Get user data from localStorage
   * @returns {Object|null} - User data or null if not found
   */
  getUserData: () => {
    try {
      const userData = localStorage.getItem(API_CONFIG.LOCAL_STORAGE_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear invalid data
      localStorage.removeItem(API_CONFIG.LOCAL_STORAGE_USER_KEY);
      return null;
    }
  },

  /**
   * Remove user data from localStorage
   */
  removeUserData: () => {
    localStorage.removeItem(API_CONFIG.LOCAL_STORAGE_USER_KEY);
  },
};

/**
 * Authentication service object with methods for auth-related API calls
 * Using request/response normalization pattern for consistent interfaces
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data (name, email, password)
   * @returns {Promise} - API response with userId or error
   */
  register: async (userData) => {
    try {
      // Data validation before sending to server
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error("Missing required registration fields");
      }

      // Send registration request
      const response = await api.post("/signup", userData);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Login user with credentials
   * @param {Object} credentials - User login credentials (email, password)
   * @returns {Promise} - API response with user data and token or error
   */
  login: async (credentials) => {
    try {
      // Data validation before sending to server
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
      }

      // Send login request
      const response = await api.post("/login", credentials);

      // Store auth token securely using token manager
      if (response.data && response.data.token) {
        dataManager.setToken(response.data.token);

        // Store user data in localStorage
        if (response.data.user) {
          dataManager.setUserData(response.data.user);
        }

        // Store minimal user info - email only for security
        sessionStorage.setItem(API_CONFIG.SESSION_EMAIL_KEY, credentials.email);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Verify OTP code for multi-factor authentication
   * @param {string} userId - User ID
   * @param {string} otp - OTP code to verify
   * @param {string} purpose - Purpose of OTP verification (e.g., "verification")
   * @returns {Promise} - API response with verification status or error
   */
  verifyOTP: async (userId, otp, purpose = "verification") => {
    try {
      // Validate required parameters
      if (!userId || !otp) {
        throw new Error("User ID and OTP code are required");
      }

      // Send OTP verification request
      const response = await api.post("/verify-otp", { userId, otp, purpose });

      // Store auth token if provided after verification
      if (response.data && response.data.token) {
        dataManager.setToken(response.data.token);
      }

      // Store user data if provided
      if (response.data && response.data.user) {
        dataManager.setUserData(response.data.user);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },
  
  /**
   * Resend OTP code to the user
   * @param {string} userId - User ID
   * @param {string} purpose - Purpose of OTP (verification or password_reset)
   * @returns {Promise} - API response or error
   */
  resendOTP: async (userId, purpose = "verification") => {
    try {
      // Validate required parameters
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      // Validate purpose
      const validPurposes = ["verification", "password_reset"];
      if (!validPurposes.includes(purpose)) {
        throw new Error("Invalid purpose. Must be 'verification' or 'password_reset'");
      }

      // Send resend OTP request
      const response = await api.post("/resend-otp", { userId, purpose });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Request password reset via email
   * @param {string} email - User email
   * @returns {Promise} - API response or error
   */
  requestPasswordReset: async (email) => {
    try {
      // Validate email before sending
      if (!email || !email.includes("@")) {
        throw new Error("Valid email is required");
      }

      // Send password reset request
      const response = await api.post("/request-password-reset", { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },


  resetPassword: async (userId, otp, newPassword) => {
    try {
      // Validate inputs before sending
      if (!userId || !otp || !newPassword) {
        throw new Error("User ID, OTP, and new password are required");
      }
  
      // Password strength validation
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
  
      // Send reset request
      const response = await api.post("/reset-password", { userId, otp, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Logout user - removes token and session data
   * Using a more robust approach with both local and remote logout
   * @returns {Promise} - Result of logout operation
   */
  logout: async () => {
    // First perform local logout by removing tokens and data
    dataManager.removeToken();
    dataManager.removeUserData();
    sessionStorage.removeItem(API_CONFIG.SESSION_EMAIL_KEY);

    // Then attempt server-side logout (but don't block on it)
    try {
      // Attempt server logout with a short timeout
      await api.post("/logout", {}, { timeout: 5000 });
      return { success: true };
    } catch (error) {
      console.warn("Server logout failed, but local logout succeeded");
      return {
        success: true,
        warning: "Local logout successful, but server logout failed",
      };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    return dataManager.isTokenValid();
  },

  /**
   * Get the current user data from localStorage
   * @returns {Object|null} - User data or null if not found/authenticated
   */
  getCurrentUser: () => {
    // Only return user data if authenticated
    return dataManager.isTokenValid() ? dataManager.getUserData() : null;
  },
};

export default authService;