import api from "../api/axios";
import { API_BASE_URL } from "../api/config";
import { ApiResponse } from "../api/types";
import { PermissionCategory } from "@/types";

class PermissionService {
  /**
   * Get all available permissions grouped by category
   */
  async getPermissions(): Promise<ApiResponse<PermissionCategory[]>> {
    const response = await api.get(`${API_BASE_URL}/permissions`);
    return response.data;
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string): Promise<ApiResponse<string[]>> {
    const response = await api.get(
      `${API_BASE_URL}/roles/${roleId}/permissions`,
    );
    return response.data;
  }

  /**
   * Update permissions for a role
   */
  async updateRolePermissions(
    roleId: string,
    permissions: string[],
  ): Promise<ApiResponse<string[]>> {
    const response = await api.put(
      `${API_BASE_URL}/roles/${roleId}/permissions`,
      {
        permissions,
      },
    );
    return response.data;
  }

  /**
   * Get permissions for the current user
   */
  async getUserPermissions(): Promise<ApiResponse<string[]>> {
    const response = await api.get(`${API_BASE_URL}/user/permissions`);
    return response.data;
  }

  /**
   * Check if the current user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const response = await this.getUserPermissions();
      return response.data.includes(permission);
    } catch (error) {
      // Error checking permission
      return false;
    }
  }
}

export const permissionService = new PermissionService();
