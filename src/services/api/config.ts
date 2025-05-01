/**
 * API configuration
 */

// Determine the environment and set the appropriate API URL
const getApiBaseUrl = (): string => {
  const env = import.meta.env.MODE || "development";
  const apiUrl = import.meta.env.VITE_API_URL;

  // Log the environment and API URL for debugging
  console.log(
    `API Config - Environment: ${env}, API URL from env: ${apiUrl || "not set"}`
  );

  // If API URL is explicitly set, use it
  if (apiUrl) {
    const formattedUrl = apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
    console.log(`Using configured API URL: ${formattedUrl}`);
    return formattedUrl;
  }

  // Otherwise, use environment-specific defaults
  let defaultUrl;
  switch (env) {
    case "production":
      defaultUrl = "https://api.yourdomain.com/api";
      break;
    case "staging":
      defaultUrl = "https://staging-api.yourdomain.com/api";
      break;
    case "test":
      defaultUrl = "http://localhost:8000/api";
      break;
    case "development":
    default:
      defaultUrl = "http://localhost:8000/api";
      break;
  }

  console.log(`Using default API URL for ${env} environment: ${defaultUrl}`);
  return defaultUrl;
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
export const CSRF_ENABLED = true; // Always enable CSRF for Laravel
export const CSRF_COOKIE_NAME = "XSRF-TOKEN";
export const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

// Token settings
export const TOKEN_REFRESH_ENDPOINT = "/auth/refresh"; // Endpoint to refresh tokens
export const TOKEN_REFRESH_THRESHOLD = 5 * 60; // Refresh token if less than 5 minutes left (in seconds)
export const TOKEN_AUTO_REFRESH = true; // Enable automatic token refresh
