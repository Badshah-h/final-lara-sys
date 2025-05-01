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
    const response = await api.get(`${API_BASE_URL}/roles`, { params });
    return response.data;
  }

  /**
   * Get a single role by ID
   */
  async getRole(id: string): Promise<ApiResponse<Role>> {
    const response = await api.get(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  }

  /**
   * Create a new role
   */
  async createRole(roleData: RoleCreateRequest): Promise<ApiResponse<Role>> {
    const response = await api.post(`${API_BASE_URL}/roles`, roleData);
    return response.data;
  }

  /**
   * Update an existing role
   */
  async updateRole(
    id: string,
    roleData: RoleUpdateRequest,
  ): Promise<ApiResponse<Role>> {
    const response = await api.patch(`${API_BASE_URL}/roles/${id}`, roleData);
    return response.data;
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  }

  /**
   * Get users assigned to a role
   */
  async getRoleUsers(id: string): Promise<ApiResponse<User[]>> {
    const response = await api.get(`${API_BASE_URL}/roles/${id}/users`);
    return response.data;
  }
}

// Export a singleton instance
export const roleService = new RoleService();
