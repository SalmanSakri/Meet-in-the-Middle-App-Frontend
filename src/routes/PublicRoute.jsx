import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import SignUp from "./../pages/auth/SignUp ";
import Login from "../pages/auth/Login";
import ForgetPassword from "../pages/auth/forgetpassword/ForgetPwd";
import OtpVerification from "../pages/auth/forgetpassword/OtpVerification";
import CreatePassword from "../pages/auth/forgetpassword/CreatePwd";
import Layout from "../layout/Layout";

import ToastNotificationManager from "../pages/ToastNotificationManager ";
// Admin Authentication Components
import AdminRegister from "../pages/auth/admin/AdminRegister";
import AdminLogin from "../pages/auth/admin/AdminLogin";
import AdminForgotPassword from "../pages/auth/admin/AdminForgotPassword";
import AdminVerifyOTP from "../pages/auth/admin/AdminVerifyOTP";
import AdminResetPassword from "../pages/auth/admin/AdminResetPassword"
// Admin Layout and Protected Routes
import AdminLayout from '../layout/AdminLayout';
import PrivateAdminRoute from '../routes/PrivateAdminRoute';
import AdminDashboard from '../pages/admindeshbord/AdminDashboard';

import GetAllUsers from "../pages/admindeshbord/GetAllUsers";

import GetMeetingDetails from "../pages/admindeshbord/GetMeetingDetails";
import GetUserMeetings from "../pages/admindeshbord/GetUserMeetings";
import CreateMeeting from "../pages/meeting/CreateMeeting";
import MeetingDetails from "../pages/meeting/MeetingDetails";
import EditMeeting from "../pages/meeting/EditMeeting ";

import InvitationResponse from "../pages/InvitationResponse";

import MeetingLocation from "../component/MeetingLocation";

const PublicRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/create-password" element={<CreatePassword />} />

      {/* ADMIN AUTH */}
      <Route path="/admin/singup" element={<Layout><AdminRegister /></Layout>} />
      <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />
      <Route path="/admin/forgot-password" element={<Layout><AdminForgotPassword /></Layout>} />
      <Route path="/admin/reset-password" element={<Layout><AdminResetPassword /></Layout>} />
      <Route path="/admin/verify-otp" element={<Layout><AdminVerifyOTP /></Layout>} />

      {/* ADMIN PAGES */}
   
    

      {/* Admin Protected Routes */}
      <Route element={<PrivateAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Add other admin routes here */}
          <Route path="/admin/users" element={<GetAllUsers />}/>
          <Route path="/admin/users/:userId/meetings" element={<GetUserMeetings/>} />
          <Route path="/admin/meetings/:meetingId" element={<GetMeetingDetails />} />
          <Route path="/admin/meetings" element={<div>Meetings Management Page</div>} />
        </Route>
      </Route>



      {/* Dashboard */}
      <Route path="/layout" element={<Layout />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

      {/* MEETING */}
      <Route path="/MeetingDetails" element={<MeetingDetails />} />
      <Route path="/create-meeting" element={<Layout><CreateMeeting /></Layout>} />
      <Route path="/meetings/:meetingId/edit" element={<Layout><EditMeeting /></Layout>} />
      <Route path="/meetings/:meetingId" element={<Layout><MeetingDetails /></Layout>} />

      <Route path="/MeetingLocation" element={<Layout><MeetingLocation /></Layout>} />
      {/* New invitation response route */}
      <Route path="/invitation/:meetingId" element={<InvitationResponse />} />
      {/* Alternatively, you could use a structure like this for explicit actions */}
      <Route path="/response/:meetingId/:token/:response" element={<InvitationResponse />} />


      {/* 404 Route */}
      <Route path="*" element={<div>Page Not Found</div>} />

    </Routes>
  );
};

export default PublicRoute;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Dashboard from './pages/Dashboard';
// import Login from './pages/auth/Login';
// import SignUp from './pages/auth/SignUp';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import OtpVerification from './pages/auth/OtpVerification';
// import ProtectedRoute from './components/ProtectedRoute';
// import Layout from './components/Layout';
// import CreateMeeting from './pages/meetings/CreateMeeting';
// import MeetingDetail from './pages/meetings/MeetingDetail';
// import MeetingResponse from './pages/meetings/MeetingResponse';
// import NotFound from './pages/NotFound';

// <Router>
//   <ToastContainer position="top-right" autoClose={5000} />
//   <Routes>
//     {/* Auth Routes */}
//     <Route path="/login" element={<Login />} />
//     <Route path="/" element={<SignUp />} />
//     <Route path="/forget-password" element={<ForgotPassword />} />
//     <Route path="/otp-verification" element={<OtpVerification />} />
//     <Route path="/verify-otp" element={<OtpVerification />} />

//     {/* Protected Routes */}
//     <Route element={<ProtectedRoute />}>
//       <Route element={<Layout />}>
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/meetings/create" element={<CreateMeeting />} />
//         <Route path="/meetings/:meetingId" element={<MeetingDetail />} />
//       </Route>
//     </Route>

//     {/* Public Meeting Response */}
//     <Route
//       path="/meeting/response/:meetingId/:token/:response"
//       element={<MeetingResponse />}
//     />

//     {/* Redirect and Not Found */}
//     <Route path="/add" element={<Navigate to="/dashboard" replace />} />
//     <Route path="*" element={<NotFound />} />
//   </Routes>
// </Router>;
