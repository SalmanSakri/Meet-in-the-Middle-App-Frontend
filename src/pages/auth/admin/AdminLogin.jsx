// // import React, { useState, useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { Link, useNavigate } from "react-router-dom";
// // import { login, clearError } from "../../../redux/slices/adminAuthSlice";

// // // Form validation
// // const validateEmail = (email) => {
// //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //   return emailRegex.test(String(email).toLowerCase());
// // };

// // const AdminLogin = () => {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [formErrors, setFormErrors] = useState({});

// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const { isAuthenticated, isLoading, error, otpRequired } = useSelector(
// //     (state) => state.auth
// //   );

// //   // Clear errors on component mount
// //   useEffect(() => {
// //     dispatch(clearError());
// //   }, [dispatch]);

// //   // Redirect if already authenticated
// //   useEffect(() => {
// //     if (isAuthenticated) {
// //       navigate("/admin/dashboard");
// //     } else if (otpRequired) {
// //       navigate("/admin/verify-otp");
// //     }
// //   }, [isAuthenticated, otpRequired, navigate]);

// //   const validateForm = () => {
// //     const errors = {};

// //     if (!email.trim()) {
// //       errors.email = "Email is required";
// //     } else if (!validateEmail(email)) {
// //       errors.email = "Invalid email format";
// //     }

// //     if (!password) {
// //       errors.password = "Password is required";
// //     }

// //     setFormErrors(errors);
// //     return Object.keys(errors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (validateForm()) {
// //       dispatch(login({ email, password }));
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
// //       <div className="max-w-md w-full space-y-8">
// //         <div>
// //           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
// //             Admin Login
// //           </h2>
// //         </div>

// //         {error && (
// //           <div className="bg-red-50 border-l-4 border-red-400 p-4">
// //             <div className="flex">
// //               <div className="flex-shrink-0">
// //                 <svg
// //                   className="h-5 w-5 text-red-400"
// //                   viewBox="0 0 20 20"
// //                   fill="currentColor"
// //                 >
// //                   <path
// //                     fillRule="evenodd"
// //                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
// //                     clipRule="evenodd"
// //                   />
// //                 </svg>
// //               </div>
// //               <div className="ml-3">
// //                 <p className="text-sm text-red-700">{error.message}</p>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
// //           <div className="rounded-md shadow-sm -space-y-px">
// //             <div>
// //               <label htmlFor="email-address" className="sr-only">
// //                 Email address
// //               </label>
// //               <input
// //                 id="email-address"
// //                 name="email"
// //                 type="email"
// //                 autoComplete="email"
// //                 required
// //                 className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
// //                   formErrors.email ? "border-red-300" : "border-gray-300"
// //                 } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
// //                 placeholder="Email address"
// //                 value={email}
// //                 onChange={(e) => setEmail(e.target.value)}
// //               />
// //               {formErrors.email && (
// //                 <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
// //               )}
// //             </div>

// //             <div>
// //               <label htmlFor="password" className="sr-only">
// //                 Password
// //               </label>
// //               <input
// //                 id="password"
// //                 name="password"
// //                 type="password"
// //                 autoComplete="current-password"
// //                 required
// //                 className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
// //                   formErrors.password ? "border-red-300" : "border-gray-300"
// //                 } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
// //                 placeholder="Password"
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //               />
// //               {formErrors.password && (
// //                 <p className="mt-1 text-sm text-red-600">
// //                   {formErrors.password}
// //                 </p>
// //               )}
// //             </div>
// //           </div>

// //           <div className="flex items-center justify-between">
// //             <div className="text-sm">
// //               <Link
// //                 to="/admin/forgot-password"
// //                 className="font-medium text-indigo-600 hover:text-indigo-500"
// //               >
// //                 Forgot your password?
// //               </Link>
// //             </div>
// //           </div>

// //           <div>
// //             <button
// //               type="submit"
// //               disabled={isLoading}
// //               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
// //             >
// //               {isLoading ? (
// //                 <span className="flex items-center">
// //                   <svg
// //                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
// //                     xmlns="http://www.w3.org/2000/svg"
// //                     fill="none"
// //                     viewBox="0 0 24 24"
// //                   >
// //                     <circle
// //                       className="opacity-25"
// //                       cx="12"
// //                       cy="12"
// //                       r="10"
// //                       stroke="currentColor"
// //                       strokeWidth="4"
// //                     ></circle>
// //                     <path
// //                       className="opacity-75"
// //                       fill="currentColor"
// //                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
// //                     ></path>
// //                   </svg>
// //                   Signing in...
// //                 </span>
// //               ) : (
// //                 "Sign in"
// //               )}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminLogin;



// import { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// // import { login, reset } from "../../features/auth/authSlice";
// import { login, reset } from "../../../redux/slices/adminAuthSlice";
// import Spinner from "../../../component/LoadingSpinner";
// import { toast } from "react-toastify";

// function AdminLogin() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const { email, password } = formData;
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { admin, isLoading, isError, isSuccess, message } = useSelector(
//     (state) => state.auth
//   );

//   useEffect(() => {
//     if (isError) {
//       toast.error(message);
//     }

//     if (isSuccess && admin) {
//       navigate("/dashboard");
//     }

//     dispatch(reset());
//   }, [admin, isError, isSuccess, message, navigate, dispatch]);

//   const onChange = (e) => {
//     setFormData((prevState) => ({
//       ...prevState,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const onSubmit = (e) => {
//     e.preventDefault();
//     const adminData = {
//       email,
//       password,
//     };
//     dispatch(login(adminData));
//   };

//   if (isLoading) {
//     return <Spinner />;
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Admin Login
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={onSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="email" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={onChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={onChange}
//               />
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="text-sm">
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="font-medium text-indigo-600 hover:text-indigo-500"
//               >
//                 Forgot your password?
//               </button>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               Sign in
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AdminLogin;



// src/components/admin/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { useLoginMutation } from '../../services/adminApi';
import { useLoginMutation } from '../../../services/adminApi';
import { 
  setCredentials, 
  setError, 
  setLoading,
  selectAdminIsAuthenticated,
  selectAdminLoading,
  selectAdminError 
} from '../../../redux/slices/adminAuthSlice';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isAuthenticated = useSelector(selectAdminIsAuthenticated);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  
  const [login] = useLoginMutation();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      dispatch(setError('Email and password are required'));
      return;
    }
    
    try {
      dispatch(setLoading(true));
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ admin: result.admin, token: result.token }));
      navigate('/admin/dashboard');
    } catch (err) {
      dispatch(setError(err.data?.message || 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="mt-20 flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label
                htmlFor="email-address"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mt-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outlin"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="/admin/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;