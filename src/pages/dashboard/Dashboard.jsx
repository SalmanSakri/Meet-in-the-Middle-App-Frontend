import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUserMeetings } from "../../redux/slices/meetingSlice";
import MeetingCard from "../../pages/meeting/MeetingCard";
import LoadingSpinner from "../../component/LoadingSpinner";
import { toast } from "react-toastify";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector((state) => state.meetings);
  const [filter, setFilter] = useState("all");

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
      default:
        return meetings;
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Meetings</h1>
        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Meetings</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <Link
            to="/create-meeting"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl shadow-md transition duration-300"
          >
            + Create Meeting
          </Link>
        </div>
      </div>

      {filteredMeetings().length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-lg text-gray-600 mb-4">No meetings found.</p>
          <Link
            to="/create-meeting"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl shadow-md transition duration-300"
          >
            Create Your First Meeting
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings().map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
