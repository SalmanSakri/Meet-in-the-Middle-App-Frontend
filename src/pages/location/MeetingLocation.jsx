import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import {
  updateLocation,
  getLocationSuggestions,
  respondToInvitation,
  getMeetingById,
} from "../../redux/slices/meetingSlice";
import {
  getCurrentPosition,
  formatDistance,
} from "../../services/locationService";

const MeetingLocation = () => {
  const dispatch = useDispatch();
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const responseType = searchParams.get("response");

  const {
    currentMeeting,
    locationSuggestions,
    centralLocation,
    loading,
    error,
    success,
  } = useSelector((state) => state.meetings);

  const [locationError, setLocationError] = useState(null);
  const [placeType, setPlaceType] = useState("restaurant");
  const [searchRadius, setSearchRadius] = useState(1500);
  const [responseStatus, setResponseStatus] = useState({
    loading: false,
    success: null,
    error: null,
  });

  // Handle invitation response if token and response are in URL
  useEffect(() => {
    if (token && responseType && ["accept", "decline"].includes(responseType)) {
      handleInvitationResponse(responseType);
    }
  }, [token, responseType]);

  // Load meeting data
  useEffect(() => {
    if (meetingId) {
      dispatch(getMeetingById(meetingId));
    }
  }, [meetingId, dispatch]);

  // Handle invitation response
  const handleInvitationResponse = async (response) => {
    setResponseStatus({ loading: true, success: null, error: null });
    try {
      const result = await dispatch(
        respondToInvitation({
          meetingId,
          token,
          response,
        })
      ).unwrap();

      setResponseStatus({
        loading: false,
        success: result.message || `Successfully ${response}ed the invitation`,
        error: null,
      });
    } catch (error) {
      setResponseStatus({
        loading: false,
        success: null,
        error: error.message || "Failed to respond to invitation",
      });
    }
  };

  // Get current location and update for meeting
  const handleUpdateLocation = async () => {
    try {
      setLocationError(null);
      const position = await getCurrentPosition();

      await dispatch(
        updateLocation({
          meetingId,
          longitude: position.longitude,
          latitude: position.latitude,
        })
      ).unwrap();
    } catch (error) {
      setLocationError(error.message || "Failed to update location");
    }
  };

  // Get location suggestions based on selected criteria
  const handleGetSuggestions = () => {
    dispatch(
      getLocationSuggestions({
        meetingId,
        type: placeType,
        radius: searchRadius,
      })
    );
  };

  // Display an invitation response confirmation
  if (
    responseStatus.loading ||
    responseStatus.success ||
    responseStatus.error
  ) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
        {responseStatus.loading && (
          <p className="text-gray-500">Processing your response...</p>
        )}

        {responseStatus.success && (
          <div className="text-center">
            <div className="text-green-500 text-xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Thank you!</h2>
            <p className="mb-4">{responseStatus.success}</p>
            {currentMeeting && (
              <div className="bg-gray-100 p-4 rounded mb-4">
                <h3 className="font-semibold">{currentMeeting.title}</h3>
                <p>
                  Date:{" "}
                  {new Date(currentMeeting.startTime).toLocaleDateString()}
                </p>
                <p>
                  Time:{" "}
                  {new Date(currentMeeting.startTime).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        )}

        {responseStatus.error && (
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">✗</div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-red-500">{responseStatus.error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Meeting Location</h2>

      {/* Meeting Details */}
      {currentMeeting && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg">{currentMeeting.title}</h3>
          <p className="text-gray-600">{currentMeeting.description}</p>
          <p className="text-sm text-gray-500">
            {new Date(currentMeeting.startTime).toLocaleString()}
          </p>
        </div>
      )}

      {/* Location Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <button
            onClick={handleUpdateLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update My Location"}
          </button>

          {locationError && (
            <p className="text-red-500 text-sm mt-2">{locationError}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-medium">
            Place Type:
            <select
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
              className="ml-2 border rounded p-1"
            >
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="bar">Bar</option>
              <option value="park">Park</option>
            </select>
          </label>

          <label className="font-medium">
            Search Radius:
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="ml-2 border rounded p-1"
            >
              <option value="500">500m</option>
              <option value="1000">1km</option>
              <option value="1500">1.5km</option>
              <option value="2000">2km</option>
              <option value="3000">3km</option>
            </select>
          </label>

          <button
            onClick={handleGetSuggestions}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-2"
            disabled={loading}
          >
            Get Location Suggestions
          </button>
        </div>
      </div>

      {/* Central Location */}
      {centralLocation && (
        <div className="mb-4">
          <h3 className="font-semibold">Central Location</h3>
          <p className="text-sm">
            Latitude: {centralLocation[0].toFixed(6)}, Longitude:{" "}
            {centralLocation[1].toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${centralLocation[0]},${centralLocation[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            View on Google Maps
          </a>
        </div>
      )}

      {/* Location Suggestions */}
      {locationSuggestions && locationSuggestions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Suggested Locations</h3>
          <ul className="divide-y">
            {locationSuggestions.map((place, index) => (
              <li key={index} className="py-3">
                <div className="font-medium">{place.name}</div>
                <div className="text-sm text-gray-600">{place.address}</div>
                <div className="text-sm text-gray-500">
                  Distance: {formatDistance(place.distance)}
                </div>
                {place.location && place.location.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${place.location.coordinates[1]},${place.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                  >
                    View on Google Maps
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded mt-4">{error}</div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 text-green-500 rounded mt-4">
          {success}
        </div>
      )}
    </div>
  );
};

export default MeetingLocation;
