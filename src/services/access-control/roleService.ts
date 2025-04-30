/**
 * Role API service
 */
import { BaseApiService } from "@/services/api/base";
import {
  ApiResponse,
  PaginatedResponse,
  RoleQueryParams,
  RoleCreateRequest,
  RoleUpdateRequest,
} from "@/services/api/types";
import { Role } from "@/types";
import { User } from "@/types";

export class RoleService extends BaseApiService {
  /**
   * Get all roles with optional filtering and pagination
   */
  async getRoles(params?: RoleQueryParams): Promise<PaginatedResponse<Role>> {
    return this.get<PaginatedResponse<Role>>("/roles", params);
  }

  /**
   * Get a single role by ID
   */
  async getRole(id: string): Promise<ApiResponse<Role>> {
    return this.get<ApiResponse<Role>>(`/roles/${id}`);
  }

  /**
   * Create a new role
   */
  async createRole(roleData: RoleCreateRequest): Promise<ApiResponse<Role>> {
    return this.post<ApiResponse<Role>>("/roles", roleData);
  }

  /**
   * Update an existing role
   */
  async updateRole(
    id: string,
    roleData: RoleUpdateRequest,
  ): Promise<ApiResponse<Role>> {
    return this.patch<ApiResponse<Role>>(`/roles/${id}`, roleData);
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/roles/${id}`);
  }

  /**
   * Get users assigned to a role
   */
  async getRoleUsers(id: string): Promise<ApiResponse<User[]>> {
    return this.get<ApiResponse<User[]>>(`/roles/${id}/users`);
  }
}

// Export a singleton instance
export const roleService = new RoleService();
