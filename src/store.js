import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./redux/slices/authSlice";
import meetingsReducer from "./redux/slices/meetingSlice";
/**
 * Configure Redux store with all reducers
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    meetings: meetingsReducer,
    // Add other reducers here as needed
  },
  // Add middleware or other configuration as needed
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
