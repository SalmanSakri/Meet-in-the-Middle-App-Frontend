// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-toastify";

// const CreatePassword = () => {
//   const navigate = useNavigate();

//   // Form state
//   const [formData, setFormData] = useState({
//     otp: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // UI state
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Get email from session storage (set during ForgetPassword component)
//   const resetEmail = sessionStorage.getItem("resetEmail");
//   const userId = sessionStorage.getItem("resetUserId");

//   /**
//    * Updates form data when input fields change
//    * @param {Object} e - Event object
//    */
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     // Clear error when field is modified
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: "" });
//     }
//   };

//   /**
//    * Validates form fields
//    * @returns {boolean} - True if validation passes, false otherwise
//    */
//   const validateForm = () => {
//     const newErrors = {};

//     // OTP validation
//     if (!formData.otp.trim()) {
//       newErrors.otp = "OTP is required";
//     } else if (formData.otp.length !== 6 || !/^\d+$/.test(formData.otp)) {
//       newErrors.otp = "OTP must be 6 digits";
//     }

//     // Password validation
//     if (!formData.newPassword) {
//       newErrors.newPassword = "Password is required";
//     } else if (formData.newPassword.length < 6) {
//       newErrors.newPassword = "Password must be at least 6 characters";
//     }

//     // Confirm password validation
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = "Please confirm your password";
//     } else if (formData.newPassword !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Passwords don't match";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   /**
//    * Handles form submission for password reset
//    * @param {Object} e - Event object
//    */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       // API request to reset password with OTP
//       const response = await fetch(
//         "https://auth-banckend.onrender.com/api/auth/reset-password",
//         {
//           method: "POST",
//           body: JSON.stringify({
//             userId: userId,
//             otp: formData.otp,
//             newPassword: formData.newPassword,
//           }),
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Password reset failed");
//       }

//       // Clear reset data from session storage
//       sessionStorage.removeItem("resetEmail");
//       sessionStorage.removeItem("resetUserId");

//       // Show success message
//       toast.success("Password reset successful!");

//       // Navigate to login page
//       navigate("/login");
//     } catch (error) {
//       toast.error(error.message || "Failed to reset password");
//       console.error("Password reset error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Redirect if no email is found (user didn't go through the proper flow)
//   useEffect(() => {
//     if (!resetEmail || !userId) {
//       toast.error("Please request a password reset first");
//       navigate("/forget-password");
//     }
//   }, [resetEmail, userId, navigate]);

//   return (
//     <div className="flex flex-col md:flex-row h-screen w-full">
//       <div className="w-full  flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8">
//         <div className="w-2xl ">
//           <form className="px-14" onSubmit={handleSubmit}>
//             <h2 className="text-2xl font-semibold text-center mb-4">
//               Reset Password
//             </h2>
//             <p className="mb-8 text-gray-700 font-medium text-center">
//               Please enter the OTP sent to {resetEmail} and create your new
//               password.
//             </p>
//             {/* OTP Field */}
//             <div className="mb-4">
//               <label
//                 htmlFor="otp"
//                 className="block mb-2 text-sm font-medium text-gray-700"
//               >
//                 Verification Code (OTP)
//               </label>
//               <input
//                 id="otp"
//                 name="otp"
//                 type="text"
//                 className={`w-full px-3 py-2 border ${
//                   errors.otp ? "border-red-500" : "border-gray-300"
//                 } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 bg-gray-100`}
//                 placeholder="Enter 6-digit OTP"
//                 maxLength={6}
//                 value={formData.otp}
//                 onChange={handleChange}
//               />
//               {errors.otp && (
//                 <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
//               )}
//             </div>

//             {/* New Password Field */}
//             <div className="mb-4">
//               <label
//                 htmlFor="newPassword"
//                 className="block mb-2 text-sm font-medium text-gray-700"
//               >
//                 New Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="newPassword"
//                   name="newPassword"
//                   type={showNewPassword ? "text" : "password"}
//                   className={`w-full px-3 py-2 border ${
//                     errors.newPassword ? "border-red-500" : "border-gray-300"
//                   } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 bg-gray-100`}
//                   placeholder="Enter New Password"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-8 flex items-center px-5 text-gray-400 "
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                 >
//                   {showNewPassword ? (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                       ></path>
//                     </svg>
//                   ) : (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                       ></path>
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                       ></path>
//                     </svg>
//                   )}
//                 </button>
//               </div>
//               {errors.newPassword && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.newPassword}
//                 </p>
//               )}
//             </div>

