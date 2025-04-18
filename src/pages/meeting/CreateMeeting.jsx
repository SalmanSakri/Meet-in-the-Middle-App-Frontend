import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createMeeting,
  clearMeetingError,
  clearMeetingSuccess,
} from "../../redux/slices/meetingSlice";
import { getCurrentPosition } from "../../services/locationService";
// import AttendeeInput from "../../component/AttendeeInput";
import LoadingSpinner from "../../component/LoadingSpinner";
import { toast } from "react-toastify";
// Import a better date-time picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateMeeting = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.meetings);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    location: {
      type: "Point",
      coordinates: [0, 0],
      name: "",
      address: "",
    },
    attendees: [],
  });

  const [newAttendee, setNewAttendee] = useState({
    name: "",
    email: "",

  });
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [locationObtained, setLocationObtained] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearMeetingError());
      dispatch(clearMeetingSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }

    if (success) {
      toast.success("Meeting created successfully!");
      navigate("/dashboard");
    }
  }, [error, success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleStartTimeChange = (date) => {
    setFormData({
      ...formData,
      startTime: date,
      // Ensure end time is always after start time
      endTime:
        date > formData.endTime
          ? new Date(date.getTime() + 3600000)
          : formData.endTime,
    });
  };

  const handleEndTimeChange = (date) => {
    if (date > formData.startTime) {
      setFormData({
        ...formData,
        endTime: date,
      });
    } else {
      toast.warning("End time must be after start time");
    }
  };

  const handleAttendeeChange = (e) => {
    const { name, value } = e.target;
    setNewAttendee({
      ...newAttendee,
      [name]: value,
    });
  };

  const addAttendee = () => {
    // Basic validation
    if (!newAttendee.email) {
      toast.warning("Please provide either email for attendee");
      return;
    }

    // Add attendee to list
    setFormData({
      ...formData,
      attendees: [...formData.attendees, { ...newAttendee }],
    });

    // Reset input fields
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

  const getCurrentLocationHandler = async () => {
    try {
      setUsingCurrentLocation(true);
      const position = await getCurrentPosition();

      // Update form data with the obtained location
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          type: "Point",
          coordinates: [position.longitude, position.latitude],
        },
      });

      // Set location obtained flag to true
      setLocationObtained(true);
      toast.success("Current location obtained successfully");
    } catch (error) {
      toast.error("Error getting current location: " + error.message);
    } finally {
      setUsingCurrentLocation(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.warning("Please provide a meeting title");
      return;
    }

    // Make a copy of the data to ensure the location data is properly formatted
    const meetingData = {
      ...formData,
      location: {
        ...formData.location,
        type: "Point",
        coordinates: formData.location.coordinates,
      },
    };

    dispatch(createMeeting(meetingData));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create New Meeting
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Meeting Details
            </h2>

            <div>
              <label className="block text-gray-600 mb-1">
                Meeting Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter meeting title"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose of this meeting"
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Date & Time
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">
                  Start Time<span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.startTime}
                  onChange={handleStartTimeChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">
                  End Time<span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.endTime}
                  onChange={handleEndTimeChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={formData.startTime}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Location (Optional)
            </h2>

            <div>
              <label className="block text-gray-600 mb-1">Location Name</label>
              <input
                type="text"
                name="location.name"
                value={formData.location.name}
                onChange={handleChange}
                placeholder="Enter location name"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Enter location address"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={getCurrentLocationHandler}
                disabled={usingCurrentLocation}
                className={`w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition ${
                  usingCurrentLocation ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {usingCurrentLocation
                  ? "Getting Location..."
                  : "Use Current Location"}
              </button>

              {locationObtained && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700">
                    <span className="font-medium">
                      ✓ Location coordinates obtained:
                    </span>{" "}
                    [{formData.location.coordinates[0].toFixed(6)},{" "}
                    {formData.location.coordinates[1].toFixed(6)}]
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">Attendees</h2>

            {/* Input fields for new attendee */}
            <div className="space-y-2 bg-white p-4 rounded-lg shadow border">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newAttendee.name}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newAttendee.email}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, email: e.target.value })
                }
              />
          
              <button
                type="button"
                onClick={addAttendee}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Attendee
              </button>
            </div>

            {/* Display list of added attendees */}
            {formData.attendees.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Invited Attendees:
                </h3>
                <ul className="space-y-2">
                  {formData.attendees.map((attendee, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded shadow-sm"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {attendee.name || "No Name"}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {attendee.email}
                          {attendee.email}

                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow-sm transition"
            >
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeeting;
