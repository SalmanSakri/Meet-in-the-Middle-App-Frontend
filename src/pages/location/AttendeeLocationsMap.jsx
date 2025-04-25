import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { findMidpoint, formatDistance } from "../../services/locationService";
import LoadingSpinner from "../../component/LoadingSpinner";

const AttendeeLocationsMap = ({ meetingId, token }) => {
  const googleMapsApiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
  const [attendeeLocations, setAttendeeLocations] = useState([]);
  const [centralLocation, setCentralLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps API script dynamically
  useEffect(() => {
    if (!googleMapsApiKey) {
      setError("Google Maps API key is not available");
      setLoading(false);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Create script element to load Google Maps
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setMapLoaded(true);
    };

    script.onerror = () => {
      setError("Failed to load Google Maps");
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts before load
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [googleMapsApiKey]);

  // Fetch attendee locations when component mounts and periodically afterward
  useEffect(() => {
    if (!meetingId || !token || !mapLoaded) return;

    fetchAttendeeLocations();

    // Poll for location updates every 30 seconds
    const intervalId = setInterval(fetchAttendeeLocations, 30000);

    return () => clearInterval(intervalId);
  }, [meetingId, token, mapLoaded]);

  const fetchAttendeeLocations = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/meetings/${meetingId}/attendee-locations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.attendeeLocations && data.attendeeLocations.length > 0) {
        setAttendeeLocations(data.attendeeLocations);
        
        // If no central location is provided, calculate it
        if (!data.centralLocation && data.attendeeLocations.length > 0) {
          const locations = data.attendeeLocations.map(att => ({
            latitude: att.coordinates[1], 
            longitude: att.coordinates[0]
          }));
          
          const midpoint = findMidpoint(locations);
          setCentralLocation([midpoint.longitude, midpoint.latitude]);
        } else {
          setCentralLocation(data.centralLocation);
        }
        
        // Set selected location if available
        setSelectedLocation(data.selectedLocation);
      } else {
        setCentralLocation(null);
        toast.info("No location data available yet");
      }
    } catch (err) {
      setError(`Failed to fetch attendee locations: ${err.message}`);
      toast.error("Could not load attendee locations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderMap = () => {
    if (!window.google || !centralLocation) return null;
    
    const { Map, Marker, Circle, InfoWindow } = window.google.maps;
    
    // Initialize map once DOM is ready
    const mapRef = React.useRef(null);
    const [activeMarker, setActiveMarker] = useState(null);
    const [infoWindow, setInfoWindow] = useState(null);
    
    useEffect(() => {
      if (!mapRef.current || !centralLocation) return;
      
      const map = new Map(mapRef.current, {
        center: { lat: centralLocation[1], lng: centralLocation[0] },
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });
      
      // Create info window for markers
      const info = new InfoWindow();
      setInfoWindow(info);
      
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
        const meetingMarker = new Marker({
          position: {
            lat: selectedLocation.coordinates[1],
            lng: selectedLocation.coordinates[0]
          },
          map,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new window.google.maps.Size(40, 40)
          },
          title: selectedLocation.name || "Meeting Location"
        });
        
        meetingMarker.addListener("click", () => {
          info.setContent(`
            <div>
              <h3 style="font-weight: bold; margin-bottom: 5px;">Meeting Location</h3>
              <p>${selectedLocation.name || ""}</p>
              <p>${selectedLocation.address || ""}</p>
            </div>
          `);
          info.open(map, meetingMarker);
          setActiveMarker(meetingMarker);
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
          
          info.setContent(`
            <div>
              <h3 style="font-weight: bold; margin-bottom: 5px;">${attendee.name || "Attendee"}</h3>
              <p>Distance from center: ${formatDistance(distance)}</p>
              <p>Last updated: ${new Date(attendee.lastUpdated).toLocaleTimeString()}</p>
            </div>
          `);
          info.open(map, attendeeMarker);
          setActiveMarker(attendeeMarker);
        });
      });
      
      // Close info window when clicking on map
      map.addListener("click", () => {
        if (infoWindow) infoWindow.close();
        setActiveMarker(null);
      });
      
    }, [mapRef, centralLocation, selectedLocation, attendeeLocations, infoWindow]);
    
    return (
      <div 
        ref={mapRef} 
        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
        className="shadow-md"
      ></div>
    );
  };

  if (loading && !attendeeLocations.length) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading map</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!centralLocation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <p>No location data available yet. Be the first to share your location!</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      {!mapLoaded ? (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <LoadingSpinner />
          <p className="ml-3 text-gray-600">Loading map...</p>
        </div>
      ) : (
        <>
          {renderMap()}
          <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
            <p>Showing {attendeeLocations.length} attendee{attendeeLocations.length !== 1 ? 's' : ''}</p>
            <button 
              onClick={fetchAttendeeLocations}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendeeLocationsMap;