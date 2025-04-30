// src/pages/meeting/MeetingCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaInfoCircle,
} from "react-icons/fa";
import { deleteMeeting } from "../../redux/slices/meetingSlice";

const MeetingCard = ({ meeting }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMeetingPast = new Date(meeting.endTime) < new Date();
  const statusClass = isMeetingPast ? "bg-gray-200" : "bg-white";

  const acceptedAttendees = meeting.attendees.filter(
    (attendee) => attendee.status === "accepted"
  ).length;
  const pendingAttendees = meeting.attendees.filter(
    (attendee) => attendee.status === "pending"
  ).length;
  const declinedAttendees = meeting.attendees.filter(
    (attendee) => attendee.status === "declined"
  ).length;

  const handleEdit = () => {
    navigate(`/meetings/${meeting.id}/edit`);
  };

    const handleDetail = () => {
      navigate(`/meetings/${meeting.id}`);
    };
  // Fixed the handleDelete to use the meeting.id from props
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) {
      return;
    }

    try {
      // Use meeting.id from props instead of meetingId from useParams
      const resultAction = await dispatch(deleteMeeting(meeting.id));
      if (deleteMeeting.fulfilled.match(resultAction)) {
        toast.success("Meeting deleted successfully");
        // If there's an onDelete callback prop, call it
        if (typeof onDelete === "function") {
          onDelete();
        } else {
          navigate("/dashboard");
        }
      } else if (deleteMeeting.rejected.match(resultAction)) {
        toast.error(
          resultAction.payload?.message || "Failed to delete meeting"
        );
      }
    } catch (err) {
      toast.error("Failed to delete meeting");
    }
  };

  return (
    <div
      className={`block ${statusClass} rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 truncate">
            {meeting.title}
          </h3>
          {isMeetingPast ? (
            <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">
              Past
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
              Upcoming
            </span>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-600 line-clamp-2">
            {meeting.description || "No description provided."}
          </p>
        </div>

        <div className="flex items-center text-gray-700 mb-2">
          <FaCalendarAlt className="mr-2 text-[#B71B36]" />
          <span>{formatDate(meeting.startTime)}</span>
        </div>
        <div className="flex items-center text-gray-700 mb-2">
          <FaClock className="mr-2 text-[#B71B36]" />
          <span>
            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
          </span>
        </div>
        {meeting.location && meeting.location.name && (
          <div className="flex items-center text-gray-700 mb-4">
            <FaMapMarkerAlt className="mr-2 text-[#B71B36]" />
            <span>{meeting.location.name}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="flex items-center text-sm mr-3">
                <FaCheck className="mr-1 text-green-500" /> {acceptedAttendees}
              </span>
              <span className="flex items-center text-sm mr-3">
                <FaUserPlus className="mr-1 text-yellow-500" />{" "}
                {pendingAttendees}
              </span>
              <span className="flex items-center text-sm">
                <FaTimes className="mr-1 text-red-500" /> {declinedAttendees}
              </span>
            </div>
            {meeting.isCreator && (
              <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                Organizer
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
            <button
             
              onClick={handleDetail}
              className="flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
            >
              <FaInfoCircle className="mr-1" /> Details
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;