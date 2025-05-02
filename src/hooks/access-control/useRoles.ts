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

// Mock data for fallback
const mockRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
    permissions: [],
    userCount: 2,
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manage content and users",
    permissions: [],
    userCount: 3,
  },
  {
    id: "editor",
    name: "Editor",
    description: "Edit and publish content",
    permissions: [],
    userCount: 5,
  },
  {
    id: "user",
    name: "User",
    description: "Basic access",
    permissions: [],
    userCount: 12,
  },
];

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
        // Use mock data on error
        setRoles(mockRoles);
        setTotalRoles(mockRoles.length);
        setIsInitialized(true);
      },
    },
  );

  const { isLoading: isCreatingRole, execute: createRole } = useApi<
    ApiResponse<Role>,
    [RoleCreateRequest]
  >(roleService.createRole.bind(roleService), {
    onSuccess: () => {
      // Refresh the role list after creating a role
      fetchRoleData();
    },
    onError: (error) => {
      console.error("Error creating role:", error);
      // Refresh anyway to ensure UI is updated
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
        // Refresh the role list after updating a role
        fetchRoleData();
      },
      onError: (error) => {
        console.error("Error updating role:", error);
        // Refresh anyway to ensure UI is updated
        fetchRoleData();
      },
    },
  );

  const { isLoading: isDeletingRole, execute: deleteRole } = useApi<
    ApiResponse<null>,
    [string]
  >(roleService.deleteRole.bind(roleService), {
    onSuccess: () => {
      // Refresh the role list after deleting a role
      fetchRoleData();
    },
    onError: (error) => {
      console.error("Error deleting role:", error);
      // Refresh anyway to ensure UI is updated
      fetchRoleData();
    },
  });

  // Fetch roles with current query parameters
  const fetchRoleData = useCallback(async () => {
    try {
      // For demo purposes, if no API is available, use mock data
      if (typeof fetchRoles !== "function") {
        console.warn("fetchRoles is not a function, using mock data");
        setRoles(mockRoles);
        setTotalRoles(mockRoles.length);
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
        // Handle case where response is directly an array
        setRoles(response);
        setTotalRoles(response.length);
      } else {
        // Handle case where response exists but data is missing
        console.warn("Received response without data", response);
        setRoles(mockRoles);
        setTotalRoles(mockRoles.length);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error fetching roles:", error);
      // Use mock data as fallback
      setRoles(mockRoles);
      setTotalRoles(mockRoles.length);
      setIsInitialized(true);
    }
  }, [fetchRoles, queryParams]);

  // Initial data fetch
  useEffect(() => {
    if (!isInitialized) {
      fetchRoleData();
    }
  }, [fetchRoleData, isInitialized]);

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
