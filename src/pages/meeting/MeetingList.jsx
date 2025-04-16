// src/components/meetings/MeetingList.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeetings } from "../../redux/slices/meetingSlice";
import { Link } from "react-router-dom";

const MeetingList = () => {
  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector((state) => state.meetings);

  useEffect(() => {
    dispatch(fetchMeetings());
  }, [dispatch]);

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="text-center mt-8">Loading meetings...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Meetings</h1>
        <Link
          to="/meetings/create"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Create New Meeting
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p>You don't have any meetings yet.</p>
          <Link
            to="/meetings/create"
            className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
          >
            Create your first meeting
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="block p-4 border rounded bg-white hover:shadow-md transition duration-200"
            >
              <h2 className="text-xl font-semibold mb-1">{meeting.title}</h2>
              <p className="text-gray-600 mb-2">
                {formatDateTime(meeting.dateTime)}
              </p>
              <p className="text-gray-700 truncate">
                {meeting.description || "No description provided."}
              </p>
              <div className="mt-2 text-sm">
                <span className="text-gray-500">
                  {meeting.participants
                    ? `${meeting.participants.length} participants`
                    : "0 participants"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingList;
