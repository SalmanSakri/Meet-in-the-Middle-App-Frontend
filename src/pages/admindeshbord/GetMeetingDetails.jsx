import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetMeetingDetailsQuery } from '../../services/adminApi';
import { MapPin, Clock, Users, Info, ChevronLeft, ExternalLink } from 'lucide-react';

const GetMeetingDetails = () => {
  const { meetingId } = useParams();
  const { data, error, isLoading } = useGetMeetingDetailsQuery(meetingId);

  if (isLoading) return <div className="flex justify-center p-8"><div className="loader">Loading...</div></div>;

  if (error) return (
    <div className="p-6 bg-red-50 rounded-lg">
      <h2 className="text-xl font-bold text-red-700">Error loading meeting details</h2>
      <p className="text-red-600">{error.message || 'Failed to fetch meeting details'}</p>
      <Link 
        to="/admin/users" 
        className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Back to Users
      </Link>
    </div>
  );

  const meeting = data?.meeting;
  
  if (!meeting) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-700">Meeting Not Found</h2>
        <p className="text-yellow-600">The requested meeting could not be found.</p>
        <Link 
          to="/admin/users" 
          className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  // Format dates
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  // Determine meeting status
  const getMeetingStatus = () => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    if (startTime > now) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (startTime <= now && endTime >= now) return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
  };
  
  const status = getMeetingStatus();

  // Calculate attendance stats
  const attendanceStats = {
    total: meeting.attendees.length,
    accepted: meeting.attendees.filter(a => a.status === 'accepted').length,
    declined: meeting.attendees.filter(a => a.status === 'declined').length,
    pending: meeting.attendees.filter(a => a.status === 'pending').length
  };

  return (
    <div className="p-6">
      <Link 
        to={`/admin/users/${meeting.creator._id}/meetings`} 
        className="text-indigo-600 hover:text-indigo-900 mb-4 inline-flex items-center"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to User Meetings
      </Link>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <span className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div>
              {meeting.meetingUrl && (
                <a 
                  href={meeting.meetingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-flex items-center"
                >
                  Join Meeting <ExternalLink size={16} className="ml-1" />
                </a>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <Info size={18} className="mr-2 text-indigo-600" /> Meeting Details
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4 flex items-start">
                  <Clock size={18} className="mr-2 mt-1 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p>{formatDateTime(meeting.startTime)}</p>
                    <p className="text-sm text-gray-500 mt-2">End Time</p>
                    <p>{formatDateTime(meeting.endTime)}</p>
                  </div>
                </div>
                
                {meeting.location && meeting.location.name && (
                  <div className="mb-4 flex items-start">
                    <MapPin size={18} className="mr-2 mt-1 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{meeting.location.name}</p>
                      {meeting.location.address && <p className="text-sm">{meeting.location.address}</p>}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="whitespace-pre-line">{meeting.description || 'No description provided'}</p>
                </div>
              </div>

              {meeting.locationSuggestions && meeting.locationSuggestions.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <MapPin size={18} className="mr-2 text-indigo-600" /> Location Suggestions
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {meeting.locationSuggestions.map((location, index) => (
                        <div key={index} className="p-3 bg-white shadow-sm rounded border border-gray-100">
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-600">{location.address}</div>
                          <div className="flex items-center mt-1">
                            <span className="text-sm">{location.rating ? `★ ${location.rating}` : 'No rating'}</span>
                            {location.distance && <span className="text-sm ml-2">• {location.distance.toFixed(1)} km away</span>}
                            {location.category && <span className="text-xs bg-gray-100 rounded px-2 py-1 ml-2">{location.category}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <Users size={18} className="mr-2 text-indigo-600" /> Attendees
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-700">{attendanceStats.accepted}</div>
                    <div className="text-xs text-green-600">Accepted</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-semibold text-red-700">{attendanceStats.declined}</div>
                    <div className="text-xs text-red-600">Declined</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-semibold text-yellow-700">{attendanceStats.pending}</div>
                    <div className="text-xs text-yellow-600">Pending</div>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {meeting.attendees.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {meeting.attendees.map((attendee, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                {attendee.name ? attendee.name.charAt(0).toUpperCase() : 
                                 attendee.user && attendee.user.name ? attendee.user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {attendee.name || (attendee.user && attendee.user.name) || 'Unnamed Attendee'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {attendee.email || (attendee.user && attendee.user.email) || attendee.phone || ''}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            attendee.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            attendee.status === 'declined' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center">No attendees for this meeting</p>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <Users size={18} className="mr-2 text-indigo-600" /> Creator
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-600">
                      {meeting.creator.name ? meeting.creator.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">{meeting.creator.name}</div>
                    <div className="text-sm text-gray-500">{meeting.creator.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Meeting created and updated timestamps */}
          <div className="mt-6 text-xs text-gray-500 flex justify-between">
            <span>Created: {formatDateTime(meeting.createdAt)}</span>
            <span>Last Updated: {formatDateTime(meeting.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetMeetingDetails;