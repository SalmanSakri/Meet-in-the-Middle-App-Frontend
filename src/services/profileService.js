/**
 * @file profileService.js
 * @description Profile service with API integration for user profile management
 * @version 1.0.0
 */
const API_URL = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";

// Re-use the same api instance creation from authService
// This is imported from a shared file or duplicated for example purposes
let api;

// Check if api instance was already created in authService
if (typeof window !== 'undefined' && window.api) {
  api = window.api;
} else {
  // Create api instance if not available
  // This would ideally be imported from a shared apiClient module
  const createApiInstance = () => {
    // Create base API instance with defaults
    const apiInstance = axios.create({
      baseURL: API_URL || "https://auth-banckend.onrender.com/api",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Add request interceptor to include auth token in headers
    apiInstance.interceptors.request.use(
      (config) => {
        // Get token from cookies (similar to authService)
        const token = document.cookie.split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        // Attach token to Authorization header if available
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return apiInstance;
  };

  api = createApiInstance();
  
  // Store for potential reuse
  if (typeof window !== 'undefined') {
    window.api = api;
  }
}

/**
 * Custom error handler for API errors
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

  // Handle server response errors
  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.message =
      (error.response.data && error.response.data.message) || 
      `Error: ${error.response.status}`;
    errorResponse.details = error.response.data;
  }
  // Handle network errors
  else if (error.request) {
    errorResponse.status = 0;
    errorResponse.message =
      "Network error: Server unavailable. Please check your connection.";
  }
  // Handle request setup errors
  else {
    errorResponse.message = error.message || "Unknown error occurred";
  }

  // Log error for debugging
  console.error("API Error:", {
    status: errorResponse.status,
    message: errorResponse.message,
  });

  return errorResponse;
};

/**
 * Profile service object with methods for profile-related API calls
 */
const profileService = {
  /**
   * Get user profile
   * @returns {Promise} - API response with user profile data or error
   */
  getProfile: async () => {
    try {
      // Send profile fetch request
      const response = await api.get("/profile");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - User profile data to update
   * @returns {Promise} - API response with updated user data or error
   */
  updateProfile: async (profileData) => {
    try {
      // Input validation
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Invalid profile data');
      }

      // Send profile update request
      const response = await api.patch("/profile/update", profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Update user avatar
   * @param {File} imageFile - Image file to upload
   * @returns {Promise} - API response with updated avatar URL or error
   */
  updateAvatar: async (imageFile) => {
    try {
      // Input validation
      if (!(imageFile instanceof File)) {
        throw new Error('Invalid image file');
      }

      // Create form data
      const formData = new FormData();
      formData.append('avatar', imageFile);

      // Send avatar update request with multipart/form-data
      const response = await api.put("/profile/avatar", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Delete user avatar
   * @returns {Promise} - API response confirming deletion or error
   */
  deleteAvatar: async () => {
    try {
      // Send avatar deletion request
      const response = await api.delete("/profile/avatar");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Update user email preferences
   * @param {Object} preferences - Email notification preferences
   * @returns {Promise} - API response with updated preferences or error
   */
  updateEmailPreferences: async (preferences) => {
    try {
      // Input validation
      if (!preferences || typeof preferences !== 'object') {
        throw new Error('Invalid preferences data');
      }

      // Send email preferences update request
      const response = await api.put("/profile/email-preferences", preferences);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Request email verification
   * @returns {Promise} - API response confirming verification email sent or error
   */
  requestEmailVerification: async () => {
    try {
      // Send email verification request
      const response = await api.post("/profile/verify-email");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise} - API response confirming verification or error
   */
  verifyEmail: async (token) => {
    try {
      // Input validation
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid verification token');
      }

      // Send token verification request
      const response = await api.post("/profile/verify-email/confirm", { token });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  }
};

export default profileService;