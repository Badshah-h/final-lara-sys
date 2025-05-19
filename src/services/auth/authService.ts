import { BaseApiService } from "../api/base";
import { ApiResponse } from "../api/types";
import { TOKEN_REFRESH_THRESHOLD } from "../api/config";
import { tokenService } from "./tokenService";

// Token storage key - must match the one in tokenService
const TOKEN_KEY = "auth_token";

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  status: string;
  last_active_at?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  roles?: { id: string; name: string }[];
  permissions?: string[];
}

class AuthService extends BaseApiService {
  constructor() {
    super();
    // Add a request interceptor to include the CSRF token in the headers
    this.addRequestInterceptor((config) => {
      const csrfToken = tokenService.getCsrfToken();
      if (csrfToken) {
        return {
          ...config,
          headers: {
            ...config.headers,
            "X-XSRF-TOKEN": csrfToken,
          },
        };
      }
      return config;
    });

    // Add an error interceptor to handle authentication errors
    this.addErrorInterceptor(async (error) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.warn(
          "Authentication error detected, clearing token and redirecting to login",
        );
        // Clear the token
        tokenService.clearToken();

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      // Always rethrow the error to let the calling code handle it
      throw error;
    });
  }

  /**
   * Initialize the auth service by fetching the CSRF token
   */
  async init(): Promise<void> {
    try {
      // Always initialize CSRF token for Laravel
      console.log("Initializing auth service and CSRF token");

      // Check if we already have a CSRF token before trying to get a new one
      let token = tokenService.getCsrfToken();

      if (!token) {
        // Only try to get a new token if we don't already have one
        token = await tokenService.initCsrfToken();
      }

      if (token) {
        console.log("Auth service initialized with CSRF token");
      } else {
        console.warn("Auth service initialized without CSRF token");

        // Try one more time with a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        token = await tokenService.initCsrfToken();

        if (token) {
          console.log("Auth service initialized with CSRF token after retry");
        } else {
          console.warn("Auth service failed to get CSRF token after retry");
        }
      }
    } catch (error) {
      console.warn(
        "CSRF initialization failed, continuing without CSRF protection:",
        error,
      );
      // Continue without CSRF protection

      // In development, we can continue with a simulated token
      if (import.meta.env.DEV) {
        console.warn("Development environment: Creating emergency CSRF token");
        const emergencyToken = "emergency-csrf-token-" + Date.now();
        tokenService.setCsrfToken(emergencyToken);
      }
    }
  }

  /**
   * Login with email and password
   *
   * @param credentials Login credentials including email, password and remember option
   * @returns API response with token and user data
   */
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    // Ensure CSRF token is initialized before login
    await this.init();

    const response = await this.post<
      ApiResponse<{ token: string; user: User }>
    >("/login", credentials);

    // Store the token with remember me option
    if (response.data?.token) {
      tokenService.setToken(response.data.token, credentials.remember || false);
      this.setAuthToken(response.data.token);

      // Log token information in development mode
      if (import.meta.env.DEV) {
        const decoded = tokenService.decodeToken(response.data.token);
        if (decoded && decoded.exp) {
          const expiryDate = new Date(decoded.exp * 1000);
          console.log(`Token will expire at: ${expiryDate.toLocaleString()}`);
        }
      }
    }

    return response;
  }

  /**
   * Register a new user
   *
   * @param data Registration data
   * @returns API response with token and user data
   */
  async register(
    data: RegisterData,
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    // Ensure CSRF token is initialized before registration
    await this.init();

    const response = await this.post<
      ApiResponse<{ token: string; user: User }>
    >("/register", data);

    // Store the token
    if (response.data?.token) {
      tokenService.setToken(response.data.token, false); // Default to not remember for new registrations
      this.setAuthToken(response.data.token);

      // Log token information in development mode
      if (import.meta.env.DEV) {
        const decoded = tokenService.decodeToken(response.data.token);
        if (decoded && decoded.exp) {
          const expiryDate = new Date(decoded.exp * 1000);
          console.log(
            `Registration token will expire at: ${expiryDate.toLocaleString()}`,
          );
        }
      }
    }

    return response;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await this.post<ApiResponse<null>>("/logout");
      tokenService.clearToken();
      return response;
    } catch (error) {
      // Even if the API call fails, clear the token
      tokenService.clearToken();
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const token = tokenService.getToken();
    if (token) {
      this.setAuthToken(token);
    }
    return this.get<ApiResponse<User>>("/user");
  }

  /**
   * Send password reset link
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<null>> {
    // Ensure CSRF token is initialized before password reset
    await this.init();
    return this.post<ApiResponse<null>>("/password/email", data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<null>> {
    // Ensure CSRF token is initialized before password reset
    await this.init();
    return this.post<ApiResponse<null>>("/password/reset", data);
  }

  /**
   * Check if user is authenticated with valid token
   *
   * This method checks if a token exists in localStorage and validates it.
   * It performs client-side validation of the token's expiration.
   *
   * @returns true if a valid token exists, false otherwise
   */
  isAuthenticated(): boolean {
    // First check if token exists
    const token = tokenService.getToken();
    if (!token) {
      return false;
    }

    // Then validate the token (check expiration)
    return tokenService.validateToken();
  }

  /**
   * Get user information from token without making API call
   * Useful for quick access to user ID or other basic info
   *
   * @returns Basic user info from token or null if invalid
   */
  getUserFromToken(): { id: string; email?: string } | null {
    const token = tokenService.getToken();
    if (!token) return null;

    const decoded = tokenService.decodeToken(token);
    if (!decoded || !decoded.sub) return null;

    return {
      id: decoded.sub,
      email: decoded.email,
    };
  }

  /**
   * Refresh the authentication token
   * This should be called when the token is about to expire
   *
   * @returns A promise that resolves to the new token or null if refresh failed
   */
  async refreshToken(): Promise<string | null> {
    try {
      // Get the current token
      const currentToken = tokenService.getToken();
      if (!currentToken) {
        console.warn("No token to refresh");
        return null;
      }

      // Set the current token in the headers
      this.setAuthToken(currentToken);

      // Make a request to the refresh endpoint
      const response =
        await this.post<ApiResponse<{ token: string }>>("/auth/refresh");

      // If successful, update the token
      if (response.data?.token) {
        // Get the remember me state from the current token (if available)
        const rememberMe =
          localStorage.getItem(`${TOKEN_KEY}_remember`) === "true";

        // Store the new token
        tokenService.setToken(response.data.token, rememberMe);
        this.setAuthToken(response.data.token);

        console.log("Token refreshed successfully");
        return response.data.token;
      }

      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  /**
   * Check if token needs refresh and refresh it if necessary
   *
   * @returns true if token was refreshed or doesn't need refresh, false if refresh failed
   */
  async checkAndRefreshToken(): Promise<boolean> {
    // If no token exists, nothing to refresh
    if (!tokenService.getToken()) {
      return false;
    }

    // Track refresh attempts to prevent infinite loops
    const refreshAttempts = parseInt(
      sessionStorage.getItem("token_refresh_attempts") || "0",
    );
    if (refreshAttempts > 2) {
      // If we've tried to refresh more than twice in this session, clear the token
      // This prevents infinite refresh loops
      console.warn("Too many token refresh attempts, clearing token");
      tokenService.clearToken();
      sessionStorage.removeItem("token_refresh_attempts");
      return false;
    }

    // Check if token is about to expire (using the threshold from config)
    if (tokenService.isTokenExpired(TOKEN_REFRESH_THRESHOLD)) {
      // Only log once per minute
      const lastLogTime = parseInt(
        sessionStorage.getItem("last_token_refresh_log") || "0",
      );
      const currentTime = Date.now();
      if (currentTime - lastLogTime > 60000) {
        // 1 minute
        console.log("Token is about to expire, attempting to refresh");
        sessionStorage.setItem(
          "last_token_refresh_log",
          currentTime.toString(),
        );
      }

      // Increment refresh attempts
      sessionStorage.setItem(
        "token_refresh_attempts",
        (refreshAttempts + 1).toString(),
      );

      try {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Reset refresh attempts on success
          sessionStorage.removeItem("token_refresh_attempts");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
      }
    }

    // Token is still valid and not close to expiration
    return true;
  }

  /**
   * Request a password reset link (alias for forgotPassword)
   * @param email The user's email address
   */
  async requestPasswordReset(email: string) {
    return this.forgotPassword({ email })
  }
}

export const authService = new AuthService();

// Initialize the auth service with a timeout to prevent blocking
const initTimeout = setTimeout(() => {
  console.warn("Auth service initialization timed out after 5 seconds");
}, 5000);

authService
  .init()
  .then(() => {
    clearTimeout(initTimeout);
    console.log("Auth service initialized successfully");
  })
  .catch((error) => {
    clearTimeout(initTimeout);
    console.error("Failed to initialize auth service:", error);
  });
