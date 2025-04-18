import React from "react";
import axios from "axios";

const SelectMeetingLocation = ({ meetingId, token, location, onSuccess }) => {
  const selectLocation = async () => {
    try {
      const response = await axios.post(
        `/api/meetings/${meetingId}/select-location`,
        {
          placeId: location.placeId,
          name: location.name,
          address: location.address,
          coordinates: location.location.coordinates,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Failed to select meeting location:", error);
      throw error;
    }
  };

  return (
    <div className="select-location">
      <h4>Confirm Meeting Location</h4>
      <div className="location-details">
        <p>
          <strong>Name:</strong> {location.name}
        </p>
        <p>
          <strong>Address:</strong> {location.address}
        </p>
        {location.rating && (
          <p>
            <strong>Rating:</strong> {location.rating}/5
          </p>
        )}
      </div>
      <button className="primary-btn" onClick={selectLocation}>
        Confirm This Location
      </button>
    </div>
  );
};

export default SelectMeetingLocation;
