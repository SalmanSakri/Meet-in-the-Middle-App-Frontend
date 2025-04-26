import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP, clearError } from '../../../redux/slices/adminAuthSlice';

const AdminVerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [countdown, setCountdown] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const adminId = searchParams.get('id');
  const purpose = searchParams.get('purpose') || 'admin_verification';

  const { isAuthenticated, error, isLoading } = useSelector(state => state.adminAuth);

  useEffect(() => {
    // If already authenticated and not resetting password, redirect to dashboard
    if (isAuthenticated && purpose === 'admin_verification') {
      navigate('/admin/dashboard');
    }

    // Clear errors when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, purpose, navigate, dispatch]);

  useEffect(() => {
    // Set up countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validate = () => {
    const errors = {};

    if (!otp) {
      errors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(otp)) {
      errors.otp = 'OTP must be 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      dispatch(verifyOTP({
        adminId,
        otp,
        purpose
      }));
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      dispatch(resendOTP({
        adminId,
        purpose
      }));
      setCountdown(60); // Set countdown to 60 seconds
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">OTP Verification</h1>
        <p className="text-center text-gray-600 mb-6">
          {purpose === 'admin_verification'
            ? 'Enter the verification code sent to your email'
            : 'Enter the password reset code sent to your email'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
              Verification Code
            </label>
            <input
              className={`shadow appearance-none border ${formErrors.otp ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
            />
            {formErrors.otp && (
              <p className="text-red-500 text-xs italic">{formErrors.otp}</p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className={`text-sm text-center py-2 ${countdown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-500 hover:text-blue-800 cursor-pointer'}`}
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;