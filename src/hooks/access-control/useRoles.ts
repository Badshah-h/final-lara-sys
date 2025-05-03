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
  const [isInitialized, setIsInitialized] = useState(false);

  // API hooks
  const {
    isLoading: isLoadingRoles,
    error: rolesError,
    execute: fetchRoles,
  } = useApi<PaginatedResponse<Role>, [RoleQueryParams?]>(
    roleService.getRoles.bind(roleService),
    {
      onError: (error) => {
        console.error("Error fetching roles:", error);
        setRoles([]);
        setTotalRoles(0);
        setIsInitialized(true);
      },
    },
  );

  const { isLoading: isCreatingRole, execute: createRole } = useApi<
    ApiResponse<Role>,
    [RoleCreateRequest]
  >(roleService.createRole.bind(roleService), {
    onSuccess: () => {
      fetchRoleData();
    },
    onError: (error) => {
      console.error("Error creating role:", error);
      fetchRoleData();
    },
  });

  const { isLoading: isUpdatingRole, execute: updateRole } = useApi<
    ApiResponse<Role>,
    [string, RoleUpdateRequest]
  >(
    async (id: string, data: RoleUpdateRequest) => {
      return roleService.updateRole(id, data);
    },
    {
      onSuccess: () => {
        fetchRoleData();
      },
      onError: (error) => {
        console.error("Error updating role:", error);
        fetchRoleData();
      },
    },
  );

  const { isLoading: isDeletingRole, execute: deleteRole } = useApi<
    ApiResponse<null>,
    [string]
  >(roleService.deleteRole.bind(roleService), {
    onSuccess: () => {
      fetchRoleData();
    },
    onError: (error) => {
      console.error("Error deleting role:", error);
      fetchRoleData();
    },
  });

  // Fetch roles with current query parameters
  const fetchRoleData = useCallback(async () => {
    try {
      if (typeof fetchRoles !== "function") {
        setRoles([]);
        setTotalRoles(0);
        setCurrentPage(1);
        setIsInitialized(true);
        return;
      }
      const response = await fetchRoles(queryParams);
      if (response && response.data) {
        setRoles(response.data);
        setTotalRoles(response.meta?.total || 0);
        setCurrentPage(response.meta?.current_page || 1);
      } else if (Array.isArray(response)) {
        setRoles(response);
        setTotalRoles(response.length);
      } else {
        setRoles([]);
        setTotalRoles(0);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
      setTotalRoles(0);
      setIsInitialized(true);
    }
  }, [fetchRoles, queryParams]);

  // Initial data fetch - only when the component mounts and is not initialized
  useEffect(() => {
    if (!isInitialized) {
      const controller = new AbortController();
      fetchRoleData();
      return () => {
        controller.abort();
      };
    }
  }, [isInitialized]);

  // Update query parameters
  const updateQueryParams = useCallback(
    (newParams: Partial<RoleQueryParams>) => {
      setQueryParams((prev) => ({
        ...prev,
        ...newParams,
        // Reset to page 1 when filters change
        page:
          newParams.page || (newParams.search !== undefined ? 1 : prev.page),
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
    isLoading: isLoadingRoles && !isInitialized,
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
    isInitialized,
  };
}
