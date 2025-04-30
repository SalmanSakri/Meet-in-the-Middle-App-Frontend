import React, { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { updateLocation, getLocationSuggestions, getMeetingById } from '../redux/slices/meetingSlice';
import { backendToLeaflet, leafletToBackend, ensureValidCoordinates } from '../utils/Coordinate';
import { toast } from 'react-toastify';

// Fix for default markers not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define icon colors once
const ICON_COLORS = {
  USER: 'blue',
  CENTRAL: 'red',
  ATTENDEE: 'green',
  SELECTED: 'gold',
  SUGGESTION: 'violet'
};

// Memoized icon cache to prevent recreating icons on each render
const iconCache = {};
const getIcon = (color) => {
  if (!iconCache[color]) {
    iconCache[color] = new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
  return iconCache[color];
};

// Format relative time nicely
const formatLastUpdated = (date) => {
  if (!date) return 'Unknown';
  
  const minutesAgo = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo === 1) return '1 minute ago';
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo === 1) return '1 hour ago';
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;
  
  return new Date(date).toLocaleString();
};

// Component to handle map view updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && 
        !isNaN(center[0]) && !isNaN(center[1]) && 
        Math.abs(center[0]) <= 90 && Math.abs(center[1]) <= 180) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

// Error notification component
const ErrorNotification = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
      <span>{message}</span>
      <button 
        className="absolute top-0 right-0 px-4 py-3" 
        onClick={onDismiss}
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
};

// Loading indicator component
const LoadingIndicator = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-50">
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500 border-r-2"></div>
    </div>
  );
};

/**
 * Main RealTimeLocation component
 * Handles displaying and updating meeting locations
 */
