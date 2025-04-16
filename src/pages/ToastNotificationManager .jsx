import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useEffect } from "react";

/**
 * Toast Notification Manager Component
 * Listens to Redux store for errors and success messages
 * Displays appropriate toast notifications
 */
const ToastNotificationManager = () => {
  const { error, registrationSuccess } = useSelector((state) => state.auth);

  /**
   * Display toast notifications based on Redux state changes
   */
  useEffect(() => {
    // Show error toast
    if (error) {
      toast.error(error);
    }

    // Show success toast
    if (registrationSuccess) {
      toast.success("Registration successful! Please verify your email.");
    }
  }, [error, registrationSuccess]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default ToastNotificationManager;
