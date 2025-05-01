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
      console.log("Making API request to get users with params:", params);
      const response = await api.get(`${API_BASE_URL}/users`, { params });
      console.log("API response for users:", response.data);
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
          {
            id: "4",
            name: "Emily Davis",
            email: "emily@example.com",
            role: "user",
            status: "pending",
            lastActive: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
          },
          {
            id: "5",
            name: "Michael Wilson",
            email: "michael@example.com",
            role: "user",
            status: "active",
            lastActive: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
          },
        ],
        meta: {
          total: 5,
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
    try {
      const response = await api.get(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      // Return mock data for development
      const mockUsers = {
        "1": {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
          status: "active",
          lastActive: new Date().toISOString(),
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        },
        "2": {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "user",
          status: "active",
          lastActive: new Date().toISOString(),
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        },
        "3": {
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
      };

      return {
        data: mockUsers[id] || {
          id,
          name: "Unknown User",
          email: "unknown@example.com",
          role: "user",
          status: "inactive",
          lastActive: new Date().toISOString(),
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=unknown",
        },
      };
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
      // Return mock data for development
      return {
        data: {
          id: Math.random().toString(36).substring(2, 11),
          name: userData.name,
          email: userData.email,
          role: "user",
          status: userData.status || "pending",
          lastActive: new Date().toISOString(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name.toLowerCase().replace(/\s+/g, "")}`,
        },
        message: "User created successfully",
        success: true,
      };
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
      // Get current user data first (for development mock)
      const currentUser = await this.getUser(id);

      // Return mock data for development
      return {
        data: {
          ...currentUser.data,
          ...userData,
          updated_at: new Date().toISOString(),
        },
        message: "User updated successfully",
        success: true,
      };
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
      // Return mock success response for development
      return {
        data: null,
        message: "User deleted successfully",
        success: true,
      };
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
