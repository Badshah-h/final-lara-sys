/**
 * Activity Log API service
 */
import api from "../api/axios";
import { API_BASE_URL } from "../api/config";
import {
  ActivityLogQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "../api/types";
import { ActivityLogEntry } from "@/types";

export class ActivityLogService {
  /**
   * Get activity logs with optional filtering and pagination
   */
  async getActivityLogs(
    params?: ActivityLogQueryParams,
  ): Promise<PaginatedResponse<ActivityLogEntry>> {
    const response = await api.get(`${API_BASE_URL}/activity-logs`, { params });
    return response.data;
  }

  /**
   * Get a single activity log entry by ID
   */
  async getActivityLog(id: string): Promise<ApiResponse<ActivityLogEntry>> {
    const response = await api.get(`${API_BASE_URL}/activity-logs/${id}`);
    return response.data;
  }

  /**
   * Get activity logs for a specific user
   */
  async getUserActivityLogs(
    userId: string,
    params?: ActivityLogQueryParams,
  ): Promise<PaginatedResponse<ActivityLogEntry>> {
    const response = await api.get(
      `${API_BASE_URL}/users/${userId}/activity-logs`,
      { params },
    );
    return response.data;
  }

  /**
   * Export activity logs as CSV or JSON
   */
  async exportActivityLogs(
    format: "csv" | "json",
    params?: ActivityLogQueryParams,
  ): Promise<Blob> {
    const url = new URL(`${API_BASE_URL}/activity-logs/export`);

    // Add format and other params to URL
    url.searchParams.append("format", format);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Get token for authorization header
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Export failed: ${response.status}`);
    }

    return response.blob();
  }
}

// Export a singleton instance
export const activityLogService = new ActivityLogService();
