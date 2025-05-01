import { newAuthService } from "../auth/newAuthService";

/**
 * Request interceptor to add authentication token to requests
 */
export const authRequestInterceptor = (config: Record<string, any>) => {
  const headers = newAuthService.setAuthHeaders(config.headers || {});
  return { ...config, headers };
};

/**
 * Response interceptor to handle authentication errors
 */
export const authResponseInterceptor = (response: any) => {
  return response;
};

/**
 * Error interceptor to handle authentication errors
 */
export const authErrorInterceptor = async (error: any) => {
  // Handle 401 Unauthorized errors
  if (error.status === 401) {
    // Redirect to login page
    window.location.href = "/login";
  }
  throw error;
};
