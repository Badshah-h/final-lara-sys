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
      throw new Error("Failed to fetch roles");
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
      throw new Error("Failed to fetch role");
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
      throw new Error("Failed to create role");
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
      throw new Error("Failed to update role");
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
      throw new Error("Failed to delete role");
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
      throw new Error("Failed to fetch users for role");
    }
  }
}

// Export a singleton instance
export const roleService = new RoleService();
