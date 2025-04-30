/**
 * @file ProfilePage.jsx
 * @description User profile page to display user information
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserProfile } from '../../../redux/slices/profileSlice';
import { logoutUser } from '../../../redux/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { profile, isLoading, error } = useSelector((state) => state.profile);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile on component mount
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user profile data
    dispatch(fetchUserProfile())
      .unwrap()
      .then(() => setLoadingProfile(false))
      .catch((error) => {
        console.error('Failed to load profile:', error);
        setLoadingProfile(false);
      });
  }, [dispatch, isAuthenticated, navigate]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  // Render loading state
  if (loadingProfile || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 h-20 w-20 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchUserProfile())}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render profile page
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">My Profile</h1>
            <button
              onClick={handleLogout}
              className="text-white bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-blue-600 text-xl font-bold">
                {profile?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {profile?.name || user?.name || 'User'}
            </h2>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800">{profile?.email || user?.email || 'Not available'}</p>
            </div>

            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Verification Status</p>
              <div className="flex items-center mt-1">
                {profile?.isVerified || user?.isVerified ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    Not Verified
                  </span>
                )}
              </div>
            </div>

            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-800">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  : 'Not available'}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-6">
            <Link
              to="/profile/edit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;