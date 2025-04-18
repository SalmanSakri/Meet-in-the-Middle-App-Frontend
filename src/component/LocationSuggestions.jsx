import React, { useState, useEffect } from "react";
import axios from "axios";

const LocationSuggestions = ({ meetingId, token, onSelectLocation }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [centralLocation, setCentralLocation] = useState(null);
  const [filters, setFilters] = useState({
    type: "restaurant",
    radius: 1500,
    keyword: "",
  });

  useEffect(() => {
    fetchSuggestions();
  }, [meetingId, filters]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `/api/meetings/${meetingId}/suggestions?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions(response.data.suggestions || []);
      setCentralLocation(response.data.centralLocation);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const selectLocation = async (suggestion) => {
    if (onSelectLocation) {
      onSelectLocation(suggestion);
    }
  };

  return (
    <div className="location-suggestions">
      <h3>Meeting Location Suggestions</h3>

      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="restaurant">Restaurants</option>
          <option value="cafe">Cafes</option>
          <option value="bar">Bars</option>
          <option value="park">Parks</option>
        </select>

        <select
          name="radius"
          value={filters.radius}
          onChange={handleFilterChange}
        >
          <option value="500">500m</option>
          <option value="1000">1km</option>
          <option value="1500">1.5km</option>
          <option value="3000">3km</option>
        </select>

        <input
          type="text"
          name="keyword"
          placeholder="Search keyword"
          value={filters.keyword}
          onChange={handleFilterChange}
        />
      </div>

      {loading ? (
        <p>Loading suggestions...</p>
      ) : suggestions.length > 0 ? (
        <ul className="suggestions-list">
          {suggestions.map((place) => (
            <li key={place.placeId} className="suggestion-item">
              <div className="place-info">
                <h4>{place.name}</h4>
                <p>{place.address}</p>
                <div className="details">
                  <span className="rating">
                    {place.rating ? `★ ${place.rating}/5` : "No rating"}
                  </span>
                  <span className="distance">
                    {(place.distance / 1000).toFixed(1)}km away
                  </span>
                </div>
              </div>
              <button
                className="select-btn"
                onClick={() => selectLocation(place)}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No suggestions available based on attendee locations</p>
      )}
    </div>
  );
};

export default LocationSuggestions;
