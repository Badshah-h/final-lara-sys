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

      // Make a request to get the CSRF cookie
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/sanctum/csrf-cookie`,
        {
          method: "GET",
          credentials: "include", // Important: include cookies
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch CSRF token: ${response.status} ${response.statusText}`,
        );
      }

      // Extract the CSRF token from cookies
      const cookies = document.cookie.split(";");
      const xsrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
      );

      if (xsrfCookie) {
        // The cookie value is URL encoded, so we need to decode it
        const token = decodeURIComponent(xsrfCookie.split("=")[1]);
        this.setCsrfToken(token);
        return token;
      }

      return null;
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
      return null;
    }
  }
}

export const tokenService = new TokenService();
