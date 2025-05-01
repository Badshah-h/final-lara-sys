/**
 * Service for managing authentication tokens
 */

const TOKEN_KEY = "auth_token";
// Add a token expiration buffer (5 minutes) to refresh before actual expiration
const TOKEN_EXPIRY_BUFFER = 5 * 60; // 5 minutes in seconds

interface DecodedToken {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

class TokenService {
  private csrfToken: string | null = null;

  /**
   * Store the authentication token
   * @param token The JWT token to store
   * @param rememberMe Optional flag to indicate if the token should be stored for longer
   */
  setToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      // Store in localStorage for persistence across browser sessions
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(`${TOKEN_KEY}_created`, Date.now().toString());
      localStorage.setItem(`${TOKEN_KEY}_remember`, "true");

      // Clear any sessionStorage tokens to avoid confusion
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(`${TOKEN_KEY}_created`);
      sessionStorage.removeItem(`${TOKEN_KEY}_remember`);

      console.log(
        "Token stored in localStorage with remember me (persists after browser close)"
      );
    } else {
      // Store in sessionStorage for session-only persistence
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(`${TOKEN_KEY}_created`, Date.now().toString());
      sessionStorage.setItem(`${TOKEN_KEY}_remember`, "false");

      // Clear any localStorage tokens to avoid confusion
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(`${TOKEN_KEY}_created`);
      localStorage.removeItem(`${TOKEN_KEY}_remember`);

      console.log(
        "Token stored in sessionStorage (cleared when browser is closed)"
      );
    }

