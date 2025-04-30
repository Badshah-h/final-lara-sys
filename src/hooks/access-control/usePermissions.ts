/**
 * Custom hook for permission management operations
 */
import { useState, useEffect, useCallback } from "react";
import { permissionService } from "@/services/access-control";
import { useApi } from "@/hooks/useApi";
import { PermissionCategory } from "@/types";
import { 
  ApiResponse, 
  PermissionUpdateRequest 
} from "@/services/api/types";

export function usePermissions() {
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);

  // API hooks
  const {
    isLoading: isLoadingPermissions,
    error: permissionsError,
    execute: fetchPermissions,
  } = useApi<ApiResponse<PermissionCategory[]>, []>(
    permissionService.getPermissions.bind(permissionService)
  );

  const {
    isLoading: isLoadingRolePermissions,
    error: rolePermissionsError,
    execute: fetchRolePermissions,
  } = useApi<ApiResponse<string[]>, [string]>(
    permissionService.getRolePermissions.bind(permissionService)
  );

  const { 
    isLoading: isUpdatingPermissions, 
    execute: updateRolePermissions 
  } = useApi<ApiResponse<string[]>, [string, PermissionUpdateRequest]>(
    async (roleId: string, data: PermissionUpdateRequest) => {
      return permissionService.updateRolePermissions(roleId, data.permissions);
    }
  );

  // Fetch all available permissions
  const fetchPermissionData = useCallback(async () => {
    try {
      const response = await fetchPermissions();
      if (response && response.data) {
        setPermissionCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  }, [fetchPermissions]);

  // Initial data fetch
  useEffect(() => {
    fetchPermissionData();
  }, [fetchPermissionData]);

  return {
    permissionCategories,
    isLoadingPermissions,
    permissionsError,
    fetchPermissions: fetchPermissionData,
    fetchRolePermissions,
    isLoadingRolePermissions,
    rolePermissionsError,
    updateRolePermissions,
    isUpdatingPermissions,
  };
}
