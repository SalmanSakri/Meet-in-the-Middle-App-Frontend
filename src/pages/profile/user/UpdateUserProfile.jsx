/**
 * @file EditProfilePage.jsx
 * @description User profile edit page to update user information
 */

import { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile } from '../../../redux/slices/profileSlice';
import { logoutUser } from '../../../redux/slices/authSlice';
import { showSuccess, showInfo, showError } from "../../../utils/toastUtils";
const EditProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile, isLoading, error, updateSuccess } = useSelector((state) => state.profile);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication and load profile data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user profile if not already loaded
    if (!profile) {
      dispatch(fetchUserProfile());
    } else {
      // Pre-fill form with existing data
      setFormData({
        name: profile.name || '',
      });
    }
  }, [dispatch, isAuthenticated, navigate, profile]);

  // Handle redirect after successful update
  useEffect(() => {
    if (updateSuccess) {
      // Navigate back to profile page after a short delay
      dispatch(logoutUser()).then(() => {
        navigate("/login");
      });
      showSuccess("Update successful! Please login to continue.");
    }
  }, [updateSuccess, navigate]);

  // Form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Dispatch update profile action
    dispatch(updateUserProfile({ name: formData.name.trim() }))
      .unwrap()
      .catch((error) => {
        console.error('Update profile error:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/dashboard');
  };

  // Render loading state
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </div>
        
        {/* Success message */}
        {updateSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Profile updated successfully! Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Name field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
              disabled={isSubmitting}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
          
          {/* Email field (read-only) */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (Cannot be changed)
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">Email address cannot be updated</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting || updateSuccess}
              className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center ${
                (isSubmitting || updateSuccess) && 'opacity-70 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : updateSuccess ? (
                'Saved!'
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={`flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ${
                isSubmitting && 'opacity-70 cursor-not-allowed'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
        
        {/* Back to profile link */}
        <div className="px-6 pb-6">
          <Link to="/profile" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;