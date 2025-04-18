// // src/pages/auth/admin/AdminForgotPassword.jsx
// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import {
//   forgotPassword,
//   clearError,
// } from "../../../redux/slices/adminAuthSlice";

// const AdminForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const dispatch = useDispatch();
//   const { isLoading, error } = useSelector((state) => state.auth);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     dispatch(clearError());

//     try {
//       const result = await dispatch(forgotPassword(email)).unwrap();
//       setIsSubmitted(true);
//     } catch (err) {
//       // Error is handled by the Redux slice
//     }
//   };

//   if (isSubmitted) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
//           <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
//             Check Your Email
//           </h2>
//           <p className="text-center text-gray-600 mb-6">
//             If an account exists with the email provided, we've sent
//             instructions to reset your password.
//           </p>
//           <div className="text-center">
//             <Link
//               to="/admin-login"
//               className="text-blue-500 hover:text-blue-700"
//             >
//               Return to login
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
//         <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
//           Forgot Password
//         </h2>
//         <p className="text-center text-gray-600 mb-6">
//           Enter your email address and we'll send you instructions to reset your
//           password.
//         </p>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error.message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="email"
//             >
//               Email Address
//             </label>
//             <input
//               id="email"
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
//             >
//               {isLoading ? "Submitting..." : "Send Reset Instructions"}
//             </button>
//           </div>

//           <div className="text-center mt-4">
//             <Link
//               to="/admin-login"
//               className="text-blue-500 hover:text-blue-700 text-sm"
//             >
//               Back to login
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminForgotPassword;


import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from '../../../services/adminApi';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const response = await forgotPassword({ email }).unwrap();
      setMessage(
        response.message || "Password reset instructions sent to your email"
      );
    } catch (err) {
      setError(err.data?.message || "Failed to send reset instructions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Admin Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to receive password reset instructions
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {message && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? "Sending..." : "Send Reset Instructions"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/admin/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPassword;