// src/pages/dashboard/Dashboard.jsx

import React, { useState, useEffect } from "react";
import {
  getUserMeetings,
  deleteMeeting,
} from "../../redux/slices/meetingSlice";
import { getCurrentPosition } from "../../services/locationService";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";

const DashboardOld = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true);
        const data = await getUserMeetings();
        setMeetings(data.meetings || []);
        setError(null);
      } catch (err) {
        setError("Failed to load meetings. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleDeleteMeeting = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting(id);
        setMeetings(meetings.filter((meeting) => meeting._id !== id));
      } catch (err) {
        setError("Failed to delete meeting. Please try again.");
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Meetings</h1>
        <button
          onClick={() => navigate("/meetings/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          New Meeting
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Calendar size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No meetings scheduled
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first meeting to get started
          </p>
          <button
            onClick={() => navigate("/MeetingForm")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Create Meeting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    {meeting.title}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/meetings/edit/${meeting._id}`)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting._id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{meeting.description}</p>

                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(meeting.date)}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <Clock size={16} className="mr-2" />
                  <span>Duration: {meeting.duration} minutes</span>
                </div>

                {meeting.location && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span>{meeting.location.name || "Location TBD"}</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600 mb-4">
                  <Users size={16} className="mr-2" />
                  <span>{meeting.attendees?.length || 0} attendees</span>
                </div>

                <Link
                  to={`/meetings/${meeting._id}`}
                  className="mt-4 inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg w-full text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOld;
