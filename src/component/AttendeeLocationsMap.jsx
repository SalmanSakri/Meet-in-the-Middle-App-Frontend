import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import axios from "axios";

const AttendeeLocationsMap = ({ meetingId, token, googleMapsApiKey }) => {
  const [attendeeLocations, setAttendeeLocations] = useState([]);
  const [centralLocation, setCentralLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendeeLocations();

    // Poll for location updates every 30 seconds
    const intervalId = setInterval(fetchAttendeeLocations, 30000);

    return () => clearInterval(intervalId);
  }, [meetingId]);

  const fetchAttendeeLocations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/api/meetings/${meetingId}/attendee-locations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendeeLocations(response.data.attendeeLocations || []);
      setCentralLocation(response.data.centralLocation);
      setSelectedLocation(response.data.selectedLocation);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch attendee locations");
      setLoading(false);
    }
  };

  if (loading) return <div>Loading map...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!centralLocation) return <div>No location data available</div>;

  return (
    <div className="map-container" style={{ height: "400px", width: "100%" }}>
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        center={{
          lat: centralLocation[1], // latitude
          lng: centralLocation[0], // longitude
        }}
        zoom={14}
      >
        {/* Central meeting point */}
        <Circle
          center={{
            lat: centralLocation[1],
            lng: centralLocation[0],
          }}
          radius={300}
          options={{
            fillColor: "rgba(66, 133, 244, 0.2)",
            strokeColor: "rgb(66, 133, 244)",
            strokeWeight: 1,
          }}
        />

        {/* Selected meeting location marker */}
        {selectedLocation && selectedLocation.coordinates && (
          <Marker
            position={{
              lat: selectedLocation.coordinates[1],
              lng: selectedLocation.coordinates[0],
            }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            label={{
              text: "Meeting",
              color: "white",
              fontWeight: "bold",
            }}
          />
        )}

        {/* Attendee markers */}
        {attendeeLocations.map((attendee) => (
          <Marker
            key={attendee.id}
            position={{
              lat: attendee.coordinates[1],
              lng: attendee.coordinates[0],
            }}
            title={attendee.name}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default AttendeeLocationsMap;
