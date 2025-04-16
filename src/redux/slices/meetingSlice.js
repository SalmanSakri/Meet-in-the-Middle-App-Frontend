import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as meetingService from "../../services/meetingService";

// Create normalized error handling function for thunks
const handleThunkError = (error, rejectWithValue) => {
  return rejectWithValue({
    message: error.message || "An error occurred",
    error: error.error || error
  });
};



// Get all meetings for the current user
export const getUserMeetings = createAsyncThunk(
  "meetings/getUserMeetings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await meetingService.getUserMeetings();
      return response.meetings || response; // Handle both response formats
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch meetings",
        }
      );
    }
  }
);
export const getMeetingById = createAsyncThunk(
  "meetings/getMeetingById",
  async (meetingId, { rejectWithValue }) => {
    try {
      const response = await meetingService.getMeetingById(meetingId);
      return response.meeting;
    } catch (error) {
      return rejectWithValue(
        error.message || "Not authorized to view this meeting"
      );
    }
  }
);

// Create a new meeting
export const createMeeting = createAsyncThunk(
  "meetings/createMeeting",
  async (meetingData, { rejectWithValue }) => {
    try {
      if (!meetingData) {
        return rejectWithValue({ message: "Meeting data is required" });
      }
      const response = await meetingService.createMeeting(meetingData);
      return response.meeting || response; // Handle both response formats
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to create meeting",
        }
      );
    }
  }
);

// Delete a meeting
export const deleteMeeting = createAsyncThunk(
  "meetings/deleteMeeting",
  async (meetingId, { rejectWithValue }) => {
    try {
      if (!meetingId) {
        return rejectWithValue({ message: "Meeting ID is required" });
      }
    
      const response = await meetingService.deleteMeeting(meetingId);
      return { meetingId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to delete meeting",
        }
      );
    }
  }
);

// Update a meeting's details
export const updateMeeting = createAsyncThunk(
  "meetings/updateMeeting",
  async ({ meetingId, meetingData }, { rejectWithValue }) => {
    try {
      if (!meetingId || !meetingData) {
        return rejectWithValue({ message: "Meeting ID and data are required" });
      }
      const response = await meetingService.updateMeeting(
        meetingId,
        meetingData
      );
      return response.meeting || response; // Handle both response formats
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to update meeting",
        }
      );
    }
  }
);

// Add attendees to a meeting
export const addAttendees = createAsyncThunk(
  "meetings/addAttendees",
  async ({ meetingId, attendees }, { rejectWithValue }) => {
    try {
      if (!meetingId || !attendees) {
        return rejectWithValue({
          message: "Meeting ID and attendees are required",
        });
      }
      const response = await meetingService.addAttendees(meetingId, attendees);
      return { meetingId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to add attendees",
        }
      );
    }
  }
);

// Update user location for a meeting
export const updateLocation = createAsyncThunk(
  "meetings/updateLocation",
  async ({ meetingId, longitude, latitude }, { rejectWithValue }) => {
    try {
      if (!meetingId || longitude === undefined || latitude === undefined) {
        return rejectWithValue({
          message: "Meeting ID, longitude and latitude are required",
        });
      }
      const response = await meetingService.updateLocation(
        meetingId,
        longitude,
        latitude
      );
      return { meetingId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to update location",
        }
      );
    }
  }
);

// Get location suggestions for a meeting
export const getLocationSuggestions = createAsyncThunk(
  "meetings/getLocationSuggestions",
  async (
    { meetingId, type = "restaurant", radius = 1500 },
    { rejectWithValue }
  ) => {
    try {
      if (!meetingId) {
        return rejectWithValue({ message: "Meeting ID is required" });
      }
      const response = await meetingService.getLocationSuggestions(
        meetingId,
        type,
        radius
      );
      return { meetingId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to get location suggestions",
        }
      );
    }
  }
);

// Respond to a meeting invitation
export const respondToInvitation = createAsyncThunk(
  "meetings/respondToInvitation",
  async ({ meetingId, token, response }, { rejectWithValue }) => {
    try {
      if (!meetingId || !token || !response) {
        return rejectWithValue({
          message: "Meeting ID, token and response are required",
        });
      }
      const result = await meetingService.respondToInvitation(
        meetingId,
        token,
        response
      );
      return result;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to respond to invitation",
        }
      );
    }
  }
);

