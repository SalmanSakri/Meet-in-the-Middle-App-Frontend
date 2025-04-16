/**
 * @file authSlice.js
 * @description Redux slice for authentication state management
 * @version 1.0.0
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

/**
 * Initial state for the auth slice with complete type definitions
 * @type {Object}
 */
const initialState = {
  // User object containing authenticated user data
  user: null,

  // Authentication status flag
  isAuthenticated: false,

  // Loading state for async operations
  isLoading: false,

  // Error message for failed operations
  error: null,

  // Registration success flag for redirect flows
  registrationSuccess: false,

  // OTP verification status
  otpVerificationRequired: false,

  // Last authenticated timestamp
  lastAuthenticated: null,
};

/**
 * Async thunk for user registration
 * Handles the API call and response processing with robust error handling
 *
 * @type {AsyncThunk}
 */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      // Input validation before API call
      if (!userData.email || !userData.password || !userData.name) {
        return rejectWithValue("All fields are required");
      }

      // Call the registration service
      const response = await authService.register(userData);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      console.error("Registration error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for user login
 * Handles the API call and response processing with detailed errors
 *
 * @type {AsyncThunk}
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // Input validation before API call
      if (!credentials.email || !credentials.password) {
        return rejectWithValue("Email and password are required");
      }

      // Call the login service
      const response = await authService.login(credentials);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        error.response?.data?.message || error.message || "Login failed";
      console.error("Login error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for verifying OTP code
 * Handles the API call and response processing with robust validation
 *
 * @type {AsyncThunk}
 */
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ userId, otp }, { rejectWithValue }) => {
    try {
      // Input validation
      if (!userId || !otp) {
        return rejectWithValue("User ID and OTP code are required");
      }

      // Validate OTP format (assuming 6-digit numeric code)
      if (!/^\d{6}$/.test(otp)) {
        return rejectWithValue("Invalid OTP format - must be 6 digits");
      }

      // Call the OTP verification service
      const response = await authService.verifyOTP(userId, otp);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      console.error("OTP verification error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for user logout
 * Handles both local and server-side logout with graceful degradation
 *
 * @type {AsyncThunk}
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call the logout service
      const result = await authService.logout();

      // Handle warning but don't fail the action
      if (result.warning) {
        console.warn(result.warning);
      }

      return null;
    } catch (error) {
      // Even if server logout fails, we want client logout to succeed
      console.error("Logout error:", error);
      const message =
        error.response?.data?.message || error.message || "Logout failed";

      // Don't reject - still clear local state to ensure user is logged out
      return null;
    }
  }
);

/**
 * Auth slice with reducers for authentication operations
 * Using builder callback pattern for better TypeScript support
 *
 * @type {Slice}
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reset error state
    resetError: (state) => {
      state.error = null;
    },

    // Reset registration success flag
    resetRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },

    // Check authentication status from persisted state
    checkAuthStatus: (state) => {
      // Update authentication state based on token
      state.isAuthenticated = authService.isAuthenticated();

      // If no longer authenticated, clear user data
      if (!state.isAuthenticated && state.user) {
        state.user = null;
      }
    },

    // Clear auth state completely (for use in critical errors)
    clearAuthState: (state) => {
      // Reset to initial state
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user reducers
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = true;
        // Store user ID for OTP verification - properly extract from response
        state.user = {
          id:
            action.payload.user?._id ||
            action.payload.userId ||
            action.payload._id,
        };

        // Set OTP verification flag if required
        state.otpVerificationRequired = action.payload.requiresOtp || false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })

      // Login user reducers
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.lastAuthenticated = new Date().toISOString();

        // Set OTP verification flag if required
        state.otpVerificationRequired = action.payload.requiresOtp || false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      })

      // OTP verification reducers
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.otpVerificationRequired = false;
        state.lastAuthenticated = new Date().toISOString();
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "OTP verification failed";
      })

      // Logout reducers
      .addCase(logoutUser.pending, (state) => {
        // Immediately start clearing sensitive data even before completion
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Complete logout by resetting all auth state
        state.user = null;
        state.isAuthenticated = false;
        state.lastAuthenticated = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even on error, ensure user is logged out locally
        state.user = null;
        state.isAuthenticated = false;
        state.lastAuthenticated = null;
      });
  },
});

// Export actions
export const {
  resetError,
  resetRegistrationSuccess,
  checkAuthStatus,
  clearAuthState,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
