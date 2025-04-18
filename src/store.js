import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./redux/slices/authSlice";
import meetingsReducer from "./redux/slices/meetingSlice";


import { adminApi } from "./services/adminApi";
import adminAuthReducer from "./redux/slices/adminAuthSlice";
/**
 * Configure Redux store with all reducers
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    meetings: meetingsReducer,
    adminAuth: adminAuthReducer,
    // userAuth: userAuthReducer, // Your existing user auth reducer
    [adminApi.reducerPath]: adminApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of RTK Query.
middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['meetings/updateLocation/rejected'],
        // Ignore these field paths in state
        ignoredPaths: ['meetings.error'],
      },
    }).concat(adminApi.middleware),
});

export default store;
