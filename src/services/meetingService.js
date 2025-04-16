import axios from "axios";
import Cookies from "js-cookie";

// Base API URL - configured based on environment
const API_URL =
  import.meta.env.VITE_API_MEETING_URL ||
  "https://auth-banckend.onrender.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/meetings`, // Path to meetings endpoints
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const authToken = Cookies.get("authToken");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors and normalize response data
api.interceptors.response.use(
  (response) => {
    // Normalize response data to ensure consistent format
    const data = response.data;
    
    // Handle various response formats
    if (data.meeting) {
      return { success: true, meeting: data.meeting, message: data.message };
    }
    
    if (data.meetings) {
      return { success: true, meetings: data.meetings, message: data.message };
    }
    
    if (data.success !== undefined) {
      return data;
    }
    
    // Default successful response
    return { success: true, ...data };
  },
  (error) => {
    // Handle unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      Cookies.remove("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    
    // Format error response
    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject({
      success: false,
      message: errorMessage,
      error: error.response?.data || error
    });
  }
);

export const updateLocation = async (meetingId, longitude, latitude) => {
  try {
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }

    if (longitude === undefined || latitude === undefined) {
      throw new Error("Longitude and latitude are required");
    }

    return await api.post(`/${meetingId}/location`, {
      longitude,
      latitude,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

/**
 * Get location suggestions for a meeting
 * @param {string} meetingId - Meeting ID
 * @param {string} type - Place type (restaurant, cafe, etc.)
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Object>} - Response with central location and suggestions
 */
export const getLocationSuggestions = async (
  meetingId,
  type = "restaurant",
  radius = 1500
) => {
  try {
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }

    const userData = getUserData();
    // Modified to use query params as expected by the backend
    return await api.get(`/${meetingId}/suggestions`, {
      params: {
        type,
        radius,
        userId: userData.id,
      },
    });
  } catch (error) {
    console.error("Error getting location suggestions:", error);
    throw error;
  }
};

/**
 * Respond to meeting invitation (public route - no auth required)
 * @param {string} meetingId - Meeting ID
 * @param {string} token - Invitation token
 * @param {string} response - Response type (accept/decline)
 * @returns {Promise<Object>} - Response with normalized structure
 */
export const respondToInvitation = async (meetingId, token, response) => {
  try {
    if (!meetingId || !token || !response) {
      throw new Error("Meeting ID, token and response are required");
    }

    // Validate response type
    if (!["accept", "decline"].includes(response.toLowerCase())) {
      throw new Error("Response must be either 'accept' or 'decline'");
    }

    // Use direct axios call without auth header for public endpoint
    const result = await axios.get(
      `${API_URL}/meetings/${meetingId}/${token}/${response}`
    );

    return {
      success: true,
      message: result.data.message || "Response submitted successfully",
      ...result.data,
    };
  } catch (error) {
    console.error("Error responding to invitation:", error);
    throw {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to respond to invitation",
      error: error.response?.data || error,
    };
  }
};




/**
 * Safely get user data from localStorage with error handling
 * @returns {Object} User data or empty object if not found
 */
const getUserData = () => {
  try {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      return { id: null };
    }

    const userData = JSON.parse(userDataStr);
    // Normalize id field
    return {
      ...userData,
      id: userData.id || userData._id || null,
    };
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { id: null };
  }
};
/**
 * Create a new meeting
 * @param {Object} meetingData - Meeting details
 * @returns {Promise<Object>} - Created meeting
 */

export const createMeeting = async (meetingData) => {
  try {
    const userData = getUserData();

    // Check if user is authenticated
    if (!userData.id && !userData._id) {
      throw new Error("User not authenticated. Please log in.");
    }

    // Ensure the location object is properly formatted before sending
    const formattedData = {
      ...meetingData,
      userId: userData.id || userData._id, // Handle different ID formats
      location: {
        type: "Point",
        coordinates: meetingData.location.coordinates || [0, 0],
        name: meetingData.location.name || "",
        address: meetingData.location.address || "",
      },
    };

    const data = await api.post("", formattedData);
    return data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

/**
 * Get all meetings for current user
 * @returns {Promise<Object>} - User meetings
 */
export const getUserMeetings = async () => {
  try {
    const userData = getUserData();

    // Check if userData exists and has an ID
    if (!userData.id && !userData._id) {
      throw new Error("User data not found. Please log in again.");
    }
    // Send userId as a query parameter instead of in the request body
    const data = await api.get(`?userId=${userData.id}`);
    return data;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
};

/**
 * Get a single meeting by ID
 * @param {string} meetingId - Meeting ID
 * @returns {Promise<Object>} - Meeting details
 */
export const getMeetingById = async (meetingId) => {
  try {
    // Added null check for meetingId
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }

    // Get user data to include in the request
    const userData = getUserData();

    // Include the user ID as a query parameter
    const data = await api.get(`/${meetingId}`, {
      params: {
        userId: userData.id || userData._id,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    throw error;
  }
};

/**
 * Update a meeting
 * @param {string} meetingId - Meeting ID
 * @param {Object} meetingData - Updated meeting details
 * @returns {Promise<Object>} - Updated meeting
 */
export const updateMeeting = async (meetingId, meetingData) => {
  try {
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }

    // Ensure the location object is properly formatted
    const formattedData = {
      ...meetingData,
      location: meetingData.location
        ? {
            type: "Point",
            coordinates: meetingData.location.coordinates || [0, 0],
            name: meetingData.location.name || "",
            address: meetingData.location.address || "",
          }
        : meetingData.location,
    };
   return await api.put(`/${meetingId}`, formattedData);
  } catch (error) {
    console.error("Error updating meeting:", error);
    throw error;
  }
};

/**
 * Delete a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise<Object>} - Response
 */
export const deleteMeeting = async (meetingId) => {
  try {
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }
    const data = await api.delete(`/${meetingId}`);
    return data;
  } catch (error) {
    console.error("Error deleting meeting:", error);
    throw error;
  }
};

/**
 * Add attendees to a meeting
 * @param {string} meetingId - Meeting ID
 * @param {Array} attendees - Array of attendee objects
 * @returns {Promise<Object>} - Updated meeting with new attendees
 */
export const addAttendees = async (meetingId, attendees) => {
  try {
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }

    if (!Array.isArray(attendees) || attendees.length === 0) {
      throw new Error("Valid attendees array is required");
    }

    const data = await api.post(`/${meetingId}/attendees`, {
      attendees,
    });
    return data;
  } catch (error) {
    console.error("Error adding attendees:", error);
    throw error;
  }
};

/**
 * Update user location for a meeting
 * @param {string} meetingId - Meeting ID
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @returns {Promise<Object>} - Response with central location and suggestions
 */


export default {
  createMeeting,
  getUserMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  addAttendees,
  updateLocation,
  getLocationSuggestions,
  respondToInvitation,
};