const meetingSlice = createSlice({
  name: "meetings",
  initialState: {
    meetings: [],
    currentMeeting: null,
    locationSuggestions: [],
    centralLocation: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    setCurrentMeeting: (state, action) => {
      state.currentMeeting = action.payload;
    },
    clearMeetingError: (state) => {
      state.error = null;
    },
    clearMeetingSuccess: (state) => {
      state.success = null;
    },
    resetMeetingState: (state) => {
      state.currentMeeting = null;
      state.locationSuggestions = [];
      state.centralLocation = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user meetings
      .addCase(getUserMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = Array.isArray(action.payload) ? action.payload : []; // Ensure array
      })
      .addCase(getUserMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch meetings";
      })

      // Get single meeting
      .addCase(getMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeeting = action.payload;
      })
      .addCase(getMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch meeting";
      })

      // Create meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array and single meeting cases
        const newMeeting = action.payload;
        if (newMeeting) {
          state.meetings.push(newMeeting);
        }
        state.success = "Meeting created successfully";
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create meeting";
      })

      // Update meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMeeting = action.payload;
        if (updatedMeeting) {
          // Handle both id and _id formats
          const meetingId = updatedMeeting.id || updatedMeeting._id;

          // Update in meetings array
          const index = state.meetings.findIndex(
            (m) => (m.id || m._id) === meetingId
          );
          if (index !== -1) {
            state.meetings[index] = updatedMeeting;
          }

          // Update current meeting if it's the same one
          if (
            state.currentMeeting &&
            (state.currentMeeting.id === meetingId ||
              state.currentMeeting._id === meetingId)
          ) {
            state.currentMeeting = updatedMeeting;
          }
        }
        state.success = "Meeting updated successfully";
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update meeting";
      })

      // Delete meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const meetingId = action.payload.meetingId;
        // Filter deleted meeting using both id formats
        state.meetings = state.meetings.filter(
          (m) => m.id !== meetingId && m._id !== meetingId
        );

        // Clear currentMeeting if it was deleted
        if (
          state.currentMeeting &&
          (state.currentMeeting.id === meetingId ||
            state.currentMeeting._id === meetingId)
        ) {
          state.currentMeeting = null;
        }
        state.success = "Meeting deleted successfully";
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete meeting";
      })

      // Add attendees
      .addCase(addAttendees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttendees.fulfilled, (state, action) => {
        state.loading = false;
        const meetingId = action.payload.meetingId;
        const meeting = action.payload.meeting;

        if (meeting) {
          // Update current meeting if it's the same one
          if (
            state.currentMeeting &&
            (state.currentMeeting.id === meetingId ||
              state.currentMeeting._id === meetingId)
          ) {
            state.currentMeeting = meeting;
          }

          // Update in meetings array
          const index = state.meetings.findIndex(
            (m) => m.id === meetingId || m._id === meetingId
          );
          if (index !== -1) {
            state.meetings[index] = meeting;
          }
        }
        state.success = "Attendees added successfully";
      })
      .addCase(addAttendees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add attendees";
      })

      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.centralLocation = action.payload.centralLocation;
        state.locationSuggestions = action.payload.suggestions || [];
        state.success = "Location updated successfully";
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update location";
      })

      // Get location suggestions
      .addCase(getLocationSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLocationSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.centralLocation = action.payload.centralLocation;
        state.locationSuggestions = action.payload.suggestions || [];
      })
      .addCase(getLocationSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to get location suggestions";
      })

      // Respond to invitation
      .addCase(respondToInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.success =
          action.payload.message || "Successfully responded to invitation";
      })
      .addCase(respondToInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to respond to invitation";
      });
  },
});

export const {
  setCurrentMeeting,
  clearMeetingError,
  clearMeetingSuccess,
  resetMeetingState,
} = meetingSlice.actions;

export default meetingSlice.reducer;
