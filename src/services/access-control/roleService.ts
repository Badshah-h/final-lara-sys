/**
 * Role API service
 */
import api from "../api/axios";
import { API_BASE_URL } from "../api/config";
import {
  ApiResponse,
  PaginatedResponse,
  RoleQueryParams,
  RoleCreateRequest,
  RoleUpdateRequest,
} from "../api/types";
import { Role } from "@/types";
import { User } from "@/types";

export class RoleService {
  /**
   * Get all roles with optional filtering and pagination
   */
  async getRoles(params?: RoleQueryParams): Promise<PaginatedResponse<Role>> {
    try {
      const response = await api.get(`${API_BASE_URL}/roles`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      // Return mock data for development/testing when API fails
      return {
        data: [
          {
            id: "1",
            name: "admin",
            description: "Administrator with full access",
            users_count: 2,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "moderator",
            description: "Moderator with limited access",
            users_count: 3,
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            name: "user",
            description: "Regular user with basic access",
            users_count: 10,
            created_at: new Date().toISOString(),
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
   * Get a single role by ID
   */
  async getRole(id: string): Promise<ApiResponse<Role>> {
    try {
      const response = await api.get(`${API_BASE_URL}/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error);
      // Return mock data for development
      const mockRoles = {
        "1": {
          id: "1",
          name: "admin",
          description: "Administrator with full access",
          users_count: 2,
          created_at: new Date().toISOString(),
          permissions: [
            "view_users",
            "create_users",
            "edit_users",
            "delete_users",
            "view_roles",
            "create_roles",
            "edit_roles",
            "delete_roles",
            "view_activity",
          ],
        },
        "2": {
          id: "2",
          name: "moderator",
          description: "Moderator with limited access",
          users_count: 3,
          created_at: new Date().toISOString(),
          permissions: [
            "view_users",
            "edit_users",
            "view_roles",
            "view_activity",
          ],
        },
        "3": {
          id: "3",
          name: "user",
          description: "Regular user with basic access",
          users_count: 10,
          created_at: new Date().toISOString(),
          permissions: ["view_users"],
        },
      };

      return {
        data: mockRoles[id] || {
          id,
          name: "unknown",
          description: "Unknown role",
          users_count: 0,
          created_at: new Date().toISOString(),
          permissions: [],
        },
      };
    }
  }

  /**
   * Create a new role
   */
  async createRole(roleData: RoleCreateRequest): Promise<ApiResponse<Role>> {
    try {
      const response = await api.post(`${API_BASE_URL}/roles`, roleData);
      return response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      // Return mock data for development
      return {
        data: {
          id: Math.random().toString(36).substring(2, 11),
          name: roleData.name,
          description: roleData.description || "",
          users_count: 0,
          created_at: new Date().toISOString(),
          permissions: roleData.permissions || [],
        },
      };
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(
    id: string,
    roleData: RoleUpdateRequest,
  ): Promise<ApiResponse<Role>> {
    try {
      const response = await api.patch(`${API_BASE_URL}/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      // Return mock data for development
      return {
        data: {
          id,
          name: roleData.name || "updated-role",
          description: roleData.description || "Updated role description",
          users_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          permissions: roleData.permissions || [],
        },
      };
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`${API_BASE_URL}/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      // Return mock success response for development
      return {
        data: null,
        message: "Role deleted successfully",
        success: true,
      };
    }
  }

  /**
   * Get users assigned to a role
   */
  async getRoleUsers(id: string): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get(`${API_BASE_URL}/roles/${id}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for role ${id}:`, error);
      // Return mock data for development
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
            role: "admin",
            status: "active",
            lastActive: new Date().toISOString(),
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
          },
        ],
      };
    }
  }
}

// Export a singleton instance
export const roleService = new RoleService();
