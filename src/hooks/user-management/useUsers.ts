/**
 * Custom hook for user management operations
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { UserService } from "@/services/user-management";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types";
import {
  UserCreateRequest as CreateUserRequest,
  UserUpdateRequest,
  UserQueryParams,
  PaginatedResponse,
} from "@/services/api/types";

// Create one instance and reuse
const userService = new UserService();

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    per_page: 10,
  });

  const fetchUsersRef = useRef<(params?: UserQueryParams) => Promise<any>>();

  // Fetch users API
  const {
    isLoading: isLoadingUsers,
    error: usersError,
    execute: fetchUsersApi,
  } = useApi<PaginatedResponse<User>, [UserQueryParams?]>(
    userService.getUsers.bind(userService)
  );

  // Data fetch logic (uses latest queryParams)
  const fetchUserData = useCallback(async () => {
    const response = await fetchUsersApi(queryParams);
    if (response?.data) {
      setUsers(response.data);
      setTotalUsers(response.meta?.total || 0);
      setCurrentPage(response.meta?.current_page || 1);
    }
  }, [fetchUsersApi, queryParams]);

  // Save ref to avoid circular call
  fetchUsersRef.current = fetchUserData;

  // Create user
  const { isLoading: isCreatingUser, execute: createUser } = useApi(
    userService.createUser.bind(userService),
    {
      onSuccess: () => {
        fetchUsersRef.current?.();
      },
    }
  );

  // Update user
  const { isLoading: isUpdatingUser, execute: updateUser } = useApi(
    async (id: string, data: UserUpdateRequest) =>
      await userService.updateUser(id, data),
    {
      onSuccess: () => {
        fetchUsersRef.current?.();
      },
    }
  );

  // Delete user
  const { isLoading: isDeletingUser, execute: deleteUser } = useApi(
    userService.deleteUser.bind(userService),
    {
      onSuccess: () => {
        fetchUsersRef.current?.();
      },
    }
  );

  // Initial fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Update filters & page
  const updateQueryParams = useCallback(
    (newParams: Partial<UserQueryParams>) => {
      setQueryParams((prev) => {
        const shouldResetPage =
          "search" in newParams || "role" in newParams || "status" in newParams;

        return {
          ...prev,
          ...newParams,
          page: shouldResetPage ? 1 : newParams.page ?? prev.page,
        };
      });
    },
    []
  );

  // Pagination
  const goToPage = useCallback(
    (page: number) => updateQueryParams({ page }),
    [updateQueryParams]
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
