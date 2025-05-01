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
  UserQueryParams,
} from "../api/types";
import { User } from "@/types";

export class UserService {
  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await api.get(`${API_BASE_URL}/users`, { params });
    return response.data;
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    const response = await api.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    userData: UserUpdateRequest,
  ): Promise<ApiResponse<User>> {
    const response = await api.patch(`${API_BASE_URL}/users/${id}`, userData);
    return response.data;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
  }

  /**
   * Send password reset email to user
   */
  async sendPasswordReset(email: string): Promise<ApiResponse<null>> {
    const response = await api.post(`${API_BASE_URL}/users/password-reset`, {
      email,
    });
    return response.data;
  }

  /**
   * Change user status (activate/deactivate)
   */
  async changeUserStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse<User>> {
    const response = await api.patch(`${API_BASE_URL}/users/${id}/status`, {
      status,
    });
    return response.data;
  }
}

// Export a singleton instance
export const userService = new UserService();