//             {/* Confirm Password Field */}
//             <div className="mb-6">
//               <label
//                 htmlFor="confirmPassword"
//                 className="block mb-2 text-sm font-medium text-gray-700"
//               >
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   name="confirmPassword"
//                   className={`w-full px-3 py-2 border ${
//                     errors.confirmPassword
//                       ? "border-red-500"
//                       : "border-gray-300"
//                   } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 bg-gray-100`}
//                   placeholder="Confirm Password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0  right-8 flex items-center px-3 text-gray-400"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                       ></path>
//                     </svg>
//                   ) : (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                       ></path>
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                       ></path>
//                     </svg>
//                   )}
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.confirmPassword}
//                 </p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="w-full py-3 font-medium text-white bg-[#B71B36] rounded-md hover:bg-[#a01830] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 disabled:bg-[#d88a97] disabled:cursor-not-allowed pb-4"
//               disabled={loading}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Processing...
//                 </span>
//               ) : (
//                 "Create New Password"
//               )}
//             </button>

//             {/* Back to Login Link */}
//             <div className="text-center mt-12">
//               <Link
//                 to="/login"
//                 className="text-[#B71B36] hover:underline font-medium"
//               >
//                 Back to Login
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreatePassword;




import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { checkPasswordStrength } from "../../../utils/validationUtils";

const CreatePassword = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  });

  // Get email from session storage (set during ForgetPassword component)
  const resetEmail = sessionStorage.getItem("resetEmail");
  const userId = sessionStorage.getItem("resetUserId");

  /**
   * Updates form data when input fields change
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update password strength when password changes
    if (name === "newPassword") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  /**
   * Validates form fields
   * @returns {boolean} - True if validation passes, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // OTP validation
    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (formData.otp.length !== 6 || !/^\d+$/.test(formData.otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    // Password validation - enhanced similar to SignUp
    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (passwordStrength.score < 2) {
      newErrors.newPassword = "Please choose a stronger password";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission for password reset
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API request to reset password with OTP
      const response = await fetch(
        "http://localhost:7777/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            otp: formData.otp,
            newPassword: formData.newPassword,
          }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      // Clear reset data from session storage
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetUserId");

      // Show success message
      toast.success("Password reset successful!");

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no email is found (user didn't go through the proper flow)
  useEffect(() => {
    if (!resetEmail || !userId) {
      toast.error("Please request a password reset first");
      navigate("/forget-password");
    }
  }, [resetEmail, userId, navigate]);

  // Memoized password strength indicator
  const PasswordStrengthIndicator = useMemo(() => {
    if (!formData.newPassword) return null;

    const getColorClass = () => {
      if (passwordStrength.score <= 2) return "bg-red-500";
      if (passwordStrength.score <= 4) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <div className="mt-1">
        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColorClass()}`}
            style={{ width: `${Math.min(100, passwordStrength.score * 20)}%` }}
          ></div>
        </div>
        <p
          className={`text-xs mt-1 ${
            passwordStrength.score <= 2
              ? "text-red-500"
              : passwordStrength.score <= 4
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {passwordStrength.message}
        </p>
      </div>
    );
  }, [formData.newPassword, passwordStrength]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="w-full flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8">
        <div className="w-full max-w-md">
          <form className="px-6 sm:px-10 lg:px-14" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold text-center mb-4">
              Reset Password
            </h2>
            <p className="mb-8 text-gray-700 font-medium text-center">
              Please enter the OTP sent to {resetEmail} and create your new
              password.
            </p>
            {/* OTP Field */}
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Verification Code (OTP)
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                className={`w-full px-3 py-2 border ${
                  errors.otp ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 bg-gray-100`}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>

            {/* New Password Field */}
            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className={`w-full px-3 py-2 border ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 bg-gray-100`}
                  placeholder="Enter New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
              {PasswordStrengthIndicator}
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`w-full px-3 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 bg-gray-100`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 font-medium text-white bg-[#B71B36] rounded-md hover:bg-[#a01830] focus:outline-none focus:ring-2 focus:ring-[#B71B36]/50 disabled:bg-[#d88a97] disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create New Password"
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center mt-8">
              <Link
                to="/login"
                className="text-[#B71B36] hover:underline font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;