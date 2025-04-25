import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LocationTracker from "../location/LocationTracker";
import LocationSuggestions from "../../pages/location/LocationSuggestions";
import AttendeeLocationsMap from "../../pages/location/AttendeeLocationsMap";
import SelectMeetingLocation from "../location/SelectMeetingLocation";
import LoadingSpinner from "../../component/LoadingSpinner";
import {
  getMeetingById,
  deleteMeeting,
  updateLocation,
} from "../../redux/slices/meetingSlice";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUserCircle,
  FaCheck,
  FaTimes,
  FaQuestion,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEnvelope,
  FaPhoneAlt,
  FaUserPlus,
} from "react-icons/fa";

const MeetingDetail = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const MAP_API_URL = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEYL;

  const [selectedLocationSuggestion, setSelectedLocationSuggestion] =
    useState(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(MAP_API_URL);

  // Get user and meeting state from Redux
  const { user, token } = useSelector((state) => state.auth);
  const {
    currentMeeting: meeting,
    loading,
    error,
  } = useSelector((state) => state.meetings);

  // Fetch meeting details when component mounts or meetingId changes
  useEffect(() => {
    if (meetingId) {
      dispatch(getMeetingById(meetingId))
        .unwrap()
        .catch((err) => {
          // Check for authentication errors specifically
          if (
            err.includes("unauthorized") ||
            err.includes("not authorized") ||
            err.includes("Not authorized")
          ) {
            toast.error("You don't have permission to view this meeting");
            navigate("/dashboard");
          } else {
            toast.error(err || "Failed to load meeting details");
          }
        });
    }
  }, [meetingId, dispatch, navigate]);

  // Handle delete meeting action
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) {
      return;
    }

    try {
      const resultAction = await dispatch(deleteMeeting(meetingId));
      if (deleteMeeting.fulfilled.match(resultAction)) {
        toast.success("Meeting deleted successfully");
        navigate("/dashboard");
      } else if (deleteMeeting.rejected.match(resultAction)) {
        toast.error(
          resultAction.payload?.message || "Failed to delete meeting"
        );
      }
    } catch (err) {
      toast.error("Failed to delete meeting");
    }
  };

  // Handle location confirmation
  const handleLocationConfirmed = async (finalLocation) => {
    try {
      await dispatch(
        updateLocation({
          meetingId,
          location: finalLocation,
          token,
        })
      ).unwrap();

      toast.success("Meeting location updated successfully");
      setSelectedLocationSuggestion(null);
    } catch (err) {
      toast.error("Failed to update meeting location");
    }
  };

  const handleLocationSelection = (suggestion) => {
    setSelectedLocationSuggestion(suggestion);
  };

  // Memoized computations
  const formattedDateAndTime = useMemo(() => {
    if (!meeting) return { date: "", startTime: "", endTime: "" };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return {
      date: formatDate(meeting.startTime),
      startTime: formatTime(meeting.startTime),
      endTime: formatTime(meeting.endTime),
    };
  }, [meeting]);

  const isMeetingPast = useMemo(() => {
    return meeting && new Date(meeting.endTime) < new Date();
  }, [meeting]);

  const isCreator = useMemo(() => {
    return (
      meeting?.creator &&
      user &&
      (meeting.creator._id === user._id || meeting.creator._id === user.id)
    );
  }, [meeting, user]);

  // Status utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-500";
      case "declined":
        return "text-red-500";
      case "pending":
      default:
      return "text-yellow-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <FaCheck className={`mr-2 ${getStatusColor(status)}`} />;
      case "declined":
        return <FaTimes className={`mr-2 ${getStatusColor(status)}`} />;
