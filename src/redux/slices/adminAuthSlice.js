import { createSlice } from '@reduxjs/toolkit';
import { adminApi } from '../../services/adminApi';

// Initial state
const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: Boolean(localStorage.getItem('adminToken')),
  isLoading: false,
  error: null,
  otpSent: false,
  tempAdminId: null
};

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
    },
    setTempAdminId: (state, action) => {
      state.tempAdminId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register Admin
      .addMatcher(
        adminApi.endpoints.register.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.register.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.otpSent = true;
          state.tempAdminId = action.payload.adminId;
        }
      )
      .addMatcher(
        adminApi.endpoints.register.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Registration failed';
        }
      )
      
      // Verify OTP
      .addMatcher(
        adminApi.endpoints.verifyOTP.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.verifyOTP.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          if (action.payload.token) {
            state.isAuthenticated = true;
            state.admin = action.payload.admin;
            state.token = action.payload.token;
            localStorage.setItem('adminToken', action.payload.token);
          }
          state.otpSent = false;
          state.tempAdminId = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.verifyOTP.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'OTP verification failed';
        }
      )
      
      // Login Admin
      .addMatcher(
        adminApi.endpoints.login.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.login.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.admin = action.payload.admin;
          state.token = action.payload.token;
          localStorage.setItem('adminToken', action.payload.token);
        }
      )
      .addMatcher(
        adminApi.endpoints.login.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Login failed';
        }
      )
      
      // Forgot Password
      .addMatcher(
        adminApi.endpoints.forgotPassword.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.forgotPassword.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.otpSent = true;
          if (action.payload.adminId) {
            state.tempAdminId = action.payload.adminId;
          }
        }
      )
      .addMatcher(
        adminApi.endpoints.forgotPassword.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Forgot password request failed';
        }
      )
      
      // Reset Password
      .addMatcher(
        adminApi.endpoints.resetPassword.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.resetPassword.matchFulfilled,
        (state) => {
          state.isLoading = false;
          state.otpSent = false;
          state.tempAdminId = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.resetPassword.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Password reset failed';
        }
      )
      
      // Resend OTP
      .addMatcher(
        adminApi.endpoints.resendOTP.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.resendOTP.matchFulfilled,
        (state) => {
          state.isLoading = false;
          state.otpSent = true;
        }
      )
      .addMatcher(
        adminApi.endpoints.resendOTP.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to resend OTP';
        }
      )
      
      // Logout Admin
      .addMatcher(
        adminApi.endpoints.logout.matchPending,
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        adminApi.endpoints.logout.matchFulfilled,
        (state) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.admin = null;
          state.token = null;
          localStorage.removeItem('adminToken');
        }
      )
      .addMatcher(
        adminApi.endpoints.logout.matchRejected,
        (state) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.admin = null;
          state.token = null;
          localStorage.removeItem('adminToken');
        }
      )
      
      // Get Profile
      .addMatcher(
        adminApi.endpoints.getProfile.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        adminApi.endpoints.getProfile.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.admin = action.payload.admin;
        }
      )
      .addMatcher(
        adminApi.endpoints.getProfile.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.admin = null;
          state.token = null;
          localStorage.removeItem('adminToken');
          state.error = action.payload || 'Failed to load admin profile';
        }
      );
  }
});

// Export traditional thunks that call the RTK Query mutations
export const registerAdmin = (data) => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.register.initiate(data));
    return result;
  } catch (error) {
    return error;
  }
};

export const verifyOTP = (data) => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.verifyOTP.initiate(data));
    return result;
  } catch (error) {
    return error;
  }
};

export const loginAdmin = (credentials) => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.login.initiate(credentials));
    return result;
  } catch (error) {
    return error;
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.forgotPassword.initiate({ email }));
    return result;
  } catch (error) {
    return error;
  }
};

export const resetPassword = (data) => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.resetPassword.initiate(data));
    return result;
  } catch (error) {
    return error;
  }
};

export const resendOTP = (data) => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.resendOTP.initiate(data));
    return result;
  } catch (error) {
    return error;
  }
};

export const logoutAdmin = () => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.logout.initiate());
    return result;
  } catch (error) {
    return error;
  }
};

export const loadAdmin = () => async (dispatch) => {
  try {
    const result = await dispatch(adminApi.endpoints.getProfile.initiate());
    return result;
  } catch (error) {
    return error;
  }
};

export const { clearError, clearAdmin, setTempAdminId } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;