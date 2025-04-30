/**
 * Custom hook for user management operations
 */
import { useState, useEffect, useCallback } from "react";
import { userService } from "../../components/admin/user-management/services";
import { useApi } from "@/hooks/useApi";
import { User } from "../../types";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
} from "../../components/admin/user-management/services/index";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    per_page: 10,
  });

  // API hooks
  const {
    isLoading: isLoadingUsers,
    error: usersError,
    execute: fetchUsers,
  } = useApi(userService.getUsers.bind(userService));

  const { isLoading: isCreatingUser, execute: createUser } = useApi(
    userService.createUser.bind(userService),
    {
      onSuccess: () => {
        // Refresh the user list after creating a user
        fetchUserData();
      },
    },
  );

  const { isLoading: isUpdatingUser, execute: updateUser } = useApi(
    async (id: string, data: UpdateUserRequest) => {
      return userService.updateUser(id, data);
    },
    {
      onSuccess: () => {
        // Refresh the user list after updating a user
        fetchUserData();
      },
    },
  );

  const { isLoading: isDeletingUser, execute: deleteUser } = useApi(
    userService.deleteUser.bind(userService),
    {
      onSuccess: () => {
        // Refresh the user list after deleting a user
        fetchUserData();
      },
    },
  );

  // Fetch users with current query parameters
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetchUsers(queryParams);
      if (response && response.data) {
        setUsers(response.data);
        setTotalUsers(response.meta?.total || 0);
        setCurrentPage(response.meta?.current_page || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [fetchUsers, queryParams]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Update query parameters
  const updateQueryParams = useCallback(
    (newParams: Partial<UserQueryParams>) => {
      setQueryParams((prev) => ({
        ...prev,
        ...newParams,
        // Reset to page 1 when filters change
        page:
          newParams.page ||
          (newParams.search !== undefined ||
          newParams.role !== undefined ||
          newParams.status !== undefined
            ? 1
            : prev.page),
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
    users,
    totalUsers,
    currentPage,
    isLoading: isLoadingUsers,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,
    error: usersError,
    fetchUsers: fetchUserData,
    createUser,
    updateUser,
    deleteUser,
    updateQueryParams,
    goToPage,
    queryParams,
  };
}
