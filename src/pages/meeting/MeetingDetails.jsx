import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUserCircle,
  FaCheck, FaTimes, FaQuestion, FaEdit, FaTrash,
  FaArrowLeft, FaUserPlus
} from "react-icons/fa";
import RealTimeLocation from "../RealTimeLocation";
import LoadingSpinner from "../../component/LoadingSpinner";
import {
  getMeetingById,
  deleteMeeting,
  updateLocation,
} from "../../redux/slices/meetingSlice";
import { backendToLeaflet, leafletToBackend, ensureValidCoordinates } from "../../utils/Coordinate";

const MeetingDetail = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);

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
      dispatch(getMeetingById({ meetingId, token }))
        .unwrap()
        .then((result) => {
          // Verify location data is properly loaded
          if (result.meeting && result.meeting.location) {
            setLocationLoaded(true);
          }
        })
        .catch((err) => {
          // Check for authentication errors specifically
          if (
            err?.includes("unauthorized") ||
            err?.includes("not authorized") ||
            err?.includes("Not authorized")
          ) {
            toast.error("You don't have permission to view this meeting");
            navigate("/dashboard");
          } else {
            toast.error(err || "Failed to load meeting details");
          }
        });
    }
  }, [meetingId, dispatch, navigate, token]);

  // Check if user is the creator of this meeting
  const isCreator = useMemo(() => {
    return meeting?.createdBy === user?.id;
  }, [meeting, user]);

  // Calculate if meeting is past
  const isMeetingPast = useMemo(() => {
    return meeting?.endTime ? new Date(meeting.endTime) < new Date() : false;
  }, [meeting]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Format time for display
  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Handle delete meeting action
  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const resultAction = await dispatch(deleteMeeting({ meetingId, token }));
      setIsSubmitting(false);

      if (deleteMeeting.fulfilled.match(resultAction)) {
        toast.success("Meeting deleted successfully");
        navigate("/dashboard");
      } else if (deleteMeeting.rejected.match(resultAction)) {
        toast.error(
          resultAction.payload?.message || "Failed to delete meeting"
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Failed to delete meeting");
    }
  }, [meetingId, dispatch, navigate, token]);

  // Get meeting location in Leaflet format for the map
  const getMeetingLocationForMap = useCallback(() => {
    if (!meeting || !meeting.location || !meeting.location.coordinates) {
      return null;
    }
    
    const coords = meeting.location.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2) {
      return null;
    }
    
    // Convert from backend format [lng, lat] to Leaflet format [lat, lng]
    return backendToLeaflet(coords);
  }, [meeting]);

  // Handle location confirmation
  const handleLocationSelected = useCallback(async (location) => {
    if (!location || !location.coordinates) {
      toast.error("Invalid location selected");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert from Leaflet [lat, lng] to backend [lng, lat] format
      const backendCoordinates = leafletToBackend(location.coordinates);
      
      if (!backendCoordinates) {
        throw new Error("Invalid coordinates format");
      }
      
      const updatedLocation = {
        name: location.name || 'Selected Location',
        address: location.address || '',
        coordinates: backendCoordinates // Already in [lng, lat] format for backend
      };

      await dispatch(
        updateLocation({
          meetingId,
          location: updatedLocation,
          token
        })
      ).unwrap();

      toast.success("Meeting location updated successfully");
      setShowLocationSelector(false);

      // Refresh meeting data
      dispatch(getMeetingById({ meetingId, token }));
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      toast.error("Failed to update meeting location");
      console.error("Location update error:", err);
    }
  }, [dispatch, meetingId, token]);

  // Handle invite submission
  const handleInviteSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsSubmitting(true);

      // This should be converted to use a Redux action
      const apiBaseUrl = import.meta.env.VITE_API_MEETING_URL || 
        window.VITE_API_MEETING_URL || 
        'http://localhost:7777/api';

      const response = await fetch(`${apiBaseUrl}/meetings/${meetingId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      setIsSubmitting(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteForm(false);

      // Refresh meeting data to show the new attendee
      dispatch(getMeetingById({ meetingId, token }));
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.message || "Failed to send invitation");
    }
  }, [inviteEmail, meetingId, token, dispatch]);

  // Get attendee status text and color
  const getAttendeeStatusInfo = useCallback((status) => {
    switch (status) {
      case 'accepted':
        return { icon: <FaCheck className="text-green-500" />, text: 'Attending', color: 'text-green-600' };
      case 'declined':
        return { icon: <FaTimes className="text-red-500" />, text: 'Not Attending', color: 'text-red-600' };
      case 'pending':
      default:
        return { icon: <FaQuestion className="text-yellow-500" />, text: 'Pending', color: 'text-yellow-600' };
    }
  }, []);

  // Debug log meeting location if it exists
  useEffect(() => {
    if (meeting && meeting.location && meeting.location.coordinates) {
      console.log("Meeting location from API:", meeting.location);
      console.log("Converted for Leaflet:", getMeetingLocationForMap());
    }
  }, [meeting, getMeetingLocationForMap]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-xl w-full">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Meeting Not Found</h1>
          <p className="text-gray-600 mb-6">
            The meeting you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get meeting location for map display - safely convert to Leaflet format
  const mapInitialLocation = getMeetingLocationForMap();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Meeting Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-white mb-2">{meeting.title}</h1>
              {isMeetingPast ? (
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                  Past Meeting
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Upcoming
                </span>
              )}
            </div>
            <p className="text-blue-100 text-lg">
              {meeting.description || "No description provided."}
            </p>
          </div>

          {/* Meeting Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Time & Location */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Meeting Details
                </h2>

                <div className="space-y-4">
                  {/* Date & Time */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-blue-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Date & Time
                      </h3>
                    </div>
                    <div className="pl-8">
                      <p className="text-gray-700">
                        <span className="font-medium">{formatDate(meeting.startTime)}</span>
                      </p>
                      <p className="text-gray-600">
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaMapMarkerAlt className="text-blue-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Location
                      </h3>
                    </div>
                    <div className="pl-8">
                      {meeting.location &&
                        (meeting.location.name ||
                          meeting.location.address ||
                          (meeting.location.coordinates &&
                            meeting.location.coordinates.length === 2)) && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex">
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
                                  meeting.location.coordinates.length === 2 && (
                                    <p className="text-gray-500 text-sm mt-1">
                                      Coordinates: [
                                      {meeting.location.coordinates[0].toFixed(6)},{" "}
                                      {meeting.location.coordinates[1].toFixed(6)}]
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      {isCreator && !isMeetingPast && (
                        <button
                          onClick={() => setShowLocationSelector(!showLocationSelector)}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                          disabled={isSubmitting}
                        >
                          {showLocationSelector ? "Hide Map" : "Update Location"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Location Map */}
                  {showLocationSelector && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4 w-full h-fit flex">
                      <h3 className="text-lg font-semibold mb-2">Select a Location</h3>
                      <div>
                        <RealTimeLocation
                          meetingId={meetingId}
                          isCreator={isCreator}
                          onLocationSelected={handleLocationSelected}
                          selectionMode={true}
                          initialLocation={mapInitialLocation}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Attendees */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Attendees
                  </h2>
                  {isCreator && !isMeetingPast && (
                    <button
                      onClick={() => setShowInviteForm(!showInviteForm)}
                      className="flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      <FaUserPlus className="mr-1" /> Invite
                    </button>
                  )}
                </div>
                {/* Invite Form */}
                {showInviteForm && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      Invite Attendee
                    </h3>
                    <form onSubmit={handleInviteSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="person@example.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowInviteForm(false)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Send Invitation"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Attendees List */}
                {!meeting.attendees || meeting.attendees.length === 0 ? (
                  <p className="text-gray-500 italic">No attendees yet.</p>
                ) : (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {meeting.attendees.map((attendee, index) => {
                        const statusInfo = getAttendeeStatusInfo(attendee.status);
                        return (
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
                                      {attendee.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`flex items-center ${statusInfo.color}`}>
                                {statusInfo.icon}
                                <span className="ml-1 text-sm">
                                  {statusInfo.text}
                                </span>
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Real-Time Location Section */}
            
              </div>
              
            </div>
            <div className="mt-6 w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Real-Time Attendee Locations
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height:"100%"}}>
                    <RealTimeLocation
                      meetingId={meetingId}
                      isCreator={isCreator}
                      createMode={false}
                    />
                  </div>
                </div>
          </div>

          {/* Footer with action buttons */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                {isCreator && (
                  <p className="text-sm text-gray-600">
                    You created this meeting
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                {isCreator && !isMeetingPast && (
                  <>
                    <button
                      onClick={() => navigate(`/meetings/${meetingId}/edit`)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                      disabled={isSubmitting}
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                      disabled={isSubmitting}
                    >
                      <FaTrash className="mr-2" /> {isSubmitting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;