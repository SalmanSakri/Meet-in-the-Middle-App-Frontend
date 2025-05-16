import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * API service for admin operations using RTK Query
 */
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_ADMIN_URL,
    prepareHeaders: (headers, { getState }) => {
      try {
        const token = getState().adminAuth.token;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (error) {
        console.error("Error setting auth header:", error);
      }
      return headers;
    }
  }),
  tagTypes: ['Profile', 'Users', 'Meetings'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Login failed";
      },
    }),
    
    register: builder.mutation({
      query: (adminData) => ({
        url: "register",
        method: "POST",
        body: adminData,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Registration failed";
      },
    }),
    
    verifyOTP: builder.mutation({
      query: (verificationData) => ({
        url: "verify-otp",
        method: "POST",
        body: verificationData,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "OTP verification failed";
      },
    }),
    
    resendOTP: builder.mutation({
      query: (data) => ({
        url: "resend-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to resend OTP";
      },
    }),
    
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: "forgot-password",
        method: "POST",
        body: emailData,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Password reset request failed";
      },
    }),
    
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: "reset-password",
        method: "POST",
        body: {
          adminId: resetData.adminId,
          otp: resetData.otp,
          newPassword: resetData.newPassword
        }
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Password reset failed";
      },
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Logout failed";
      },
    }),
    
    // Admin profile endpoint
    getProfile: builder.query({
      query: () => "profile",
      providesTags: ['Profile'],
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to fetch profile";
      },
    }),
    
    // User management endpoints
    getAllUsers: builder.query({
      query: () => "users",
      providesTags: ['Users'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to fetch users";
      },
    }),
    
    getUserMeetings: builder.query({
      query: (userId) => `users/${userId}/meetings`,
      providesTags: (result, error, userId) => [{ type: 'Meetings', id: userId }],
      keepUnusedDataFor: 60, // Cache for 1 minute
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to fetch user meetings";
      },
    }),
    
    getMeetingDetails: builder.query({
      query: (meetingId) => `meetings/${meetingId}`,
      providesTags: (result, error, meetingId) => [{ type: 'Meetings', id: meetingId }],
      keepUnusedDataFor: 60, // Cache for 1 minute
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to fetch meeting details";
      },
    }),
  }),
});

// Export hooks for use in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useGetAllUsersQuery,
  useGetUserMeetingsQuery,
  useGetMeetingDetailsQuery,
} = adminApi;