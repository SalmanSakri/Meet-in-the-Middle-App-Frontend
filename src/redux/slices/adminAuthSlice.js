import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { admin, token } = action.payload;
      state.admin = admin;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      // Store admin data and token in localStorage
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(admin));
    },
    clearCredentials: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Remove admin data from localStorage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    initAdmin: (state) => {
      // Check for existing admin session on app startup
      const token = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminData");

      if (token && adminData) {
        state.token = token;
        state.admin = JSON.parse(adminData);
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setError,
  setLoading,
  initAdmin,
} = adminAuthSlice.actions;

export const selectCurrentAdmin = (state) => state.adminAuth.admin;
export const selectAdminToken = (state) => state.adminAuth.token;
export const selectAdminIsAuthenticated = (state) =>
  state.adminAuth.isAuthenticated;
export const selectAdminLoading = (state) => state.adminAuth.loading;
export const selectAdminError = (state) => state.adminAuth.error;

export default adminAuthSlice.reducer;
