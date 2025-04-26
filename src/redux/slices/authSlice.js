/**
 * @file authSlice.js
 * @description Redux slice for authentication state management
 * @version 1.2.0
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

  // Password reset specific states
  passwordResetRequested: false,
  passwordResetSuccess: false,
  passwordResetUserId: null,
  passwordResetEmail: null,
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
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "Registration failed";
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
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "Login failed";
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
  async ({ userId, otp, purpose = "verification" }, { rejectWithValue }) => {
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
      const response = await authService.verifyOTP(userId, otp, purpose);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "OTP verification failed";
      console.error("OTP verification error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for resending OTP code
 * Handles the API call and response processing
 *
 * @type {AsyncThunk}
 */
export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async ({ userId, purpose = "verification" }, { rejectWithValue }) => {
    try {
      // Input validation
      if (!userId) {
        return rejectWithValue("User ID is required");
      }

      // Validate purpose
      const validPurposes = ["verification", "password_reset"];
      if (!validPurposes.includes(purpose)) {
        return rejectWithValue("Invalid purpose. Must be 'verification' or 'password_reset'");
      }

      // Call the resend OTP service
      const response = await authService.resendOTP(userId, purpose);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "OTP resend failed";
      console.error("OTP resend error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for requesting password reset
 * Handles the API call and response processing
 *
 * @type {AsyncThunk}
 */
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      // Input validation
      if (!email) {
        return rejectWithValue("Email is required");
      }

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return rejectWithValue("Please enter a valid email address");
      }

      // Call the password reset service
      const response = await authService.requestPasswordReset(email);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return { ...response.data, email };
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "Password reset request failed";
      console.error("Password reset request error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for resetting password with OTP
 * Handles the API call and response processing
 *
 * @type {AsyncThunk}
 */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ userId, otp, newPassword }, { rejectWithValue }) => {
    try {
      // Input validation
      if (!userId || !otp || !newPassword) {
        return rejectWithValue("User ID, OTP, and new password are required");
      }

      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        return rejectWithValue("Invalid OTP format - must be 6 digits");
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return rejectWithValue("Password must be at least 6 characters");
      }

      // Call the reset password service
      const response = await authService.resetPassword(userId, otp, newPassword);

      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        (error.response && error.response.data && error.response.data.message) || 
        error.message || 
        "Password reset failed";
      console.error("Password reset error:", error);
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
      
      // Don't reject - still clear local state to ensure user is logged out
      return rejectWithValue(error);
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

    // Reset password reset success flag
    resetPasswordResetSuccess: (state) => {
      state.passwordResetSuccess = false;
    },

    // Clear password reset related data
    clearPasswordResetData: (state) => {
      state.passwordResetRequested = false;
      state.passwordResetSuccess = false;
      state.passwordResetUserId = null;
      state.passwordResetEmail = null;
    },

    // Check authentication status from persisted state
    checkAuthStatus: (state) => {
      // Update authentication state based on token
      state.isAuthenticated = authService.isAuthenticated();

      // If no longer authenticated, clear user data
      if (!state.isAuthenticated && state.user) {
        state.user = null;
      }
      
      // If authenticated but no user data, try to load it
      if (state.isAuthenticated && !state.user) {
        state.user = authService.getCurrentUser();
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
        
        // Safely extract user ID with fallbacks
        const userData = action.payload || {};
        const userId = 
          (userData.user && (userData.user._id || userData.user.id)) || 
          userData.userId || 
          userData._id;
        
        // Only set user if we have an ID
        if (userId) {
          state.user = { id: userId };
        }

        // Set OTP verification flag if required
        state.otpVerificationRequired = Boolean(userData.requiresOtp);
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
        
        // Safely extract user data
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
        }
        
        state.lastAuthenticated = new Date().toISOString();

        // Set OTP verification flag if required
        state.otpVerificationRequired = Boolean(action.payload && action.payload.requiresOtp);
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
        
        // Safely extract user data
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
        }
        
        state.otpVerificationRequired = false;
        state.lastAuthenticated = new Date().toISOString();
        
        // Handle password verification use case
        if (action.payload && action.payload.passwordReset) {
          state.passwordResetSuccess = true;
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "OTP verification failed";
      })

      // OTP resend reducers
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        // Don't change authentication state, just update loading state
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to resend verification code";
      })
      
      // Password reset request reducers
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetRequested = false;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwordResetRequested = true;
        
        // Store email and userId for the password reset flow
        if (action.payload) {
          state.passwordResetEmail = action.payload.email;
          if (action.payload.userId) {
            state.passwordResetUserId = action.payload.userId;
          }
        }
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send password reset email";
      })
      
      // Password reset (with OTP) reducers
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSuccess = true;
        state.passwordResetRequested = false;
        
        // Clear sensitive data
        state.passwordResetUserId = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Password reset failed";
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
  resetPasswordResetSuccess,
  clearPasswordResetData,
  checkAuthStatus,
  clearAuthState,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
