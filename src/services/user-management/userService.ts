/**
 * User API service
 */
import api from "../api/axios";
import { API_BASE_URL } from "../api/config";
import {
  ApiResponse,
  UserCreateRequest,
  PaginatedResponse,
  UserUpdateRequest,
  UserPasswordUpdateRequest,
  UserQueryParams,
} from "../api/types";
import { User } from "@/types";

export class UserService {
  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get(`${API_BASE_URL}/users`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    try {
      const response = await api.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    userData: UserUpdateRequest,
  ): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch(`${API_BASE_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw new Error("Failed to delete user");
    }
  }

  /**
   * Update user password
   */
  async updatePassword(
    id: string,
    passwordData: UserPasswordUpdateRequest,
  ): Promise<ApiResponse<User>> {
    try {
      const response = await api.post(`${API_BASE_URL}/users/${id}/password`, passwordData);
      return response.data;
    } catch (error) {
      console.error(`Error updating password for user ${id}:`, error);
      throw new Error("Failed to update password");
    }
  }

  /**
   * Send password reset email to user
   */
  async sendPasswordResetEmail(email: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`${API_BASE_URL}/users/password-reset`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error sending password reset email to ${email}:`, error);
      throw new Error("Failed to send password reset email");
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
