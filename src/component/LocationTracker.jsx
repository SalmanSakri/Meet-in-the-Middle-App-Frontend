// Component for tracking user location
import React, { useEffect, useState } from "react";
import axios from "axios";

const LocationTracker = ({ meetingId, token }) => {
  const [locationStatus, setLocationStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Start watching location
    const id = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    setWatchId(id);

    // Cleanup on unmount
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [meetingId]);

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
      console.log("Location updated:", response.data);
    } catch (err) {
      setError(err.message || "Failed to update location");
      setLocationStatus("failed");
    }
  };

  const handleLocationError = (err) => {
    setError(`Geolocation error: ${err.message}`);
    setLocationStatus("failed");
  };

  return (
    <div className="location-tracker">
      {locationStatus === "updating" && <span>Updating your location...</span>}
      {locationStatus === "updated" && (
        <span>Your location is being shared</span>
      )}
      {locationStatus === "failed" && <span>Location sharing failed</span>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default LocationTracker;
