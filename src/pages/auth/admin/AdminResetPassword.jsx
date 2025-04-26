import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword, resendOTP, clearError } from '../../../redux/slices/adminAuthSlice';

const AdminResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const adminId = searchParams.get('id');
  
  const { error, isLoading } = useSelector(state => state.adminAuth);
  
  useEffect(() => {
    if (!adminId) navigate('/admin/forgot-password');
    return () => dispatch(clearError());
  }, [adminId, navigate, dispatch]);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const validate = () => {
    const errors = {};
    
    if (!formData.otp) {
      errors.otp = 'Verification code is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'Verification code must be 6 digits';
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Fixed: Only send the required fields in the exact structure expected by the API
    dispatch(resetPassword({
      adminId: adminId,
      otp: formData.otp,
      newPassword: formData.newPassword
    }))
      .then((result) => {
        // Check if the result was successful
        if (!result.error) {
          navigate('/admin/login', { 
            state: { message: 'Password reset successfully. Please login.' }
          });
        }
      });
  };
  
  const handleResendOTP = () => {
    dispatch(resendOTP({ 
      adminId: adminId, 
      purpose: 'admin_password_reset' 
    }));
    setCountdown(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Verification Code
              <input
                className={`shadow appearance-none border ${
                  formErrors.otp ? 'border-red-500' : 'border-gray-300'
                } rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline`}
                type="text"
                placeholder="Enter 6-digit code"
                name="otp"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                maxLength={6}
              />
            </label>
            {formErrors.otp && (
              <p className="text-red-500 text-xs italic">{formErrors.otp}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Password
              <input
                className={`shadow appearance-none border ${
                  formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                } rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline`}
                type="password"
                placeholder="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </label>
            {formErrors.newPassword && (
              <p className="text-red-500 text-xs italic">{formErrors.newPassword}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
              <input
                className={`shadow appearance-none border ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline`}
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </label>
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-xs italic">{formErrors.confirmPassword}</p>
            )}
          </div>

          <button
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              className={`text-sm text-blue-500 hover:text-blue-800 ${
                countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              className="text-sm text-blue-500 hover:text-blue-800"
              to="/admin/login"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPassword;