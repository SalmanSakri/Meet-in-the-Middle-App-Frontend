/**
 * Coordinates utility functions for converting between different coordinate formats
 * and ensuring coordinate validity throughout the application.
 */

/**
 * Converts coordinates from backend format [lng, lat] to Leaflet format [lat, lng]
 * @param {Array} coordinates - Backend coordinates in format [longitude, latitude]
 * @returns {Array|null} - Leaflet coordinates in format [latitude, longitude] or null if invalid
 */
export const backendToLeaflet = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return null;
    }
    
    // Check if values are valid numbers
    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      return null;
    }
    
    const [lng, lat] = coordinates;
    
    // Basic validation for latitude (-90 to 90) and longitude (-180 to 180)
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return null;
    }
    
    return [lat, lng];
  };
  
  /**
   * Converts coordinates from Leaflet format [lat, lng] to backend format [lng, lat]
   * @param {Array} coordinates - Leaflet coordinates in format [latitude, longitude]
   * @returns {Array|null} - Backend coordinates in format [longitude, latitude] or null if invalid
   */
  export const leafletToBackend = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return null;
    }
    
    // Check if values are valid numbers
    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      return null;
    }
    
    const [lat, lng] = coordinates;
    
    // Basic validation for latitude (-90 to 90) and longitude (-180 to 180)
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return null;
    }
    
    return [lng, lat];
  };
  
  /**
   * Safely validates and returns coordinates in the required format
   * @param {Array} coordinates - Coordinates to check
   * @param {String} format - Either 'leaflet' for [lat, lng] or 'backend' for [lng, lat]
   * @returns {Array|null} - Properly formatted coordinates or null if invalid
   */
  export const ensureValidCoordinates = (coordinates, format = 'leaflet') => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return null;
    }
    
    // If values are not numbers, return null
    if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
      return null;
    }
    
    // If both values are near zero, it's likely an invalid location
    if (Math.abs(coordinates[0]) < 0.001 && Math.abs(coordinates[1]) < 0.001) {
      return null;
    }
    
    // Validate based on expected format
    if (format === 'leaflet') {
      // For Leaflet, first value is latitude (-90 to 90)
      if (Math.abs(coordinates[0]) > 90) return null;
      // Second value is longitude (-180 to 180)
      if (Math.abs(coordinates[1]) > 180) return null;
    } else {
      // For backend, first value is longitude (-180 to 180)
      if (Math.abs(coordinates[0]) > 180) return null;
      // Second value is latitude (-90 to 90)
      if (Math.abs(coordinates[1]) > 90) return null;
    }
    
    return coordinates;
  };
  
  /**
   * Safely extracts coordinates from a location object that might come in various formats
   * @param {Object} location - A location object with coordinates property
   * @returns {Array|null} - Backend format coordinates [lng, lat] or null if invalid
   */
  export const extractCoordinatesFromLocation = (location) => {
    if (!location) return null;
    
    // Handle various formats that might come from different parts of the app
    if (location.coordinates && Array.isArray(location.coordinates)) {
      return ensureValidCoordinates(location.coordinates, 'backend');
    }
    
    // Some APIs might provide lat/lng directly
    if (location.lat !== undefined && location.lng !== undefined) {
      return ensureValidCoordinates([location.lng, location.lat], 'backend');
    }
    
    // Handle latitude/longitude properties
    if (location.latitude !== undefined && location.longitude !== undefined) {
      return ensureValidCoordinates([location.longitude, location.latitude], 'backend');
    }
    
    return null;
  };
  
  /**
   * Calculates distance between two points in kilometers
   * Uses the Haversine formula
   * @param {Array} coord1 - First coordinate pair in [latitude, longitude] format
   * @param {Array} coord2 - Second coordinate pair in [latitude, longitude] format
   * @returns {Number} - Distance in kilometers or -1 if inputs are invalid
   */
  export const calculateDistance = (coord1, coord2) => {
    // Validate inputs
    if (!coord1 || !coord2 || !Array.isArray(coord1) || !Array.isArray(coord2) ||
        coord1.length !== 2 || coord2.length !== 2) {
      return -1;
    }
    
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    // Radius of the Earth in kilometers
    const R = 6371;
    
    // Convert latitude and longitude from degrees to radians
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    // Convert latitudes to radians
    const radLat1 = lat1 * Math.PI / 180;
    const radLat2 = lat2 * Math.PI / 180;
    
    // Haversine formula
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(radLat1) * Math.cos(radLat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Distance in kilometers
    return R * c;
  };