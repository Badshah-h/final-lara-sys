import axios from "axios";
import { API_BASE_URL } from "../api/config";

// Configure axios for Sanctum
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Authentication service functions
export const authService = {
  // Get CSRF cookie
  getCsrfCookie: async () => {
    try {
      const baseUrl = API_BASE_URL.endsWith("/api")
        ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
        : API_BASE_URL;

      await axios.get(`${baseUrl}/sanctum/csrf-cookie`);
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
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
        remember
      });

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
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
        password_confirmation,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send password reset link
  sendPasswordResetLink: async (email: string) => {
    try {
      await authService.getCsrfCookie();

      const response = await axios.post(`${API_BASE_URL}/password/email`, {
        email,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (
    token: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => {
    try {
      await authService.getCsrfCookie();

      const response = await axios.post(`${API_BASE_URL}/password/reset`, {
        token,
        email,
        password,
        password_confirmation,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
