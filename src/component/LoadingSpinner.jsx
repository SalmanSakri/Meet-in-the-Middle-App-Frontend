/**
 * @file LoadingSpinner.jsx
 * @description Reusable loading spinner component with customizable text
 */

import React from "react";
import PropTypes from "prop-types";

/**
 * Loading spinner component that shows an animated SVG and optional text
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.text="Loading..."] - Text to display next to spinner
 * @param {string} [props.size="md"] - Size of the spinner (sm, md, lg)
 * @param {string} [props.color="white"] - Color of the spinner (white or primary)
 * @returns {JSX.Element} Spinner component
 */
const LoadingSpinner = ({
  text = "Loading...",
  size = "md",
  color = "white",
}) => {
  // Size mappings for SVG dimensions
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Color mappings for SVG stroke
  const colorMap = {
    white: "text-white",
    primary: "text-[#B71B36]",
    gray: "text-gray-600",
  };

  return (
    <span className="flex items-center justify-center">
      <svg
        className={`animate-spin -ml-1 mr-3 ${sizeMap[size]} ${colorMap[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text}
    </span>
  );
};

LoadingSpinner.propTypes = {
  text: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.oneOf(["white", "primary", "gray"]),
};

export default LoadingSpinner;
