/**
 * Custom hook for role management operations
 */
import { useState, useEffect, useCallback } from "react";
import { roleService } from "@/services/access-control";
import { useApi } from "@/hooks/useApi";
import { Role } from "@/types";
import {
  ApiResponse,
  RoleCreateRequest,
  RoleQueryParams,
  RoleUpdateRequest,
  PaginatedResponse,
} from "@/services/api/types";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryParams, setQueryParams] = useState<RoleQueryParams>({
    page: 1,
    per_page: 10,
  });

  // API hooks
  const {
    isLoading: isLoadingRoles,
    error: rolesError,
    execute: fetchRoles,
  } = useApi<PaginatedResponse<Role>, [RoleQueryParams?]>(
    roleService.getRoles.bind(roleService)
  );

  const { isLoading: isCreatingRole, execute: createRole } = useApi<ApiResponse<Role>, [RoleCreateRequest]>(
    roleService.createRole.bind(roleService),
    {
      onSuccess: () => {
        // Refresh the role list after creating a role
        fetchRoleData();
      },
    },
  );

  const { isLoading: isUpdatingRole, execute: updateRole } = useApi<ApiResponse<Role>, [string, RoleUpdateRequest]>(
    async (id: string, data: RoleUpdateRequest) => {
      return roleService.updateRole(id, data);
    },
    {
      onSuccess: () => {
        // Refresh the role list after updating a role
        fetchRoleData();
      },
    },
  );

  const { isLoading: isDeletingRole, execute: deleteRole } = useApi<ApiResponse<null>, [string]>(
    roleService.deleteRole.bind(roleService),
    {
      onSuccess: () => {
        // Refresh the role list after deleting a role
        fetchRoleData();
      },
    },
  );

  // Fetch roles with current query parameters
  const fetchRoleData = useCallback(async () => {
    try {
      const response = await fetchRoles(queryParams);
      if (response && response.data) {
        setRoles(response.data);
        setTotalRoles(response.meta?.total || 0);
        setCurrentPage(response.meta?.current_page || 1);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, [fetchRoles, queryParams]);

  // Initial data fetch
  useEffect(() => {
    fetchRoleData();
  }, [fetchRoleData]);

  // Update query parameters
  const updateQueryParams = useCallback(
    (newParams: Partial<RoleQueryParams>) => {
      setQueryParams((prev) => ({
        ...prev,
        ...newParams,
        // Reset to page 1 when filters change
        page: newParams.page || (newParams.search !== undefined ? 1 : prev.page),
      }));
    },
    [],
  );

  // Handle pagination
  const goToPage = useCallback(
    (page: number) => {
      updateQueryParams({ page });
    },
    [updateQueryParams],
  );

  return {
    roles,
    totalRoles,
    currentPage,
    isLoading: isLoadingRoles,
    isCreatingRole,
    isUpdatingRole,
    isDeletingRole,
    error: rolesError,
    fetchRoles: fetchRoleData,
    createRole,
    updateRole,
    deleteRole,
    updateQueryParams,
    goToPage,
    queryParams,
  };
}
