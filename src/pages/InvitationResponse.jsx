import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  respondToInvitation,
  getMeetingById,
} from "../redux/slices/meetingSlice";
import { format } from "date-fns";

const InvitationResponse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { meetingId, token: urlToken, response: urlResponse } = useParams();
  const [searchParams] = useSearchParams();

  const queryToken = searchParams.get("token");
  const queryResponse = searchParams.get("response");

  const token = urlToken || queryToken;
  const responseAction = urlResponse || queryResponse;

  const { loading, currentMeeting } = useSelector((state) => state.meetings);
  const { token: authToken } = useSelector((state) => state.auth);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [responseStatus, setResponseStatus] = useState({
    loading: false,
    success: null,
    error: null,
    processed: false,
  });

  // Fetch meeting data initially
  useEffect(() => {
    if (meetingId) {
      dispatch(getMeetingById(meetingId))
        .unwrap()
        .then((result) => setMeetingInfo(result.meeting))
        .catch((err) => console.error("Error fetching meeting:", err));
    }
  }, [dispatch, meetingId]);

  // Handle invitation response
  useEffect(() => {
    if (!responseStatus.processed && token && responseAction) {
      if (!["accept", "decline"].includes(responseAction)) {
        setResponseStatus({
          loading: false,
          success: null,
          error: "Invalid response action.",
          processed: true,
        });
        return;
      }

      setResponseStatus((prev) => ({ ...prev, loading: true }));

      dispatch(
        respondToInvitation({ meetingId, token, response: responseAction })
      )
        .unwrap()
        .then((result) => {
          setMeetingInfo(result.meeting);
          setResponseStatus({
            loading: false,
            success:
              result.message || `You have ${responseAction}ed the invitation.`,
            error: null,
            processed: true,
          });
          
          // If the response was accept, refetch meeting to ensure we have latest location data
          if (responseAction === "accept") {
            dispatch(getMeetingById({ meetingId, token: authToken }));
          }
        })
        .catch((err) => {
          setResponseStatus({
            loading: false,
            success: null,
            error: err.message || "Failed to process your response.",
            processed: true,
          });
        });
    }
  }, [dispatch, meetingId, token, authToken, responseAction, responseStatus.processed]);

  const handleManualResponse = (action) => {
    if (!token) {
      setResponseStatus({
        loading: false,
        success: null,
        error: "Missing token in URL.",
        processed: true,
      });
      return;
    }

    setResponseStatus({
      loading: true,
      success: null,
      error: null,
      processed: false,
    });

    dispatch(respondToInvitation({ meetingId, token, response: action }))
      .unwrap()
      .then((result) => {
        setMeetingInfo(result.meeting);
        setResponseStatus({
          loading: false,
          success: result.message || `You have ${action}ed the invitation.`,
          error: null,
          processed: true,
        });
        
        // If accepting, refetch the meeting to get updated data
        if (action === "accept") {
          dispatch(getMeetingById({ meetingId, token: authToken }));
        }
      })
      .catch((err) => {
        setResponseStatus({
          loading: false,
          success: null,
          error: err.message || "Failed to process your response.",
          processed: true,
        });
      });
  };

  // Handler to navigate to meeting details with proper location data
  const handleViewDetails = () => {
    // Ensure we navigate with the most up-to-date meeting data from Redux
    if (currentMeeting && currentMeeting._id === meetingId) {
      navigate(`/meetings/${meetingId}`);
    } else {
      // If we don't have the current meeting in Redux state, fetch it first
      dispatch(getMeetingById({ meetingId, token: authToken }))
        .unwrap()
        .then(() => {
          navigate(`/meetings/${meetingId}`);
        })
        .catch((err) => {
          console.error("Error fetching meeting before navigation:", err);
          // Still navigate even if there's an error
          navigate(`/meetings/${meetingId}`);
        });
    }
  };

  if (loading || responseStatus.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white shadow rounded-xl">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Processing your response...</h2>
        </div>
      </div>
    );
  }

  if (responseStatus.success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white shadow rounded-xl text-center">
          <div
            className={`text-5xl mb-4 ${
              responseAction === "accept" ? "text-green-500" : "text-red-500"
            }`}
          >
            {responseAction === "accept" ? "✓" : "×"}
          </div>
          <h1 className="text-xl font-bold mb-2">{responseStatus.success}</h1>
          {meetingInfo && (
            <div className="p-4 bg-gray-50 rounded mt-4">
              <h2 className="font-semibold text-lg">{meetingInfo.title}</h2>
              <p className="text-sm">
                Date: {format(new Date(meetingInfo.startTime), "MMMM d, yyyy")}
              </p>
              <p className="text-sm">
                Time: {format(new Date(meetingInfo.startTime), "h:mm a")} -{" "}
                {format(
                  new Date(
                    meetingInfo.endTime ||
                      new Date(meetingInfo.startTime).getTime() + 3600000
                  ),
                  "h:mm a"
                )}
              </p>
              {meetingInfo.location && meetingInfo.location.name && (
                <p className="text-sm font-medium mt-2">
                  Location: {meetingInfo.location.name}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-center gap-3 mt-6">
            {responseAction === "accept" && (
              <button
                onClick={handleViewDetails}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                View Details
              </button>
            )}
            <Link
              to="/dashboard"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow rounded-xl text-center">
        {responseStatus.error ? (
          <>
            <div className="text-4xl text-red-500 mb-4">×</div>
            <h1 className="text-xl font-bold mb-2">Error</h1>
            <p className="text-red-500 mb-4">{responseStatus.error}</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-4">Meeting Invitation</h1>
            {meetingInfo && (
              <div className="p-4 bg-gray-50 rounded mb-4">
                <h2 className="font-semibold text-lg">{meetingInfo.title}</h2>
                <p className="text-sm">
                  Date:{" "}
                  {format(new Date(meetingInfo.startTime), "MMMM d, yyyy")}
                  <br />
                  Time: {format(
                    new Date(meetingInfo.startTime),
                    "h:mm a"
                  )} -{" "}
                  {format(
                    new Date(
                      meetingInfo.endTime ||
                        new Date(meetingInfo.startTime).getTime() + 3600000
                    ),
                    "h:mm a"
                  )}
                </p>
                {meetingInfo.location && meetingInfo.location.name && (
                  <p className="text-sm mt-2">
                    Location: {meetingInfo.location.name}
                  </p>
                )}
              </div>
            )}
            <p className="mb-4">
              Would you like to accept or decline this invitation?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                onClick={() => handleManualResponse("accept")}
              >
                Accept
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                onClick={() => handleManualResponse("decline")}
              >
                Decline
              </button>
            </div>
          </>
        )}
        <div className="mt-6">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvitationResponse;
