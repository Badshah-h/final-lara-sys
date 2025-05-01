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
    try {
      const response = await api.get(`${API_BASE_URL}/users`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      // Return mock data for development/testing when API fails
      return {
        data: [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            status: "active",
            lastActive: new Date().toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "user",
            status: "active",
            lastActive: new Date().toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
          },
          {
            id: "3",
            name: "Robert Johnson",
            email: "robert@example.com",
            role: "moderator",
            status: "inactive",
            lastActive: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
          },
        ],
        meta: {
          total: 3,
          current_page: params?.page || 1,
          per_page: params?.per_page || 10,
          last_page: 1,
        },
      };
    }
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