    // Log token expiration if available
    const decoded = this.decodeToken(token);
    if (decoded && decoded.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      console.log(`Token will expire at: ${expiryDate.toLocaleString()}`);
    }
  }

  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    // Check localStorage first (for remembered sessions)
    let token = localStorage.getItem(TOKEN_KEY);

    // If not in localStorage, check sessionStorage
    if (!token) {
      token = sessionStorage.getItem(TOKEN_KEY);
    }

    return token;
  }

  /**
   * Clear the stored authentication token and related data
   */
  clearToken(): void {
    // Clear from both storage types to ensure complete logout
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(`${TOKEN_KEY}_created`);
    localStorage.removeItem(`${TOKEN_KEY}_remember`);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(`${TOKEN_KEY}_created`);
    sessionStorage.removeItem(`${TOKEN_KEY}_remember`);

    console.log("Token cleared from both localStorage and sessionStorage");
  }

  /**
   * Decode a JWT token without verification
   * @param token The JWT token to decode
   * @returns The decoded token payload or null if invalid
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      // JWT tokens are in format: header.payload.signature
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      // Decode the payload (middle part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  /**
   * Check if the token is expired
   * @param bufferSeconds Optional seconds to subtract from expiration time (default: TOKEN_EXPIRY_BUFFER)
   * @returns true if token is expired or will expire soon, false otherwise
   */
  isTokenExpired(bufferSeconds: number = TOKEN_EXPIRY_BUFFER): boolean {
    const token = this.getToken();
    if (!token) {
      console.log("No token found when checking expiration");
      return true;
    }

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        console.warn("Could not decode token when checking expiration");
        return true;
      }

      // If token doesn't have an expiration claim
      if (!decoded.exp) {
        console.warn("Token has no expiration (exp) claim");

        // Check if token was created more than 24 hours ago as a fallback
        const createdTime =
          localStorage.getItem(`${TOKEN_KEY}_created`) ||
          sessionStorage.getItem(`${TOKEN_KEY}_created`);

        if (createdTime) {
          const tokenAge = (Date.now() - parseInt(createdTime)) / 1000; // in seconds
          const maxAge = 24 * 60 * 60; // 24 hours in seconds

          if (tokenAge > maxAge) {
            console.warn(
              `Token is older than 24 hours (${Math.round(
                tokenAge / 3600
              )} hours)`
            );
            return true;
          }
        } else {
          // If we can't determine when the token was created, consider it expired
          console.warn("Token has no expiration and no creation time");
          return true;
        }

        return false;
      }

      // exp is in seconds, Date.now() is in milliseconds
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;

      // Check if token is expired or will expire soon (within buffer)
      const isExpiring = timeUntilExpiry <= bufferSeconds;

      if (isExpiring) {
        if (timeUntilExpiry <= 0) {
          console.warn(`Token is expired (${-timeUntilExpiry} seconds ago)`);
        } else {
          console.warn(
            `Token will expire soon (in ${timeUntilExpiry} seconds)`
          );
        }
      }

      return isExpiring;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }

  /**
   * Validate the current token
   * @returns true if token exists and is not expired, false otherwise
   */
  validateToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    if (this.isTokenExpired()) {
      console.warn("Token validation failed: token is expired");
      return false;
    }

    // Check if token is properly formatted
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        console.warn("Token validation failed: could not decode token");
        return false;
      }

      // Additional validation could be added here

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  /**
   * Get the CSRF token
   */
  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Set the CSRF token
   */
  setCsrfToken(token: string): void {
    this.csrfToken = token;
  }

  /**
   * Initialize CSRF token by making a request to the sanctum/csrf-cookie endpoint
   * This is required for Laravel Sanctum CSRF protection
   */
  async initCsrfToken(): Promise<string | null> {
    try {
      // Check if we already have a CSRF token
      if (this.csrfToken) {
        return this.csrfToken;
      }

      console.log("Initializing CSRF token...");

      // Get the API URL from config
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000";
      console.log("Using API base URL:", apiBaseUrl);

      // For development environment, we might need to handle CSRF differently
      // If we're in a development environment and the API is on a different domain,
      // we'll use a simulated CSRF token for local development
      if (
        import.meta.env.DEV &&
        !apiBaseUrl.includes(window.location.hostname)
      ) {
        console.log(
          "Development environment detected with cross-domain API. Using simulated CSRF token."
        );
        const simulatedToken = "dev-csrf-token-" + Date.now();
        this.setCsrfToken(simulatedToken);
        return simulatedToken;
      }

      // Make a request to get the CSRF cookie with better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Make a request to get the CSRF cookie
        const response = await fetch(`${apiBaseUrl}/sanctum/csrf-cookie`, {
          method: "GET",
          credentials: "include", // Important: include cookies
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
          mode: "cors", // Explicitly set CORS mode
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(
            `CSRF token fetch failed with status: ${response.status} ${response.statusText}`
          );
          // Try to get response body for more details
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Could not read error response body");
          }
          throw new Error(
            `Failed to fetch CSRF token: ${response.status} ${response.statusText}`
          );
        }

        console.log("CSRF cookie response received, status:", response.status);

        // Extract the CSRF token from cookies
        const cookies = document.cookie.split(";");
        console.log("All cookies:", cookies);

        // Try both XSRF-TOKEN and laravel_session cookies
        const xsrfCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("XSRF-TOKEN=")
        );

        const laravelSessionCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("laravel_session=")
        );

        console.log("XSRF cookie found:", !!xsrfCookie);
        console.log("Laravel session cookie found:", !!laravelSessionCookie);

        if (xsrfCookie) {
          // The cookie value is URL encoded, so we need to decode it
          const token = decodeURIComponent(xsrfCookie.split("=")[1]);
          this.setCsrfToken(token);
          console.log("CSRF token set successfully");
          return token;
        } else {
          console.warn(
            "No XSRF-TOKEN cookie found after sanctum/csrf-cookie request"
          );

          // If we're in development and no XSRF token was found, but the request was successful,
          // we'll create a simulated token to allow development to continue
          if (import.meta.env.DEV) {
            console.log(
              "Development environment: Creating simulated CSRF token"
            );
            const simulatedToken = "dev-csrf-token-" + Date.now();
            this.setCsrfToken(simulatedToken);
            return simulatedToken;
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          console.error("CSRF token request timed out after 10 seconds");
          throw new Error("CSRF token request timed out");
        }
        throw fetchError;
      }

      return null;
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);

      // In development, provide a fallback token to allow work to continue
      if (import.meta.env.DEV) {
        console.warn(
          "Development environment: Using fallback CSRF token due to error"
        );
        const fallbackToken = "fallback-csrf-token-" + Date.now();
        this.setCsrfToken(fallbackToken);
        return fallbackToken;
      }

      return null;
    }
  }
}

export const tokenService = new TokenService();
