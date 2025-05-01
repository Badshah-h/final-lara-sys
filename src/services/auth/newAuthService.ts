/**
 * New Authentication Service
 * This service handles all authentication-related operations
 */

import { BaseApiService } from "../api/base";

// Types for authentication
export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
}

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

export interface AuthResponse {
  user: User;
  token: string;
}

class NewAuthService extends BaseApiService {
  private token: string | null = null;

  constructor() {
    super();
    // Initialize token from localStorage or sessionStorage
    this.token = this.getStoredToken();
  }

  /**
   * Get token from storage
   */
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  /**
   * Store token in storage
   */
  private storeToken(token: string, remember: boolean = false): void {
    if (remember) {
      localStorage.setItem("auth_token", token);
      sessionStorage.removeItem("auth_token");
    } else {
      sessionStorage.setItem("auth_token", token);
      localStorage.removeItem("auth_token");
    }
    this.token = token;
  }

  /**
   * Clear token from storage
   */
  private clearToken(): void {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    this.token = null;
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>("/auth/login", credentials);
    if (response.data?.token) {
      this.storeToken(response.data.token, credentials.remember);
    }
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>("/auth/register", data);
    if (response.data?.token) {
      this.storeToken(response.data.token);
    }
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearToken();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<User>("/auth/user");
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Set authentication headers for requests
   */
  setAuthHeaders(headers: Record<string, string>): Record<string, string> {
    if (this.token) {
      return {
        ...headers,
        Authorization: `Bearer ${this.token}`,
      };
    }
    return headers;
  }
}

export const newAuthService = new NewAuthService();
