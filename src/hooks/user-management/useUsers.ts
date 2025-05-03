/**
 * Custom hook for user management operations
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { userService } from "@/services/user-management";
import { User } from "@/types";
import { UserQueryParams } from "@/services/api/types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    per_page: 10,
  });

  // Reference to the fetchUsers function to avoid circular dependencies
  const fetchUsersRef = useRef<(params?: UserQueryParams) => Promise<any>>();

  // Fetch users with current query parameters
  const fetchUsers = useCallback(
    async (params?: UserQueryParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const finalParams = params || queryParams;
        const response = await userService.getUsers(finalParams);

        if (response && response.data) {
          // Process user data to ensure consistent format
          const processedUsers = response.data.map(user => ({
            ...user,
            // Ensure last_active is properly handled
            last_active: user.last_active || null,
            // Ensure avatar is properly handled
            avatar: user.avatar || null,
          }));

          setUsers(processedUsers);
          setTotalUsers(response.meta?.total || processedUsers.length);
          setCurrentPage(response.meta?.current_page || 1);
        } else {
          setUsers([]);
          setTotalUsers(0);
        }

        return response;
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUsers([]);
        setTotalUsers(0);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [queryParams],
  );

  // Store the fetchUsers function in the ref to avoid circular dependencies
  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  }, [fetchUsers]);

  // Initial data fetch - only when the component mounts
  useEffect(() => {
    // Using a ref to ensure we only fetch once on mount
    const controller = new AbortController();
    fetchUsers();
    return () => {
      controller.abort();
    };
  }, [fetchUsers]);

  // Update query parameters and fetch users
  const updateQueryParams = useCallback(
    (newParams: Partial<UserQueryParams>) => {
      setQueryParams((prev) => {
        const shouldResetPage =
          newParams.search !== undefined ||
          newParams.role !== undefined ||
          newParams.status !== undefined;

        const updatedParams = {
          ...prev,
          ...newParams,
          page: shouldResetPage ? 1 : newParams.page || prev.page,
        };

        // Fetch users with the updated params
        setTimeout(() => {
          if (fetchUsersRef.current) {
            fetchUsersRef.current(updatedParams);
          }
        }, 0);

        return updatedParams;
      });
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
    isLoading,
    error,
    fetchUsers,
    updateQueryParams,
    goToPage,
    queryParams,
  };
}
