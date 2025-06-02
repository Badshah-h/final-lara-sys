import axios, { AxiosRequestConfig } from "axios";

// Fixed API endpoint for API tests
const BASE_URL = "/api";
const CSRF_URL = "/sanctum/csrf-cookie";

// Configure axios for Sanctum session authentication
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// API tester functions
export const apiTester = {
  get: async (endpoint: string, params?: any) => {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const config: AxiosRequestConfig = {
        params,
        withCredentials: true
      };

      const response = await axios.get(url, config);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        success: false,
      };
    }
  },

  post: async (endpoint: string, data?: any) => {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const config: AxiosRequestConfig = {
        withCredentials: true
      };

      const response = await axios.post(url, data, config);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        success: false,
      };
    }
  },

  put: async (endpoint: string, data?: any) => {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const config: AxiosRequestConfig = {
        withCredentials: true
      };

      const response = await axios.put(url, data, config);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        success: false,
      };
    }
  },

  delete: async (endpoint: string) => {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const config: AxiosRequestConfig = {
        withCredentials: true
      };

      const response = await axios.delete(url, config);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        success: true,
      };
    } catch (error: any) {
      return {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        success: false,
      };
    }
  },

  // Initialize CSRF token for Laravel Sanctum
  initCsrf: async () => {
    try {
      // Make a request to the Laravel CSRF endpoint
      await axios.get(CSRF_URL, { withCredentials: true });
      return true;
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
      return false;
    }
  },

  // Get status for test badge
  testStatus: (response: any) => {
    if (!response) return "error";
    if (response.success) return "success";
    if (response.status >= 400 && response.status < 500) return "client-error";
    if (response.status >= 500) return "server-error";
    return "unknown";
  },
};

export default apiTester;