case "pending":
default:
        return <FaQuestion className={`mr-2 ${getStatusColor(status)}`} />;
    }
};

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-red-500 text-5xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Error Loading Meeting
            </h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Meeting Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Meeting Header */}
          <div className="bg-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{meeting.title}</h2>
                <p className="mb-4 opacity-90">
                  {meeting.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>{formattedDateAndTime.date}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>
                      {formattedDateAndTime.startTime} -{" "}
                      {formattedDateAndTime.endTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-1">
                {isMeetingPast ? (
                  <span className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-full font-medium">
                    Past
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full font-medium">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meeting Body */}
          <div className="p-6">
            {/* Location Section */}
            {meeting.location &&
              (meeting.location.name ||
                meeting.location.address ||
                (meeting.location.coordinates &&
                  meeting.location.coordinates[0] !== 0)) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Location
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-red-500 text-lg mt-1 mr-3" />
                      <div>
                        {meeting.location.name && (
                          <p className="font-medium">{meeting.location.name}</p>
                        )}
                        {meeting.location.address && (
                          <p className="text-gray-600">
                            {meeting.location.address}
                          </p>
                        )}
                        {meeting.location.coordinates &&
                          meeting.location.coordinates[0] !== 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                              Coordinates: [
                              {meeting.location.coordinates[0].toFixed(6)},{" "}
                              {meeting.location.coordinates[1].toFixed(6)}]
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Location tracking component */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Location Sharing
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <LocationTracker meetingId={meetingId} token={token} />
              </div>
            </div>

            {/* Map showing all attendee locations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Attendee Locations
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <AttendeeLocationsMap
                  meetingId={meetingId}
                  token={token}
                  googleMapsApiKey={googleMapsApiKey}
                />
              </div>
            </div>

            {/* Location suggestions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Location Suggestions
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <LocationSuggestions
                  meetingId={meetingId}
                  token={token}
                  onSelectLocation={handleLocationSelection}
                />
              </div>
            </div>

            {/* Show the location confirmation for meeting creator only */}
            {isCreator && selectedLocationSuggestion && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Confirm Meeting Location
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <SelectMeetingLocation
                    meetingId={meetingId}
                    token={token}
                    location={selectedLocationSuggestion}
                    onSuccess={handleLocationConfirmed}
                  />
                </div>
              </div>
            )}

            {/* Organizer Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Organizer
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaUserCircle className="text-blue-500 text-2xl mr-3" />
                  <div>
                    <p className="font-medium">
                      {meeting.creator?.name || "Unknown"}
                    </p>
                    {meeting.creator?.email && (
                      <p className="text-gray-600 flex items-center mt-1">
                        <FaEnvelope className="mr-1 text-gray-400" size={14} />
                        {meeting.creator.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendees Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Attendees ({meeting.attendees.length})
                </h3>
                {isCreator && !isMeetingPast && (
                  <Link
                    to={`/meetings/${meeting._id}/invite`}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FaUserPlus className="mr-1" /> Invite More
                  </Link>
                )}
              </div>

              {meeting.attendees.length === 0 ? (
                <p className="text-gray-500 italic">No attendees yet.</p>
              ) : (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {meeting.attendees.map((attendee, index) => (
                      <li
                        key={attendee._id || index}
                        className="p-4 flex items-start justify-between"
                      >
                        <div className="flex items-start">
                          <FaUserCircle className="text-gray-400 text-xl mt-1 mr-3" />
                          <div>
                            <p className="font-medium">
                              {attendee.name || "Unnamed Attendee"}
                            </p>
                            <div className="text-sm text-gray-600">
                              {attendee.email && (
                                <div className="flex items-center mt-1">
                                  <FaEnvelope
                                    className="mr-1 text-gray-400"
                                    size={12}
                                  />
                                  {attendee.email}
                                </div>
                              )}
                              {attendee.phone &&(
                                <div className="flex items-center mt-1">
                                  <FaPhoneAlt
                                    className="mr-1 text-gray-400"
                                    size={12}
                                  />
                                  {attendee.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(attendee.status)}
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              attendee.status
                            )}`}
                          >
                            {attendee.status.charAt(0).toUpperCase() +
                              attendee.status.slice(1)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isCreator && (
              <div className="mt-8 flex justify-end space-x-4">
                {!isMeetingPast && (
                  <Link
                    to={`/meetings/${meeting._id}/edit`}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    <FaEdit className="mr-2" /> Edit Meeting
                  </Link>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                >
                  <FaTrash className="mr-2" /> Delete Meeting
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
              
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import LocationTracker from "../../component/LocationTracker";
// import LocationSuggestions from "../../component/LocationSuggestions";
// import AttendeeLocationsMap from "../../component/AttendeeLocationsMap";
// import SelectMeetingLocation from "../../component/SelectMeetingLocation";

// const MeetingDetail = ({ user, token }) => {
//   // Use useParams hook to get the meeting ID from the URL
//   const { meetingId } = useParams();
// const MAP_API_URL = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEYL;
//   const [meeting, setMeeting] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedLocationSuggestion, setSelectedLocationSuggestion] =
//     useState(null);
//   const [googleMapsApiKey, setGoogleMapsApiKey] = useState(MAP_API_URL);

//   // Make sure to handle the case when meeting might be null
//   const isMeetingCreator = meeting ? meeting.createdBy === user.id : false;

//   useEffect(() => {
//     if (meetingId) {
//       fetchMeetingDetails();
//     } else {
//       setError("Meeting ID is missing");
//       setLoading(false);
//     }
//   }, [meetingId]);

//   const fetchMeetingDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`/meetings/${meetingId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMeeting(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to fetch meeting details");
//       setLoading(false);
//     }
//   };

//   const handleLocationSelection = (suggestion) => {
//     setSelectedLocationSuggestion(suggestion);
//   };

//   const handleLocationConfirmed = async (finalLocation) => {
//     try {
//       // Update the meeting with the selected location
//       await axios.put(
//         `/api/meetings/${meetingId}`,
//         { location: finalLocation },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Refresh meeting details
//       fetchMeetingDetails();

//       // Reset the selected suggestion
//       setSelectedLocationSuggestion(null);
//     } catch (err) {
//       setError("Failed to update meeting with selected location");
//     }
//   };

//   if (loading) return <div className="loading">Loading meeting details...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!meeting) return <div className="not-found">Meeting not found</div>;

//   return (
//     <div className="meeting-detail-page">
//       <h1>{meeting.title}</h1>
//       <div className="meeting-info">
//         <p>
//           <strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}
//         </p>
//         <p>
//           <strong>Time:</strong> {new Date(meeting.date).toLocaleTimeString()}
//         </p>
//         {meeting.location && (
//           <div className="selected-location">
//             <h3>Meeting Location</h3>
//             <p>
//               <strong>{meeting.location.name}</strong>
//             </p>
//             <p>{meeting.location.address}</p>
//           </div>
//         )}
//       </div>

//       {/* Location tracking component */}
//       <div className="location-section">
//         <h2>Location Sharing</h2>
//         <LocationTracker meetingId={meetingId} token={token} />
//       </div>

//       {/* Map showing all attendee locations */}
//       <div className="map-section">
//         <h2>Attendee Locations</h2>
//         <AttendeeLocationsMap
//           meetingId={meetingId}
//           token={token}
//           googleMapsApiKey={googleMapsApiKey}
//         />
//       </div>

//       {/* Location suggestions */}
//       <div className="suggestions-section">
//         <LocationSuggestions
//           meetingId={meetingId}
//           token={token}
//           onSelectLocation={handleLocationSelection}
//         />
//       </div>

//       {/* Show the location confirmation for meeting creator only */}
//       {isMeetingCreator && selectedLocationSuggestion && (
//         <div className="confirm-location-section">
//           <SelectMeetingLocation
//             meetingId={meetingId}
//             token={token}
//             location={selectedLocationSuggestion}
//             onSuccess={handleLocationConfirmed}
//           />
//         </div>
//       )}

//       {/* Show attendee list */}
//       <div className="attendees-section">
//         <h2>Attendees</h2>
//         <ul className="attendee-list">
//           {meeting.attendees.map((attendee) => (
//             <li key={attendee.id} className="attendee-item">
//               <span className="attendee-name">{attendee.name}</span>
//               <span className={`status ${attendee.status}`}>
//                 {attendee.status}
//               </span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default MeetingDetail;
