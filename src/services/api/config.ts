/**
 * API configuration
 */

// Determine the environment and set the appropriate API URL
const getApiBaseUrl = (): string => {
  const env = import.meta.env.MODE || "development";
  const apiUrl = import.meta.env.VITE_API_URL;

  // If API URL is explicitly set, use it
  if (apiUrl) {
    return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
  }

  // Otherwise, use environment-specific defaults
  switch (env) {
    case "production":
      return "https://api.yourdomain.com/api";
    case "staging":
      return "https://staging-api.yourdomain.com/api";
    case "test":
      return "http://localhost:8000/api";
    case "development":
    default:
      return "http://localhost:8000/api";
  }
};

// Base API URL - points to Laravel backend API
export const API_BASE_URL = getApiBaseUrl();

// Default request headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  // Include credentials in cross-origin requests
  credentials: "include",
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;

// Enable/disable request caching
export const ENABLE_CACHING = true;

// Default cache time in milliseconds (5 minutes)
export const DEFAULT_CACHE_TIME = 300000;

// Maximum number of retries for failed requests
export const MAX_RETRIES = 3;

// Retry delay in milliseconds (exponential backoff will be applied)
export const RETRY_DELAY = 1000;

// CSRF token settings
export const CSRF_ENABLED = import.meta.env.VITE_USE_SANCTUM === "true";
export const CSRF_COOKIE_NAME = "XSRF-TOKEN";
export const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
