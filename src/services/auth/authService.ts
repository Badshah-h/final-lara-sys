import axios from "axios";
import { API_BASE_URL } from "../api/config";

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

// Configure axios for Sanctum
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get CSRF cookie from Laravel Sanctum
   */
  private async getCsrfCookie(): Promise<void> {
    try {
      const baseUrl = this.baseUrl.endsWith("/api")
        ? this.baseUrl.substring(0, this.baseUrl.length - 4)
        : this.baseUrl;

      await axios.get(`${baseUrl}/sanctum/csrf-cookie`);
    } catch (error) {
      console.warn("Failed to get CSRF cookie:", error);
    }
  }

  /**
   * Login with email and password using Sanctum session authentication
   */
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    // Get CSRF cookie first
    await this.getCsrfCookie();

    const response = await axios.post(`${this.baseUrl}/login`, credentials);
    return response.data;
  }

  /**
   * Register a new user using Sanctum session authentication
   */
  async register(data: RegisterData): Promise<{ user: User }> {
    // Get CSRF cookie first
    await this.getCsrfCookie();

    const response = await axios.post(`${this.baseUrl}/register`, data);
    return response.data;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/logout`);
    } catch (error) {
      console.warn("Logout request failed:", error);
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${this.baseUrl}/user`);
    return response.data;
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    // Get CSRF cookie first
    await this.getCsrfCookie();

    await axios.post(`${this.baseUrl}/forgot-password`, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    // Get CSRF cookie first
    await this.getCsrfCookie();

    await axios.post(`${this.baseUrl}/reset-password`, data);
  }

  /**
   * Check if user is authenticated by trying to get current user
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
