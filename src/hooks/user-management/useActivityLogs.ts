/**
 * Custom hook for activity log operations
 */
import { useState, useEffect, useCallback } from "react";
import { activityLogService } from "@/services/user-management/activityLogService";
import { useApi } from "@/hooks/useApi";
import { ActivityLogEntry } from "@/types";
import { ActivityLogQueryParams, PaginatedResponse } from "@/services/api/types";

export function useActivityLogs() {
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryParams, setQueryParams] = useState<ActivityLogQueryParams>({
    page: 1,
    per_page: 10,
  });

  // API hooks
  const {
    isLoading: isLoadingLogs,
    error: logsError,
    execute: fetchLogs,
  } = useApi<PaginatedResponse<ActivityLogEntry>, [ActivityLogQueryParams?]>(
    activityLogService.getActivityLogs.bind(activityLogService)
  );

  const { isLoading: isExporting, execute: exportLogs } = useApi<Blob, ["csv" | "json", ActivityLogQueryParams?]>(
    activityLogService.exportActivityLogs.bind(activityLogService)
  );

  // Fetch activity logs with current query parameters
  const fetchActivityData = useCallback(async () => {
    try {
      const response = await fetchLogs(queryParams);
      setActivityLogs(response.data);
      setTotalLogs(response.meta.total);
      setCurrentPage(response.meta.current_page);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  }, [fetchLogs, queryParams]);

  // Initial data fetch
  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // Update query parameters
  const updateQueryParams = useCallback(
    (newParams: Partial<ActivityLogQueryParams>) => {
      setQueryParams((prev) => ({
        ...prev,
        ...newParams,
        // Reset to page 1 when filters change
        page:
          newParams.page ||
          (newParams.user_id !== undefined ||
          newParams.action_type !== undefined ||
          newParams.date_from !== undefined ||
          newParams.date_to !== undefined
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

  // Handle export
  const handleExport = useCallback(
    async (format: "csv" | "json") => {
      try {
        const blob = await exportLogs(format, queryParams);

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity-logs.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error(`Error exporting logs as ${format}:`, error);
      }
    },
    [exportLogs, queryParams],
  );

  return {
    activityLogs,
    totalLogs,
    currentPage,
    isLoading: isLoadingLogs,
    isExporting,
    error: logsError,
    fetchLogs: fetchActivityData,
    exportLogs: handleExport,
    updateQueryParams,
    goToPage,
    queryParams,
  };
}
