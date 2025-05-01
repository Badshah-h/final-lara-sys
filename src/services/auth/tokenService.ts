/**
 * Service for managing authentication tokens
 */

const TOKEN_KEY = "auth_token";

class TokenService {
  private csrfToken: string | null = null;

  /**
   * Store the authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Clear the stored authentication token
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
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
          "Development environment detected with cross-domain API. Using simulated CSRF token.",
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
            `CSRF token fetch failed with status: ${response.status} ${response.statusText}`,
          );
          // Try to get response body for more details
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Could not read error response body");
          }
          throw new Error(
            `Failed to fetch CSRF token: ${response.status} ${response.statusText}`,
          );
        }

        console.log("CSRF cookie response received, status:", response.status);

        // Extract the CSRF token from cookies
        const cookies = document.cookie.split(";");
        console.log("All cookies:", cookies);

        // Try both XSRF-TOKEN and laravel_session cookies
        const xsrfCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("XSRF-TOKEN="),
        );

        const laravelSessionCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("laravel_session="),
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
            "No XSRF-TOKEN cookie found after sanctum/csrf-cookie request",
          );

          // If we're in development and no XSRF token was found, but the request was successful,
          // we'll create a simulated token to allow development to continue
          if (import.meta.env.DEV) {
            console.log(
              "Development environment: Creating simulated CSRF token",
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
          "Development environment: Using fallback CSRF token due to error",
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
