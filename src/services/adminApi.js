import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper to ensure consistent URL formatting
const formatUrl = (url) => url.startsWith('/') ? url.substring(1) : url;

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_ADMIN_URL || "/api/admin",
    prepareHeaders: (headers, { getState }) => {
      // Try to get the token from the adminAuth state
      try {
        const token = getState().adminAuth.token;
        
        // If we have a token, add it to the headers
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (error) {
        console.error("Error setting auth header:", error);
      }
      
      return headers;
    },
    // Add error handling for the base query
    responseHandler: (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: formatUrl("login"),
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (adminData) => ({
        url: formatUrl("register"),
        method: "POST",
        body: adminData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: formatUrl("forgot-password"),
        method: "POST",
        body: emailData,
      }),
      // Properly handle the security-focused response
      transformResponse: (response, meta, arg) => {
        // Make sure we still return the original response
        return {
          ...response,
          // For demonstration/development, add these fields
          // REMOVE IN PRODUCTION!
          email: arg.email
        };
      },
    }),
    resetPassword: builder.mutation({
      query: ({ userId, otp, newPassword }) => ({
        url: formatUrl("reset-password"),
        method: "POST",
        body: { userId, otp, newPassword }
      }),
    }),
    getAllUsers: builder.query({
      query: () => formatUrl("users"),
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    getUserMeetings: builder.query({
      query: (userId) => formatUrl(`users/${userId}/meetings`),
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),
    getMeetingDetails: builder.query({
      query: (meetingId) => formatUrl(`meetings/${meetingId}`),
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),
    // Add proper error handling with transformResponse
    transformResponse: (response, meta, arg) => {
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    transformErrorResponse: (response, meta, arg) => {
      return response.data || { message: "An unknown error occurred" };
    },
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAllUsersQuery,
  useGetUserMeetingsQuery,
  useGetMeetingDetailsQuery,
} = adminApi;