/**
 * Custom hook for user management operations
 */
import { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/user-management";
import { User } from "@/types";
import { UserQueryParams, PaginatedResponse } from "@/services/api/types";

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

  // Fetch users with current query parameters
  const fetchUsers = useCallback(
    async (params?: UserQueryParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const finalParams = params || queryParams;
        console.log("Fetching users with params:", finalParams);

        const response = await userService.getUsers(finalParams);
        console.log("Users response:", response);

        if (response && response.data) {
          setUsers(response.data);
          setTotalUsers(response.meta?.total || response.data.length);
          setCurrentPage(response.meta?.current_page || 1);
        } else if (Array.isArray(response)) {
          // Handle case where response is directly an array
          setUsers(response);
          setTotalUsers(response.length);
        } else {
          // Handle empty or invalid response
          setUsers([]);
          setTotalUsers(0);
        }

        return response;
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [queryParams],
  );

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update query parameters
  const updateQueryParams = useCallback(
    (newParams: Partial<UserQueryParams>) => {
      setQueryParams((prev) => {
        const shouldResetPage =
          newParams.search !== undefined ||
          newParams.role !== undefined ||
          newParams.status !== undefined;

        return {
          ...prev,
          ...newParams,
          page: shouldResetPage ? 1 : newParams.page || prev.page,
        };
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
