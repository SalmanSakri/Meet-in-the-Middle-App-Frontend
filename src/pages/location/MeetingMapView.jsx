import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Navigation, Coffee, User, Users } from "lucide-react";
import { formatDistance } from "../../services/locationService";
import { getLocationSuggestions } from "../../redux/slices/meetingSlice";
import { useParams } from "react-router-dom";

const MeetingMapView = () => {
  const dispatch = useDispatch();
  const { meetingId } = useParams();

  const { currentMeeting, locationSuggestions, centralLocation } = useSelector(
    (state) => state.meetings
  );

  // Fallback data in case Redux state is empty
  const sampleData = {
    centralLocation: [40.7128, -74.006], // NYC coordinates
    currentUserLocation: [40.7135, -74.0046],
    suggestions: [
      {
        name: "Coffee Express",
        type: "cafe",
        distance: 320,
        coordinates: [40.714, -74.008],
      },
      {
        name: "Central Park Restaurant",
        type: "restaurant",
        distance: 450,
        coordinates: [40.712, -74.003],
      },
      {
        name: "Downtown Bistro",
        type: "restaurant",
        distance: 600,
        coordinates: [40.711, -74.007],
      },
    ],
  };

  const [locations, setLocations] = useState({
    centralLocation: centralLocation || sampleData.centralLocation,
    userLocation: sampleData.currentUserLocation,
    suggestions: locationSuggestions || sampleData.suggestions,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationType, setLocationType] = useState("restaurant");

  // Update locations from Redux state when available
  useEffect(() => {
    const updatedLocations = { ...locations };

    if (centralLocation) {
      updatedLocations.centralLocation = centralLocation;
    }

    if (locationSuggestions && locationSuggestions.length > 0) {
      updatedLocations.suggestions = locationSuggestions.map((suggestion) => ({
        name: suggestion.name,
        type: suggestion.category || locationType,
        distance: suggestion.distance,
        coordinates: suggestion.location?.coordinates || [
          suggestion.longitude || 0,
          suggestion.latitude || 0,
        ],
      }));
    }

    setLocations(updatedLocations);
  }, [centralLocation, locationSuggestions]);

  // Fetch location suggestions when place type changes
  useEffect(() => {
    if (meetingId && locationType) {
      dispatch(
        getLocationSuggestions({
          meetingId,
          type: locationType,
          radius: 1500,
        })
      );
    }
  }, [locationType, meetingId, dispatch]);

  // Select a location from the suggestions
  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  // Calculate random positions for the map mock
  const getRandomPosition = (index) => {
    // Use index to make positions somewhat deterministic
    const seed = index * 127;
    const angle = ((seed % 360) * Math.PI) / 180;
    const radius = 20 + (seed % 30);

    return {
      top: `${50 + radius * Math.sin(angle)}%`,
      left: `${50 + radius * Math.cos(angle)}%`,
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Meeting Location Map</h2>

      {/* Map View (Mock) */}
      <div className="relative bg-blue-50 h-64 rounded-lg mb-4 overflow-hidden">
        {/* Central Location Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <Users className="text-blue-600" size={24} />
            <span className="bg-white px-2 py-1 rounded text-xs shadow-sm">
              Central Point
            </span>
          </div>
        </div>

        {/* User Location */}
        <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 translate-x-4">
          <div className="flex flex-col items-center">
            <User className="text-green-600" size={24} />
            <span className="bg-white px-2 py-1 rounded text-xs shadow-sm">
              You
            </span>
          </div>
        </div>

        {/* Suggestion Markers */}
        {locations.suggestions.map((location, index) => {
          const position = getRandomPosition(index);
          return (
            <div
              key={index}
              className="absolute cursor-pointer"
              style={position}
              onClick={() => handleSelectLocation(location)}
            >
              <div className="flex flex-col items-center">
                {location.type === "cafe" ? (
                  <Coffee className="text-red-500" size={20} />
                ) : (
                  <MapPin className="text-red-500" size={20} />
                )}
                {selectedLocation === location && (
                  <span className="bg-white px-2 py-1 rounded text-xs shadow-sm">
                    {location.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">
            This is a simplified map representation.
          </p>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <h3 className="font-medium">{selectedLocation.name}</h3>
          <p className="text-sm text-gray-600">
            Distance: {formatDistance(selectedLocation.distance)}
          </p>
          <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Navigation size={16} />
            Get Directions
          </button>
        </div>
      )}

      {/* Location Type Filter */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            locationType === "restaurant"
              ? "bg-blue-500 text-white"
              : "bg-gray-100"
          }`}
          onClick={() => setLocationType("restaurant")}
        >
          Restaurants
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            locationType === "cafe" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setLocationType("cafe")}
        >
          Cafés
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm ${
            locationType === "bar" ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => setLocationType("bar")}
        >
          Bars
        </button>
      </div>

      {/* Location List */}
      <div>
        <h3 className="font-medium mb-2">Nearby Places</h3>
        <ul className="space-y-2">
          {locations.suggestions.map((location, index) => (
            <li
              key={index}
              className={`p-3 rounded-lg border cursor-pointer ${
                selectedLocation === location
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => handleSelectLocation(location)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistance(location.distance)}
                  </p>
                </div>
                <MapPin size={18} className="text-gray-400" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MeetingMapView;
