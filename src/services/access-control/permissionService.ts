import { BaseApiService } from "../api/base";
import { ApiResponse } from "../api/types";
import { PermissionCategory } from "@/types";

class PermissionService extends BaseApiService {
  /**
   * Get all available permissions grouped by category
   */
  async getPermissions(): Promise<ApiResponse<PermissionCategory[]>> {
    return this.get<ApiResponse<PermissionCategory[]>>("/permissions");
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>(`/roles/${roleId}/permissions`);
  }

  /**
   * Update permissions for a role
   */
  async updateRolePermissions(
    roleId: string,
    permissions: string[],
  ): Promise<ApiResponse<string[]>> {
    return this.put<ApiResponse<string[]>>(`/roles/${roleId}/permissions`, {
      permissions,
    });
  }

  /**
   * Get permissions for the current user
   */
  async getUserPermissions(): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>(`/user/permissions`);
  }

  /**
   * Check if the current user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const response = await this.getUserPermissions();
      return response.data.includes(permission);
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }
}

export const permissionService = new PermissionService();
