// src/pages/meeting/EditMeeting.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getMeetingById, updateMeeting, clearMeetingError } from "../../redux/slices/meetingSlice";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaInfoCircle,
} from "react-icons/fa";

const EditMeeting = () => {
  const {meetingId} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentMeeting, loading: isLoading, error } = useSelector(
    (state) => state.meetings
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: {
      name: "",
      address: "",
      type: "Point",
      coordinates: [0, 0],
    },
  });

  // Load meeting data when component mounts
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!meetingId) {
        toast.error("Invalid meeting ID provided");
        navigate("/dashboard");
        return;
      }
      
      try {
        // Pass meetingId directly without wrapping in an object
        const result = await dispatch(getMeetingById({ meetingId })).unwrap();
        if (!result) {
          toast.error("Meeting not found");
          navigate("/dashboard");
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch meeting details");
        navigate("/dashboard");
      }
    };
    
    fetchMeeting();
    return () => {
      dispatch(clearMeetingError());
    };
  }, [dispatch, meetingId, navigate]);

  // Set form data when meeting data is loaded
  useEffect(() => {
    if (currentMeeting) {
      setFormData({
        title: currentMeeting.title || "",
        description: currentMeeting.description || "",
        startTime: new Date(currentMeeting.startTime)
          .toISOString()
          .slice(0, 16),
        endTime: new Date(currentMeeting.endTime).toISOString().slice(0, 16),
        location: {
          name: currentMeeting.location?.name || "",
          address: currentMeeting.location?.address || "",
          type: "Point",
          coordinates: currentMeeting.location?.coordinates || [0, 0],
        },
      });
    }
  }, [currentMeeting]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "locationName") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          name: value,
        },
      });
    } else if (name === "locationAddress") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          address: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingId) {
      toast.error("Meeting ID is missing");
      return;
    }
    try {
      await dispatch(updateMeeting({
        meetingId:meetingId,
        meetingData: {
          ...formData,
          // Ensure dates are in ISO format
          startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
          endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        }
      })).unwrap();

      toast.success("Meeting updated successfully");
      navigate(`/meetings/${meetingId}`);
    } catch (error) {
      toast.error(error.message || "Failed to update meeting");
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading meeting details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Edit Meeting
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Meeting Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <label className="block text-gray-700 mb-2" htmlFor="startTime">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-[#B71B36]" />
                Start Time
              </div>
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full md:w-1/2 px-2">
            <label className="block text-gray-700 mb-2" htmlFor="endTime">
              <div className="flex items-center">
                <FaClock className="mr-2 text-[#B71B36]" />
                End Time
              </div>
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="locationName">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-[#B71B36]" />
              Location Name
            </div>
          </label>
          <input
            id="locationName"
            name="locationName"
            type="text"
            value={formData.location.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="locationAddress">
            <div className="flex items-center">
              <FaInfoCircle className="mr-2 text-[#B71B36]" />
              Location Address
            </div>
          </label>
          <input
            id="locationAddress"
            name="locationAddress"
            type="text"
            value={formData.location.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/meetings/${meetingId}`)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#B71B36] text-white rounded-md hover:bg-red-800 transition-colors"
          >
            Update Meeting
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMeeting;