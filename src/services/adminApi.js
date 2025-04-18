import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    // Use the environment variable directly for the baseUrl
    baseUrl: import.meta.env.VITE_API_ADMIN_URL || "/api/admin",
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the adminAuth state
      const token = getState().adminAuth.token;

      // If we have a token, add it to the headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "login", // Remove leading slash since baseUrl already includes it
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (adminData) => ({
        url: "register", // Remove leading slash
        method: "POST",
        body: adminData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        // Fixed: Change from email to emailData object
        url: "forgot-password", // Remove leading slash
        method: "POST",
        body: emailData, // Expect an object like { email: "user@example.com" }
      }),
    }),
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: "reset-password", // Remove leading slash
        method: "POST",
        body: resetData,
      }),
    }),
    getAllUsers: builder.query({
      query: () => "users", // Remove leading slash
    }),
    getUserMeetings: builder.query({
      query: (userId) => `users/${userId}/meetings`, // Remove leading slash
    }),
    getMeetingDetails: builder.query({
      query: (meetingId) => `meetings/${meetingId}`, // Remove leading slash
    }),
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