const RealTimeLocation = ({
  meetingId,
  isCreator = false,
  onLocationSelected,
  selectionMode = false,
  createMode = false,
  initialLocation = null
}) => {
  // Redux
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { 
    locationSuggestions = [], 
    centralLocation, 
    loading = false, 
    error = null
  } = useSelector(state => state.meetings);
  const currentMeeting = useSelector(state => state.meetings.currentMeeting);
  
  // Local state with useRef for values that don't trigger re-renders
  const userLocationRef = useRef(null);
  const mapCenterRef = useRef([40.7128, -74.0060]); // Default to NYC
  const selectedLocationRef = useRef(null);
  const attendeeLocationsRef = useRef([]);
  
  // State for UI elements that need to trigger re-renders
  const [locationType, setLocationType] = useState('restaurant');
  const [radius, setRadius] = useState(1000);
  const [locationError, setLocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialLocation && ensureValidCoordinates(initialLocation, 'leaflet') || [40.7128, -74.0060]);
  const [zoom, setZoom] = useState(13);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [hasGeolocationPermission, setHasGeolocationPermission] = useState(true); // Track if we have permission
  
  // Refs for cleanup
  const locationIntervalRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  // API base URL determination
  const apiBaseUrl = useMemo(() => {
    return import.meta.env.VITE_API_MEETING_URL || 
      window.VITE_API_MEETING_URL || 
      'http://localhost:7777/api';
  }, []);

  // Show error message with auto-dismissal
  const showError = useCallback((message, duration = 5000) => {
    setLocationError(message);
    
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    
    errorTimeoutRef.current = setTimeout(() => {
      setLocationError(null);
    }, duration);
  }, []);

  // Validate if coordinates are within acceptable range
  const validateCoordinates = useCallback((lat, lng) => {
    return (
      !isNaN(lat) && !isNaN(lng) &&
      Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    );
  }, []);

  // Get current user location with better error handling
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Validate coordinates before storing
        if (!validateCoordinates(latitude, longitude)) {
          showError("Invalid coordinates received from browser");
          return;
        }
        
        setHasGeolocationPermission(true); // We have permission
        
        userLocationRef.current = {
          coordinates: [longitude, latitude], // Store in backend format [lng, lat]
          accuracy
        };

        // Center map on first load if no central location
        if ((!centralLocation && !initialLocation) || 
            (!centralLocation && initialLocation && 
             (!Array.isArray(initialLocation) || initialLocation[0] === 0))) {
          const leafletCoords = [latitude, longitude]; // Leaflet format [lat, lng]
          setMapCenter(leafletCoords);
          mapCenterRef.current = leafletCoords;
        }

        // Send location update to server via Redux
        if (!createMode && meetingId && token) {
          dispatch(updateLocation({
            meetingId,
            location: {
              coordinates: [longitude, latitude] // Backend format [lng, lat]
            },
            token
          })).catch(err => {
            console.error("Error updating location:", err);
          });
        }
      },
      (error) => {
        // Handle specific geolocation errors with user-friendly messages
        let errorMsg = "Could not determine your location. ";
        
        if (error.code === error.PERMISSION_DENIED) {
          setHasGeolocationPermission(false); // Set permission denied
          errorMsg += "Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg += "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg += "Location request timed out.";
        } else {
          errorMsg += error.message;
        }
        
        showError(errorMsg);
        console.warn(`Geolocation error: ${errorMsg}`);
      },
      { 
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for slower connections
        maximumAge: 60000
      }
    );
  }, [centralLocation, showError, createMode, dispatch, meetingId, initialLocation, token, validateCoordinates]);

  // Process and update attendee locations from current meeting
  const processAttendeeLocations = useCallback(() => {
    if (!currentMeeting || !currentMeeting.attendees) return;
    
    const locations = currentMeeting.attendees
      .filter(attendee => attendee.location && attendee.location.coordinates)
      .map(attendee => {
        // Safety check for coordinates
        if (!Array.isArray(attendee.location.coordinates) || 
            attendee.location.coordinates.length !== 2 ||
            isNaN(attendee.location.coordinates[0]) ||
            isNaN(attendee.location.coordinates[1])) {
          return null;
        }
        
        const leafletCoords = backendToLeaflet(attendee.location.coordinates);
        if (!leafletCoords) return null;
        
        return {
          id: attendee.id || attendee._id,
          name: attendee.name || 'Unknown',
          coordinates: leafletCoords,
          lastUpdated: attendee.lastUpdated || attendee.updatedAt || new Date()
        };
      })
      .filter(Boolean); // Remove nulls from invalid coordinates
    
    attendeeLocationsRef.current = locations;
    
    // Check for selected location in current meeting
    if (currentMeeting.location && 
        currentMeeting.location.coordinates && 
        Array.isArray(currentMeeting.location.coordinates) &&
        currentMeeting.location.coordinates.length === 2) {
      
      const leafletCoords = backendToLeaflet(currentMeeting.location.coordinates);
      
      if (leafletCoords) {
        selectedLocationRef.current = {
          coordinates: leafletCoords,
          name: currentMeeting.location.name || 'Meeting Location',
          address: currentMeeting.location.address || ''
        };
      }
    }
  }, [currentMeeting]);

  // Fetch location suggestions with debouncing
  const fetchLocationSuggestions = useCallback(() => {
    if (createMode || !meetingId || !centralLocation) return;
    
    // Clear any existing timeout
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    // Using a small timeout to debounce rapid changes
    suggestionsTimeoutRef.current = setTimeout(() => {
      dispatch(getLocationSuggestions({
        meetingId,
        type: locationType,
        radius,
        token
      })).catch(err => {
        console.error("Error fetching location suggestions:", err);
        showError("Failed to get location suggestions");
      });
    }, 300);
  }, [centralLocation, locationType, radius, dispatch, meetingId, createMode, token, showError]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    if (!suggestion || !suggestion.location || !suggestion.location.coordinates) {
      showError("Invalid location suggestion");
      return;
    }
    
    // Convert coordinates from backend [lng, lat] to Leaflet [lat, lng] format
    const leafletCoords = backendToLeaflet(suggestion.location.coordinates);
    
    if (!leafletCoords) {
      showError("Invalid coordinates in suggestion");
      return;
    }
    
    if (selectionMode && onLocationSelected) {
      // For selection mode (e.g. when updating meeting location)
      onLocationSelected({
        coordinates: leafletCoords,
        name: suggestion.name,
        address: suggestion.address || ''
      });
    } else if (isCreator) {
      // For creator mode (setting meeting location)
      selectLocation(suggestion);
    }
  }, [selectionMode, onLocationSelected, isCreator, showError]);

  // Select a location for the meeting (creator only)
  const selectLocation = useCallback(async (suggestion) => {
    if (!isCreator || !meetingId || !token) {
      return;
    }

    try {
      const signal = abortControllerRef.current.signal;
      const response = await fetch(
        `${apiBaseUrl}/meetings/${meetingId}/select-location`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            placeId: suggestion.placeId || suggestion.id,
            name: suggestion.name,
            address: suggestion.address || '',
            coordinates: suggestion.location.coordinates // Already in backend format [lng, lat]
          }),
          signal
        }
      );

      if (signal.aborted) return;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.location && Array.isArray(data.location.coordinates)) {
        const leafletCoords = backendToLeaflet(data.location.coordinates);
        if (leafletCoords) {
          selectedLocationRef.current = {
            coordinates: leafletCoords,
            name: data.location.name || suggestion.name,
            address: data.location.address || suggestion.address
          };
          // Force a re-render to show the new selected location
          setForceUpdate(prev => prev + 1);
        }
      }
      
      // Show success message
      toast.success("Meeting location has been set successfully!");
      
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error selecting location:', error);
      showError(`Failed to select location: ${error.message}`);
    }
  }, [apiBaseUrl, isCreator, meetingId, showError, token]);

  // Update centralLocation in local state when Redux state changes
  useEffect(() => {
    if (centralLocation && Array.isArray(centralLocation) && centralLocation.length === 2) {
      const leafletCoords = backendToLeaflet(centralLocation);
      if (leafletCoords) {
        setMapCenter(leafletCoords);
        mapCenterRef.current = leafletCoords;
      }
    }
  }, [centralLocation]);

  // Process current meeting data when it changes
  useEffect(() => {
    processAttendeeLocations();
  }, [currentMeeting, processAttendeeLocations]);

  // Initial setup and cleanup
  useEffect(() => {
    // Create a new AbortController for this component instance
    abortControllerRef.current = new AbortController();
    
    if (createMode) {
      // Handle create mode - just get current location
      getCurrentLocation();
      return () => {
        abortControllerRef.current.abort();
      };
    }
    
    // Skip setup if required props are missing
    if (!meetingId) {
      console.error("Meeting ID is required");
      showError("Error: Meeting ID is missing");
      
      return () => {
        abortControllerRef.current.abort();
      };
    }

    // Initial data load
    getCurrentLocation();

    // Set intervals for periodic updates with reasonable frequency
    // Only if we have geolocation permission to avoid spamming error messages
    if (hasGeolocationPermission) {
      locationIntervalRef.current = setInterval(getCurrentLocation, 60000); // Every minute
    }
    
    // Cleanup function
    return () => {
      abortControllerRef.current.abort();
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (suggestionsTimeoutRef.current) clearTimeout(suggestionsTimeoutRef.current);
    };
  }, [getCurrentLocation, meetingId, showError, createMode, hasGeolocationPermission]);

  // Fetch suggestions when relevant params change
  useEffect(() => {
    fetchLocationSuggestions();
  }, [centralLocation, locationType, radius, fetchLocationSuggestions]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  // Force component re-render for map updates every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 60000); // Every minute
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="real-time-location-container relative">
      <LoadingIndicator isLoading={loading} />
      
      <ErrorNotification 
        message={locationError}
        onDismiss={() => setLocationError(null)} 
      />

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="place-type" className="block text-sm font-medium text-gray-700 mb-1">Place Type:</label>
          <select
            id="place-type"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            aria-label="Select place type"
          >
            <option value="restaurant">Restaurants</option>
            <option value="cafe">Cafés</option>
            <option value="bar">Bars</option>
            <option value="park">Parks</option>
            <option value="library">Libraries</option>
            <option value="meeting_room">Meeting Rooms</option>
          </select>
        </div>
        <div>
          <label htmlFor="search-radius" className="block text-sm font-medium text-gray-700 mb-1">Search Radius:</label>
          <select
            id="search-radius"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            aria-label="Select search radius"
          >
            <option value="500">500 m</option>
            <option value="1000">1 km</option>
            <option value="2000">2 km</option>
            <option value="5000">5 km</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {/* Map */}
          <div className="h-96 w-full mb-4 rounded overflow-hidden border border-gray-300 relative">
            <MapContainer
              center={mapCenter}
              zoom={zoom}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              key={`map-${forceUpdate}`} // Force re-render with key change
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Update map view when center changes */}
              <MapUpdater center={mapCenter} zoom={zoom} />

              {/* User location */}
              {userLocationRef.current && userLocationRef.current.coordinates && (
                <Marker 
                  position={backendToLeaflet(userLocationRef.current.coordinates) || [0, 0]} 
                  icon={getIcon(ICON_COLORS.USER)}
                >
                  <Popup>
                    Your Location
                    <br />
                    Accuracy: {Math.round(userLocationRef.current.accuracy)}m
                  </Popup>
                </Marker>
              )}

              {/* Central location */}
              {centralLocation && (
                <>
                  <Marker 
                    position={backendToLeaflet(centralLocation) || [0, 0]} 
                    icon={getIcon(ICON_COLORS.CENTRAL)}
                  >
                    <Popup>
                      Central Location
                      <br />
                      (Average of all attendees)
                    </Popup>
                  </Marker>
                  <Circle
                    center={backendToLeaflet(centralLocation) || [0, 0]}
                    radius={radius}
                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                  />
                </>
              )}

              {/* Other attendees */}
              {attendeeLocationsRef.current.map((attendee, index) => (
                <Marker
                  key={attendee.id || `attendee-${index}`}
                  position={attendee.coordinates}
                  icon={getIcon(ICON_COLORS.ATTENDEE)}
                >
                  <Popup>
                    {attendee.name}
                    <br />
                    Last updated: {formatLastUpdated(attendee.lastUpdated)}
                  </Popup>
                </Marker>
              ))}

              {/* Selected meeting location */}
              {selectedLocationRef.current && selectedLocationRef.current.coordinates && (
                <Marker
                  position={selectedLocationRef.current.coordinates}
                  icon={getIcon(ICON_COLORS.SELECTED)}
                >
                  <Popup>
                    <strong>Meeting Location:</strong>
                    <br />
                    {selectedLocationRef.current.name}
                    <br />
                    {selectedLocationRef.current.address}
                  </Popup>
                </Marker>
              )}

              {/* Location suggestions */}
              {locationSuggestions && locationSuggestions.map((suggestion, index) => {
                // Safely access coordinates with validation
                if (!suggestion.location || 
                    !suggestion.location.coordinates || 
                    !Array.isArray(suggestion.location.coordinates) || 
                    suggestion.location.coordinates.length < 2) {
                  return null;
                }
                
                const leafletCoords = backendToLeaflet(suggestion.location.coordinates);
                if (!leafletCoords) return null;
                
                return (
                  <Marker
                    key={suggestion.placeId || `suggestion-${index}`}
                    position={leafletCoords}
                    icon={getIcon(ICON_COLORS.SUGGESTION)}
                  >
                    <Popup>
                      <strong>{suggestion.name}</strong>
                      <br />
                      {suggestion.address}
                      <br />
                      Rating: {suggestion.rating ? `${suggestion.rating}/5` : 'N/A'}
                      <br />
                      Distance: {Math.round(suggestion.distance)}m
                      {(isCreator || selectionMode) && (
                        <div className="mt-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            aria-label={selectionMode ? 'Select Location' : 'Set as Meeting Location'}
                          >
                            {selectionMode ? 'Select Location' : 'Set as Meeting Location'}
                          </button>
                        </div>
                      )}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          {/* Suggestions list */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="font-medium text-gray-800">Meeting Place Suggestions</h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {locationSuggestions && locationSuggestions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {locationSuggestions.map((suggestion, index) => (
                    <li key={suggestion.placeId || `list-suggestion-${index}`} className="p-3">
                      <h4 className="font-medium">{suggestion.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{suggestion.address}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {suggestion.rating ? `Rating: ${suggestion.rating}/5` : 'No rating'}
                        </span>
                        <span>{Math.round(suggestion.distance)}m away</span>
                      </div>
                      {(isCreator || selectionMode) && (
                        <button
                          className="mt-2 px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          aria-label={`Select ${suggestion.name}`}
                        >
                          Select
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : centralLocation ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No places match your criteria in this area. Try changing the place type or increasing the search radius.
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Waiting for location data... Make sure location services are enabled in your browser.
                </div>
              )}
            </div>
          </div>

          {/* Attendees list */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="font-medium text-gray-800">Attendees Locations</h3>
            </div>
            <div className="max-h-36 overflow-y-auto">
              {attendeeLocationsRef.current.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {attendeeLocationsRef.current.map((attendee, index) => (
                    <li key={attendee.id || `attendee-list-${index}`} className="p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{attendee.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatLastUpdated(attendee.lastUpdated)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No attendee locations available yet.
                </div>
              )}
            </div>
          </div>

          {/* Selected location info */}
          {selectedLocationRef.current && (
            <div className="border border-green-300 rounded-lg overflow-hidden">
              <div className="bg-green-100 px-4 py-2 border-b border-green-300">
                <h3 className="font-medium text-green-800">Selected Meeting Location</h3>
              </div>
              <div className="p-3">
                <h4 className="font-medium">{selectedLocationRef.current.name}</h4>
                {selectedLocationRef.current.address && <p className="text-sm text-gray-600">{selectedLocationRef.current.address}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RealTimeLocation);