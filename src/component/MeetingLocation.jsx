import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MapPin, Navigation, Coffee, User, Users } from "lucide-react";
import axios from "axios";

// Helper functions
const formatDistance = (distance) => {
  if (!distance && distance !== 0) return "Unknown distance";
  return distance < 1000
    ? `${Math.round(distance)}m away`
    : `${(distance / 1000).toFixed(1)}km away`;
};

const findMidpoint = (locations) => {
  if (!locations || locations.length === 0) return null;
  
  let sumLat = 0, sumLng = 0;
  locations.forEach(loc => {
    sumLat += loc.latitude;
    sumLng += loc.longitude;
  });
  
  return {
    latitude: sumLat / locations.length,
    longitude: sumLng / locations.length
  };
};

const MeetingLocation = ({ meetingId, token }) => {
  // State variables
  const [attendeeLocations, setAttendeeLocations] = useState([]);
  const [centralLocation, setCentralLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placeType, setPlaceType] = useState("restaurant");
  const [searchRadius, setSearchRadius] = useState(1500);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [watchId, setWatchId] = useState(null);

  // Load Google Maps API script dynamically
  useEffect(() => {
    const googleMapsApiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      setError("Google Maps API key is not available");
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      return;
    }

    // Create script element to load Google Maps
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setError("Failed to load Google Maps");
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts before load
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize location tracking on component mount
  useEffect(() => {
    if (!meetingId || !token) return;
    
    // Fetch initial data
    fetchAttendeeLocations();
    fetchLocationSuggestions();
    
    // Set up periodic updates
    const locationInterval = setInterval(fetchAttendeeLocations, 30000);
    
    // Set up location tracking
    startLocationTracking();
    
    return () => {
      clearInterval(locationInterval);
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [meetingId, token]);

  // Start tracking user location
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    setWatchId(id);
  };

  // Handle location updates from geolocation API
  const handleLocationUpdate = async (position) => {
    try {
      setLocationStatus("updating");
      const { latitude, longitude, accuracy } = position.coords;

      const response = await axios.post(
        `/api/meetings/${meetingId}/location`,
        { latitude, longitude, accuracy },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLocationStatus("updated");
      // Refresh data after updating location
      fetchAttendeeLocations();
      fetchLocationSuggestions();
    } catch (err) {
      setError(err.message || "Failed to update location");
      setLocationStatus("failed");
    }
  };

  // Handle geolocation errors
  const handleLocationError = (err) => {
    setError(`Geolocation error: ${err.message}`);
    setLocationStatus("failed");
  };

  // Fetch all attendee locations
  const fetchAttendeeLocations = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `/api/meetings/${meetingId}/attendee-locations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.attendeeLocations && response.data.attendeeLocations.length > 0) {
        setAttendeeLocations(response.data.attendeeLocations);
        
        // If no central location is provided, calculate it
        if (!response.data.centralLocation) {
          const locations = response.data.attendeeLocations.map(att => ({
            latitude: att.coordinates[1], 
            longitude: att.coordinates[0]
          }));
          
          const midpoint = findMidpoint(locations);
          if (midpoint) {
            setCentralLocation([midpoint.longitude, midpoint.latitude]);
          }
        } else {
          setCentralLocation(response.data.centralLocation);
        }
        
        // Set selected location if available
        if (response.data.selectedLocation) {
          setSelectedLocation(response.data.selectedLocation);
        }
      }
    } catch (err) {
      setError(`Failed to fetch attendee locations: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch location suggestions
  const fetchLocationSuggestions = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `/api/meetings/${meetingId}/location-suggestions`,
        { 
          params: { type: placeType, radius: searchRadius },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      if (response.data.suggestions) {
        setLocationSuggestions(response.data.suggestions);
        
        // Update central location if provided
        if (response.data.centralLocation) {
          setCentralLocation(response.data.centralLocation);
        }
      }
    } catch (err) {
      setError(`Failed to fetch location suggestions: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manually updating user location
  const handleUpdateMyLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      const response = await axios.post(
        `/api/meetings/${meetingId}/location`,
        { latitude, longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Your location was updated successfully!");
      
      // Refresh data
      fetchAttendeeLocations();
      fetchLocationSuggestions();
    } catch (err) {
      setError(err.message || "Could not get your location");
      toast.error("Location update failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle select a meeting location
  const handleSelectLocation = async (location) => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `/api/meetings/${meetingId}/select-location`,
        {
          placeId: location.placeId,
          name: location.name,
          address: location.address,
          coordinates: location.coordinates || 
                     (location.location ? location.location.coordinates : null)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedLocation(location);
      toast.success("Meeting location has been selected!");
    } catch (err) {
      setError(`Failed to select location: ${err.message}`);
      toast.error("Could not select location");
    } finally {
      setLoading(false);
    }
  };
  
  // Render Google Maps
  const renderMap = () => {
    if (!window.google || !centralLocation) return null;
    
    return (
      <div 
        id="meeting-map" 
        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
        className="shadow-md bg-gray-100"
      >
        {/* Map will be initialized here using useEffect */}
      </div>
    );
  };

  // Initialize map once DOM and Google Maps are ready
  useEffect(() => {
    if (!window.google || !centralLocation || !document.getElementById("meeting-map")) return;
    
    const { Map, Marker, Circle, InfoWindow } = window.google.maps;
    
    const map = new Map(document.getElementById("meeting-map"), {
      center: { lat: centralLocation[1], lng: centralLocation[0] },
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    });
    
    // Create info window for markers
    const infoWindow = new InfoWindow();
    
    // Add central circle
    new Circle({
      map,
      center: { lat: centralLocation[1], lng: centralLocation[0] },
      radius: 300,
      fillColor: "rgba(66, 133, 244, 0.2)",
      strokeColor: "rgb(66, 133, 244)",
      strokeWeight: 1
    });
    
    // Add meeting location marker if available
    if (selectedLocation && selectedLocation.coordinates) {
      const coords = selectedLocation.coordinates;
      const meetingMarker = new Marker({
        position: {
          lat: coords[1],
          lng: coords[0]
        },
        map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(40, 40)
        },
        title: selectedLocation.name || "Meeting Location"
      });
      
      meetingMarker.addListener("click", () => {
        infoWindow.setContent(`
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">Meeting Location</h3>
            <p>${selectedLocation.name || ""}</p>
            <p>${selectedLocation.address || ""}</p>
          </div>
        `);
        infoWindow.open(map, meetingMarker);
      });
    }
    
    // Add attendee markers
    attendeeLocations.forEach(attendee => {
      if (!attendee.coordinates || attendee.coordinates.length !== 2) return;
      
      const attendeeMarker = new Marker({
        position: {
          lat: attendee.coordinates[1],
          lng: attendee.coordinates[0]
        },
        map,
        title: attendee.name || "Attendee"
      });
      
      attendeeMarker.addListener("click", () => {
        // Calculate distance from central point
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(attendee.coordinates[1], attendee.coordinates[0]),
          new window.google.maps.LatLng(centralLocation[1], centralLocation[0])
        );
        
        infoWindow.setContent(`
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">${attendee.name || "Attendee"}</h3>
            <p>Distance from center: ${formatDistance(distance)}</p>
            <p>Last updated: ${new Date(attendee.lastUpdated).toLocaleTimeString()}</p>
          </div>
        `);
        infoWindow.open(map, attendeeMarker);
      });
    });
    
    // Add suggestion markers
    locationSuggestions.forEach(suggestion => {
      if (!suggestion.coordinates && (!suggestion.location || !suggestion.location.coordinates)) return;
      
      const coords = suggestion.coordinates || suggestion.location.coordinates;
      
      const suggestionMarker = new Marker({
        position: {
          lat: coords[1],
          lng: coords[0]
        },
        map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new window.google.maps.Size(32, 32)
        },
        title: suggestion.name
      });
      
      suggestionMarker.addListener("click", () => {
        infoWindow.setContent(`
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">${suggestion.name}</h3>
            <p>${suggestion.address || ""}</p>
            <p>Distance: ${formatDistance(suggestion.distance)}</p>
            ${suggestion.rating ? `<p>Rating: ${suggestion.rating} ⭐</p>` : ""}
          </div>
        `);
        infoWindow.open(map, suggestionMarker);
        
        // Also update selected suggestion in component state
        setSelectedLocation(suggestion);
      });
    });
    
  }, [centralLocation, selectedLocation, attendeeLocations, locationSuggestions]);

  // Loading state
  if (loading && !attendeeLocations.length && !locationSuggestions.length) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error && !attendeeLocations.length && !locationSuggestions.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading location data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Meeting Location</h2>
      
      {/* Location status indicator */}
      {locationStatus === "updated" && (
        <div className="mb-4 bg-green-50 text-green-700 p-2 rounded flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Your location is being shared
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleUpdateMyLocation}
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Updating..." : "Update My Location"}
        </button>
        <p className="text-sm text-gray-600 mt-1">
          Share your location to find the best meeting spot for everyone
        </p>
      </div>

      {/* Map section */}
      {centralLocation && renderMap()}
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Filter Suggestions</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place Type
            </label>
            <select
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="bar">Bar</option>
              <option value="park">Park</option>
              <option value="library">Library</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius (m)
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
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
              onClick={fetchLocationSuggestions}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Selected location section */}
      {selectedLocation && (
        <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-200">
          <h3 className="font-medium text-blue-800">Selected Meeting Location</h3>
          <p className="font-semibold">{selectedLocation.name}</p>
          <p className="text-sm text-gray-600">{selectedLocation.address}</p>
          {selectedLocation.distance && (
            <p className="text-sm text-gray-600">
              Distance: {formatDistance(selectedLocation.distance)}
            </p>
          )}
          <button
            onClick={() => handleSelectLocation(selectedLocation)}
            className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <MapPin size={16} />
            Confirm This Location
          </button>
        </div>
      )}

      {/* Location suggestions */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Suggested Locations</h3>
        {loading && !locationSuggestions.length ? (
          <p className="text-gray-600">Loading suggestions...</p>
        ) : locationSuggestions.length > 0 ? (
          <div className="space-y-4">
            {locationSuggestions.map((place, index) => (
              <div
                key={index}
                className={`border rounded-md p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedLocation && selectedLocation.name === place.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedLocation(place)}
              >
                <h4 className="font-medium">{place.name}</h4>
                <p className="text-gray-600">{place.address}</p>
                <div className="flex items-center mt-2">
                  <span className="text-amber-500 mr-1">
                    {place.rating ? `★ ${place.rating}` : "No rating"}
                  </span>
                  {place.distance && (
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDistance(place.distance)}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLocation(place);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Select This Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No suggestions available. Try updating your location or changing filters.
          </p>
        )}
      </div>

      {/* Attendees section */}
      {attendeeLocations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Attendees</h3>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            {attendeeLocations.map((attendee, index) => (
              <div
                key={index}
                className={`p-3 flex items-center justify-between ${
                  index < attendeeLocations.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex items-center">
                  <User className="text-gray-400 mr-3" size={20} />
                  <div>
                    <p className="font-medium">{attendee.name}</p>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(attendee.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingLocation;