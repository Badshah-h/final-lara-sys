import api from "../api/axios";

// Authentication service functions
export const authService = {
  // Get CSRF cookie
  getCsrfCookie: async () => {
    try {
      const baseUrl = api.defaults.baseURL?.endsWith("/api")
        ? api.defaults.baseURL.substring(0, api.defaults.baseURL.length - 4)
        : api.defaults.baseURL;

      await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error("Failed to get CSRF cookie:", error);
      return false;
    }
  },

  // Login user
  login: async (email: string, password: string, remember: boolean = false) => {
    try {
      // Get CSRF cookie first
      await authService.getCsrfCookie();

      // Login request
      const response = await api.post("/login", { email, password, remember });

      // Store token
      const token = response.data.token || response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => {
    try {
      // Get CSRF cookie first
      await authService.getCsrfCookie();

      // Register request
      const response = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation,
      });

      // Store token
      const token = response.data.token || response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send password reset link
  forgotPassword: async (email: string) => {
    try {
      await authService.getCsrfCookie();
      const response = await api.post("/password/email", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (
    email: string,
    password: string,
    password_confirmation: string,
    token: string,
  ) => {
    try {
      await authService.getCsrfCookie();
      const response = await api.post("/password/reset", {
        email,
        password,
        password_confirmation,
        token,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Import axios for CSRF cookie request
import axios from "axios";
