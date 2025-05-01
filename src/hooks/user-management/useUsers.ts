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
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [isManualFetch, setIsManualFetch] = useState(false);

  const fetchUsersRef = useRef<(params?: UserQueryParams) => Promise<any>>();
  const isMountedRef = useRef<boolean>(true);

  // Fetch users API
  const {
    isLoading: isLoadingUsers,
    error: usersError,
    execute: fetchUsersApi,
    reset: resetUsersApi,
  } = useApi<PaginatedResponse<User>, [UserQueryParams?]>(
    userService.getUsers.bind(userService),
  );

  // Data fetch logic (uses latest queryParams)
  const fetchUserData = useCallback(async () => {
    // Prevent fetching if component is unmounted
    if (!isMountedRef.current) return;

    // Prevent duplicate API calls when filters change rapidly
    if (isLoadingUsers && !isManualFetch) return;

    try {
      const response = await fetchUsersApi(queryParams);
      if (response?.data && isMountedRef.current) {
        setUsers(response.data);
        setTotalUsers(response.meta?.total || 0);
        setCurrentPage(response.meta?.current_page || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Set empty users array to prevent UI issues
      if (isMountedRef.current) {
        setUsers([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsInitialFetch(false);
        setIsManualFetch(false);
      }
    }
  }, [fetchUsersApi, queryParams, isLoadingUsers, isManualFetch]);

  // Save ref to avoid circular call
  fetchUsersRef.current = fetchUserData;

  // Create user
  const { isLoading: isCreatingUser, execute: createUser } = useApi(
    userService.createUser.bind(userService),
    {
      onSuccess: () => {
        if (isMountedRef.current) {
          setIsManualFetch(true);
          fetchUsersRef.current?.();
        }
      },
    },
  );

  // Update user
  const { isLoading: isUpdatingUser, execute: updateUser } = useApi(
    async (id: string, data: UserUpdateRequest) =>
      await userService.updateUser(id, data),
    {
      onSuccess: () => {
        if (isMountedRef.current) {
          setIsManualFetch(true);
          fetchUsersRef.current?.();
        }
      },
    },
  );

  // Delete user
  const { isLoading: isDeletingUser, execute: deleteUser } = useApi(
    userService.deleteUser.bind(userService),
    {
      onSuccess: () => {
        if (isMountedRef.current) {
          setIsManualFetch(true);
          fetchUsersRef.current?.();
        }
      },
    },
  );

  // Initial fetch
  useEffect(() => {
    if (isInitialFetch) {
      fetchUserData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchUserData, isInitialFetch]);

  // Update filters & page
  const updateQueryParams = useCallback(
    (newParams: Partial<UserQueryParams>) => {
      // Skip update if component is unmounted
      if (!isMountedRef.current) return;

      setQueryParams((prev) => {
        const shouldResetPage =
          "search" in newParams || "role" in newParams || "status" in newParams;

        return {
          ...prev,
          ...newParams,
          page: shouldResetPage ? 1 : (newParams.page ?? prev.page),
        };
      });
    },
    [],
  );

  // Pagination
  const goToPage = useCallback(
    (page: number) => updateQueryParams({ page }),
    [updateQueryParams],
  );

  // Manual refresh function
  const refreshUsers = useCallback(() => {
    if (isMountedRef.current) {
      setIsManualFetch(true);
      resetUsersApi();
      fetchUserData();
    }
  }, [fetchUserData, resetUsersApi]);

  return {
    users,
    totalUsers,
    currentPage,
    isLoading: isLoadingUsers,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,
    error: usersError,
    fetchUsers: refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    updateQueryParams,
    goToPage,
    queryParams,
  };
}
