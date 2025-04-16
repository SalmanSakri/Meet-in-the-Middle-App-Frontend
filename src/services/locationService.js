/**
 * @file locationService.js
 * @description Service for location-related functionality
 */

/**
 * Get the current user's geolocation position
 * @returns {Promise} - Promise resolving to location coordinates
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "User denied the request for geolocation";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out";
              break;
            default:
              errorMessage = "An unknown error occurred";
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  });
};

/**
 * Calculate distance between two geographical points using the Haversine formula
 * @param {Object} point1 - First point with latitude and longitude
 * @param {Object} point2 - Second point with latitude and longitude
 * @returns {number} - Distance in meters
 */
export const calculateDistance = (point1, point2) => {
  // Input validation
  if (
    !point1 ||
    !point2 ||
    point1.latitude === undefined ||
    point1.longitude === undefined ||
    point2.latitude === undefined ||
    point2.longitude === undefined
  ) {
    throw new Error("Invalid coordinates provided");
  }

  // Earth's radius in meters
  const R = 6371e3;

  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Find midpoint between multiple coordinates
 * @param {Array} coordinates - Array of {latitude, longitude} objects
 * @returns {Object} - Midpoint coordinates
 */
export const findMidpoint = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error("Invalid coordinates array");
  }

  // For a single coordinate, return it as is
  if (coordinates.length === 1) {
    return { ...coordinates[0] };
  }

  // Calculate the average of all coordinates
  let x = 0;
  let y = 0;
  let z = 0;

  coordinates.forEach((coord) => {
    // Convert to radians
    const lat = (coord.latitude * Math.PI) / 180;
    const lon = (coord.longitude * Math.PI) / 180;

    // Convert to Cartesian coordinates
    x += Math.cos(lat) * Math.cos(lon);
    y += Math.cos(lat) * Math.sin(lon);
    z += Math.sin(lat);
  });

  // Normalize the resulting vector
  const total = coordinates.length;
  x /= total;
  y /= total;
  z /= total;

  // Convert back to latitude/longitude
  const lon = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);

  // Return the midpoint in degrees
  return {
    latitude: (lat * 180) / Math.PI,
    longitude: (lon * 180) / Math.PI,
  };
};

export default {
  getCurrentPosition,
  calculateDistance,
  formatDistance,
  findMidpoint,
};
