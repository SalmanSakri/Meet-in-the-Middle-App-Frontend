import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
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
import LoadingSpinner from "../../component/LoadingSpinner";
import { getMeetingById, deleteMeeting } from "../../redux/slices/meetingSlice";

const MeetingDetail = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user and meeting state from Redux
  const { user } = useSelector((state) => state.auth);
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
                              {attendee.phone && (
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
 