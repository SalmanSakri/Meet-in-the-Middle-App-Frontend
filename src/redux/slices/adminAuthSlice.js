// src/redux/features/admin/adminAuthSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_ADMIN_URL;

// Initial state
const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  tempAdminId: null
};

// Admin Register
export const registerAdmin = createAsyncThunk(
  'adminAuth/register',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, adminData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'adminAuth/verifyOTP',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, verificationData);
      
      // If OTP verification is successful, store token
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Admin Login
export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      
      // Store token in localStorage
      localStorage.setItem('adminToken', response.data.token);
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
       
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  'adminAuth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  'adminAuth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, resetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  'adminAuth/resendOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/resend-otp`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Logout Admin
export const logoutAdmin = createAsyncThunk(
  'adminAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/logout`);
      
      // Remove token from storage and auth headers
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      
      return response.data;
    } catch (error) {
      // Still remove token even if API call fails
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Load Admin
export const loadAdmin = createAsyncThunk(
  'adminAuth/loadAdmin',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get token from state
      const token = getState().adminAuth.token;
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get admin profile 
      const response = await axios.get(`${API_URL}/profile`);
      return response.data;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Admin Auth Slice
const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdmin: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  },
  extraReducers: (builder) => {
    builder
      // Register Admin
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.tempAdminId = action.payload.adminId;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.otpSent = false;
        state.tempAdminId = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'OTP verification failed';
      })
      
      // Login Admin
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        if (action.payload.adminId) {
          state.tempAdminId = action.payload.adminId;
        }
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Forgot password request failed';
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = false;
        state.tempAdminId = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Password reset failed';
      })
      
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to resend OTP';
      })
      
      // Logout Admin
      .addCase(logoutAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
      })
      .addCase(logoutAdmin.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
      })
      
      // Load Admin
      .addCase(loadAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
      })
      .addCase(loadAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
        state.error = action.payload?.message || 'Failed to load admin profile';
      });
  }
});

export const { clearError, clearAdmin } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;