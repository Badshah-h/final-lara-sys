import axios from "axios";
import { API_BASE_URL } from "./config";

// Create a custom axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for cookies/authentication
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to the headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Don't clear token during login/register operations
      const isAuthOperation =
        error.config.url.includes("/login") ||
        error.config.url.includes("/register");

      if (!isAuthOperation) {
        // Clear token
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];

        // Redirect to login if not already there and not in auth pages
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname === "/forgot-password" ||
          window.location.pathname === "/reset-password";

        if (!isAuthPage) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
