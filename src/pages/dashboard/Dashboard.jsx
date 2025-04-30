import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserMeetings } from "../../redux/slices/meetingSlice";
import MeetingCard from "../../pages/meeting/MeetingCard";
import LoadingSpinner from "../../component/LoadingSpinner";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaListAlt,
  FaChartBar,
} from "react-icons/fa";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector((state) => state.meetings);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
    dispatch(getUserMeetings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredMeetings = () => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return meetings.filter((meeting) => new Date(meeting.startTime) > now);
      case "past":
        return meetings.filter((meeting) => new Date(meeting.endTime) < now);
      case "organizing":
        return meetings.filter((meeting) => meeting.isCreator);
      default:
        return meetings;
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const toggleView = (selectedView) => {
    setView(selectedView);
  };

  const getMeetingStats = () => {
    const now = new Date();
    const upcomingCount = meetings.filter(
      (meeting) => new Date(meeting.startTime) > now
    ).length;
    const pastCount = meetings.filter(
      (meeting) => new Date(meeting.endTime) < now
    ).length;
    const organizingCount = meetings.filter(
      (meeting) => meeting.isCreator
    ).length;

    return { upcomingCount, pastCount, organizingCount };
  };

  const stats = getMeetingStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0 text-gray-800">
            My Meetings
          </h1>

          <div className="flex gap-4 items-center">
            <select
              value={filter}
              onChange={handleFilterChange}
              className="rounded-xl border border-gray-300 p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="all">All Meetings</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="organizing">I'm Organizing</option>
            </select>

            <Link
              to="/create-meeting"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl shadow-md transition duration-300 flex items-center"
            >
              <span className="mr-1">+</span> Create Meeting
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Upcoming Meetings</p>
              <p className="text-2xl font-bold">{stats.upcomingCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaChartBar className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Organizing</p>
              <p className="text-2xl font-bold">{stats.organizingCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-gray-100 p-3 rounded-full mr-4">
              <FaListAlt className="text-gray-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Past Meetings</p>
              <p className="text-2xl font-bold">{stats.pastCount}</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 w-fit">
          <button
            onClick={() => toggleView("grid")}
            className={`px-4 py-2 rounded-md ${
              view === "grid"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Grid View
          </button>
        </div>

        {/* Meeting List */}
        {filteredMeetings().length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-12 mt-6">
            <img
              src="/api/placeholder/200/150"
              alt="No meetings"
              className="mb-6"
            />
            <p className="text-lg text-gray-600 mb-4">No meetings found.</p>
            <p className="text-gray-500 mb-6">
              Get started by creating your first meeting!
            </p>
            <Link
              to="/create-meeting"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl shadow-md transition duration-300"
            >
              Create Your First Meeting
            </Link>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredMeetings().map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Meeting Locations</h2>
            <p className="text-gray-500 mb-4">
              View all your meeting locations at a glance
            </p>
            <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Map view would display meeting locations here
              </p>
            </div>
            <div className="mt-6">
              <h3 className="font-medium mb-2">Upcoming Meetings</h3>
              <div className="space-y-3">
                {filteredMeetings()
                  .filter((m) => new Date(m.startTime) > new Date())
                  .slice(0, 5)
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 border border-gray-200 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(meeting.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/meetings/${meeting.id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;