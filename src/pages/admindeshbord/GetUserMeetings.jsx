// UserMeetings.jsx - getUserMeetings
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetUserMeetingsQuery } from '../../services/adminApi';

const GetUserMeetings = () => {
  const { userId } = useParams();
  const { data, error, isLoading } = useGetUserMeetingsQuery(userId);
  const [statusFilter, setStatusFilter] = useState('all');
  
  if (isLoading) return <div className="flex justify-center p-8"><div className="loader">Loading...</div></div>;
  
  if (error) return (
    <div className="p-6 bg-red-50 rounded-lg">
      <h2 className="text-xl font-bold text-red-700">Error loading meetings</h2>
      <p className="text-red-600">{error.message || 'Failed to fetch user meetings'}</p>
      <Link 
        to="/admin/users" 
        className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Back to Users
      </Link>
    </div>
  );

  const meetings = data?.meetings || [];
  
  // Get current date for status comparison
  const now = new Date();
  
  // Filter meetings based on status
  const filteredMeetings = meetings.filter(meeting => {
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'upcoming' && startTime > now) return true;
    if (statusFilter === 'ongoing' && startTime <= now && endTime >= now) return true;
    if (statusFilter === 'completed' && endTime < now) return true;
    return false;
  });

  // Function to determine meeting status
  const getMeetingStatus = (meeting) => {
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    if (startTime > now) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (startTime <= now && endTime >= now) return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-900 mb-2 inline-block">
            &larr; Back to Users
          </Link>
          <h1 className="text-2xl font-bold">User Meetings</h1>
          {meetings.length > 0 && meetings[0].creator && (
            <div className="text-gray-600">
              {meetings[0].creator.name} ({meetings[0].creator.email})
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1 rounded ${statusFilter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatusFilter('ongoing')}
            className={`px-3 py-1 rounded ${statusFilter === 'ongoing' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded ${statusFilter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredMeetings.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeetings.map((meeting) => {
                const status = getMeetingStatus(meeting);
                return (
                  <tr key={meeting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(meeting.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{meeting.creator.name}</div>
                      <div className="text-sm text-gray-500">{meeting.creator.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/admin/meetings/${meeting._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500">No meetings found for this user.</p>
        </div>
      )}
    </div>
  );
};

export default GetUserMeetings;