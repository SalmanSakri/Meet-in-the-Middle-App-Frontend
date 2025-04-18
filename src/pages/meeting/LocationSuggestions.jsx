import React, { useState, useEffect } from "react";
import {
  updateLocation,
  getLocationSuggestions,
} from "../../services/meetingService";
import { getCurrentPosition } from "../../services/locationService";
import { toast } from "react-toastify";

const LocationSuggestions = ({ meetingId }) => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [centralLocation, setCentralLocation] = useState(null);
  const [placeType, setPlaceType] = useState("restaurant");
  const [radius, setRadius] = useState(1500);

  // Fetch initial suggestions on component mount
  useEffect(() => {
    if (meetingId) {
      fetchSuggestions();
    }
  }, [meetingId]);

  const fetchSuggestions = async () => {
    if (!meetingId) return;

    setLoading(true);
    setError("");

    try {
      const response = await getLocationSuggestions(
        meetingId,
        placeType,
        radius
      );
      if (response.success) {
        setSuggestions(response.suggestions || []);
        setCentralLocation(response.centralLocation);
      } else {
        setError(response.message || "Failed to get location suggestions");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMyLocation = async () => {
    setLocationLoading(true);
    setError("");

    try {
      // Get current position using browser geolocation
      const position = await getCurrentPosition();

      if (!position || !position.longitude || !position.latitude) {
        throw new Error("Could not retrieve valid location coordinates");
      }

      // Update location on the server
      const response = await updateLocation(
        meetingId,
        position.longitude,
        position.latitude
      );

      if (response.success) {
        setSuggestions(response.suggestions || []);
        setCentralLocation(response.centralLocation);
        toast.success("Your location was updated successfully!");
      } else {
        setError(response.message || "Failed to update your location");
      }
    } catch (err) {
      setError(err.message || "Could not get your location");
      toast.error(
        "Location update failed: " + (err.message || "Unknown error")
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setPlaceType(e.target.value);
  };

  const handleRadiusChange = (e) => {
    setRadius(Number(e.target.value));
  };

  const handleApplyFilters = () => {
    fetchSuggestions();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Meeting Location</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleUpdateMyLocation}
          disabled={locationLoading}
          className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ${
            locationLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {locationLoading ? "Updating..." : "Update My Location"}
        </button>
        <p className="text-sm text-gray-600 mt-1">
          Share your location to find the best meeting spot for everyone
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Filter Suggestions</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place Type
            </label>
            <select
              value={placeType}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="bar">Bar</option>
              <option value="park">Park</option>
              <option value="library">Library</option>
              <option value="movie_theater">Movie Theater</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius (m)
            </label>
            <select
              value={radius}
              onChange={handleRadiusChange}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={500}>500m</option>
              <option value={1000}>1km</option>
              <option value={1500}>1.5km</option>
              <option value={2000}>2km</option>
              <option value={3000}>3km</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Suggested Locations</h3>
        {loading ? (
          <p className="text-gray-600">Loading suggestions...</p>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((place, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
              >
                <h4 className="font-medium">{place.name}</h4>
                <p className="text-gray-600">{place.address}</p>
                <div className="flex items-center mt-2">
                  <span className="text-amber-500 mr-1">
                    {place.rating ? `★ ${place.rating}` : "No rating"}
                  </span>
                  {place.distance && (
                    <span className="text-gray-500 text-sm ml-2">
                      {place.distance < 1000
                        ? `${Math.round(place.distance)}m away`
                        : `${(place.distance / 1000).toFixed(1)}km away`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No suggestions available. Try updating your location or changing
            filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationSuggestions;
