/**
 * @file profileSlice.js
 * @description Redux slice for user profile management
 * @version 1.0.0
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "../../services/profileService";

/**
 * Initial state for the profile slice
 * @type {Object}
 */
const initialState = {
  // User profile data
  profile: null,
  
  // Loading state for async operations
  isLoading: false,
  
  // Error message for failed operations
  error: null,
  
  // Update success flag
  updateSuccess: false,
};

/**
 * Async thunk for fetching user profile
 * Handles the API call and response processing
 *
 * @type {AsyncThunk}
 */
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      // Call the profile service
      const response = await profileService.getProfile();
      
      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data.user;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        "Failed to fetch profile";
      console.error("Profile fetch error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for updating user profile
 * Handles the API call and response processing
 *
 * @type {AsyncThunk}
 */
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // Input validation
      if (!profileData.name || profileData.name.trim() === "") {
        return rejectWithValue("Name cannot be empty");
      }
      
      // Call the profile update service
      const response = await profileService.updateProfile(profileData);
      
      // Handle unsuccessful response
      if (!response.success) {
        return rejectWithValue(response.error.message);
      }
      
      return response.data.user;
    } catch (error) {
      // Handle and format errors with detailed message
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        "Failed to update profile";
      console.error("Profile update error:", error);
      return rejectWithValue(message);
    }
  }
);

/**
 * Profile slice with reducers for profile operations
 *
 * @type {Slice}
 */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    // Reset error state
    resetProfileError: (state) => {
      state.error = null;
    },
    
    // Reset update success flag
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    
    // Clear profile state
    clearProfileState: (state) => {
      // Reset to initial state
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile reducers
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch profile";
      })
      
      // Update profile reducers
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile";
        state.updateSuccess = false;
      });
  },
});

// Export actions
export const {
  resetProfileError,
  resetUpdateSuccess,
  clearProfileState,
} = profileSlice.actions;

// Export reducer
export default profileSlice.reducer;