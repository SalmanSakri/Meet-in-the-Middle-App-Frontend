import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createMeeting,
  // getMeetingById,
  updateMeeting,
} 
from "../../redux/slices/meetingSlice";
import { Calendar, Clock, MapPin, Users, X } from "lucide-react";

const MeetingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    location: { name: "" },
    attendees: [],
  });

  const [newAttendee, setNewAttendee] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (isEditing) {
        try {
          setIsLoading(true);
          const data = await getMeetingById(id);
          const meeting = data.meeting;

          // Format date and time for inputs
          const meetingDate = new Date(meeting.date);
          const formattedDate = meetingDate.toISOString().split("T")[0];
          const formattedTime = meetingDate.toTimeString().slice(0, 5);

          setFormData({
            title: meeting.title || "",
            description: meeting.description || "",
            date: formattedDate,
            time: formattedTime,
            duration: meeting.duration || 60,
            location: meeting.location || { name: "" },
            attendees: meeting.attendees || [],
          });

          setIsLoading(false);
        } catch (err) {
          setError("Failed to load meeting details.");
          setIsLoading(false);
          console.error(err);
        }
      }
    };

    fetchMeeting();
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLocationChange = (e) => {
    setFormData({
      ...formData,
      location: { name: e.target.value },
    });
  };

  const handleAttendeeChange = (e) => {
    const { name, value } = e.target;
    setNewAttendee({
      ...newAttendee,
      [name]: value,
    });
  };

  const addAttendee = () => {
    if (newAttendee.name.trim() === "" || newAttendee.email.trim() === "") {
      return;
    }

    // Check if email already exists
    if (formData.attendees.some((a) => a.email === newAttendee.email)) {
      setError("This email is already added to attendees list.");
      return;
    }

    setFormData({
      ...formData,
      attendees: [...formData.attendees, { ...newAttendee }],
    });

    setNewAttendee({ name: "", email: "" });
  };

  const removeAttendee = (index) => {
    const updatedAttendees = [...formData.attendees];
    updatedAttendees.splice(index, 1);
    setFormData({
      ...formData,
      attendees: updatedAttendees,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      // Combine date and time into a single datetime string
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`);

      const meetingData = {
        title: formData.title,
        description: formData.description,
        date: combinedDateTime.toISOString(),
        duration: parseInt(formData.duration),
        location: formData.location,
        attendees: formData.attendees,
      };

      if (isEditing) {
        await updateMeeting(id, meetingData);
      } else {
        await createMeeting(meetingData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/meetings");
      }, 1500);
    } catch (err) {
      setError(
        `Failed to ${
          isEditing ? "update" : "create"
        } meeting. Please try again.`
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {isEditing ? "Edit Meeting" : "Create New Meeting"}
        </h1>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
            role="alert"
          >
            <p>
              Meeting successfully {isEditing ? "updated" : "created"}!
              Redirecting...
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Meeting Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting title"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="date"
                className="block text-gray-700 font-medium mb-2"
              >
                Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="text-gray-500" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-gray-700 font-medium mb-2"
              >
                Time *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock size={18} className="text-gray-500" />
                </div>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="duration"
              className="block text-gray-700 font-medium mb-2"
            >
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="15"
              step="15"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="location"
              className="block text-gray-700 font-medium mb-2"
            >
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MapPin size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location.name}
                onChange={handleLocationChange}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter meeting location"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium">
                Attendees
              </label>
              <div className="text-sm text-gray-500 flex items-center">
                <Users size={16} className="mr-1" />
                <span>{formData.attendees.length} attendees</span>
              </div>
            </div>

            <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="md:col-span-1">
                  <input
                    type="text"
                    name="name"
                    value={newAttendee.name}
                    onChange={handleAttendeeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                  />
                </div>
                <div className="md:col-span-1">
                  <input
                    type="email"
                    name="email"
                    value={newAttendee.email}
                    onChange={handleAttendeeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Add Attendee
                  </button>
                </div>
              </div>

              {formData.attendees.length > 0 ? (
                <div className="max-h-40 overflow-y-auto">
                  <table className="min-w-full">
                    <tbody>
                      {formData.attendees.map((attendee, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          <td className="py-2 px-3">{attendee.name}</td>
                          <td className="py-2 px-3">{attendee.email}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeAttendee(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No attendees added yet
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/meetings")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Meeting"
                : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;
