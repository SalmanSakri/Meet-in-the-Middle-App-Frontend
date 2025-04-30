import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import SignUp from "./../pages/auth/SignUp ";
import Login from "../pages/auth/Login";
import ForgetPassword from "../pages/auth/forgetpassword/ForgetPwd";
import OtpVerification from "../pages/auth/forgetpassword/OtpVerification";
import CreatePassword from "../pages/auth/forgetpassword/CreatePwd";
import Layout from "../layout/Layout";
import PageNotFound from "../component/PageNotFound"
import ToastNotificationManager from "../pages/ToastNotificationManager ";
// Admin Authentication Components
import AdminRegister from "../pages/auth/admin/AdminRegister";
import AdminLogin from "../pages/auth/admin/AdminLogin";
import AdminForgotPassword from "../pages/auth/admin/AdminForgotPassword";
import AdminVerifyOTP from "../pages/auth/admin/AdminVerifyOTP";
import AdminResetPassword from "../pages/auth/admin/AdminResetPassword"
// Admin Layout and Protected Routes
import AdminLayout from '../layout/AdminLayout';
import ProtectedRoute from "./ProtectedRoute";
import PrivateAdminRoute from '../routes/PrivateAdminRoute';
import AdminDashboard from '../pages/admindeshbord/AdminDashboard';

import GetAllUsers from "../pages/admindeshbord/GetAllUsers";

import GetMeetingDetails from "../pages/admindeshbord/GetMeetingDetails";
import GetUserMeetings from "../pages/admindeshbord/GetUserMeetings";
import CreateMeeting from "../pages/meeting/CreateMeeting";
import MeetingDetails from "../pages/meeting/MeetingDetails";
import EditMeeting from "../pages/meeting/EditMeeting ";
import UserProfile from "../pages/profile/user/ProfilePage";
import UpdateUserProfile from "../pages/profile/user/UpdateUserProfile";
import InvitationResponse from "../pages/InvitationResponse";

import MeetingLocation from "../component/MeetingLocation";
import RealTimeLocation from "../pages/RealTimeLocation";
const PublicRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/create-password" element={<CreatePassword />} />

      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route path="/layout" element={<Layout />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        {/* MEETING */}
        <Route path="/create-meeting" element={<Layout><CreateMeeting /></Layout>} />
        <Route path="/meetings/:meetingId/edit" element={<Layout><EditMeeting /></Layout>} />
        <Route path="/meetings/:meetingId" element={<Layout><MeetingDetails /></Layout>} />
        <Route path="/MeetingLocation" element={<Layout><MeetingLocation /></Layout>} />
        <Route path="/invitation/:meetingId" element={<InvitationResponse />} />
        {/*Profile Routes */ }
        <Route path="/user/profile" element={ <Layout><UserProfile/></Layout>}/>
        <Route path="/profile/edit" element={ <Layout><UpdateUserProfile/></Layout>}/>

        {/* ADMIN PAGES */}

        {/* ADMIN AUTH */}
        <Route path="/admin/singup" element={<Layout><AdminRegister /></Layout>} />
        <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />
        <Route path="/admin/forgot-password" element={<Layout><AdminForgotPassword /></Layout>} />
        <Route path="/admin/reset-password" element={<Layout><AdminResetPassword /></Layout>} />
        <Route path="/admin/verify-otp" element={<Layout><AdminVerifyOTP /></Layout>} />

        {/* Admin Protected Routes */}
        <Route element={<PrivateAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Add other admin routes here */}
            <Route path="/admin/users" element={<GetAllUsers />} />
            <Route path="/admin/users/:userId/meetings" element={<GetUserMeetings />} />
            <Route path="/admin/meetings/:meetingId" element={<GetMeetingDetails />} />
          </Route>
        </Route>

      </Route>

      <Route path="/response/:meetingId/:token/:response" element={<InvitationResponse />} />
      {/* 404 Route */}
      <Route path="*" element={<PageNotFound />} />
      <Route path="real" element={<RealTimeLocation />} />
      

    </Routes>
  );
};

export default PublicRoute;