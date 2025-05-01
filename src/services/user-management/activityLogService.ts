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
    try {
      console.log("Fetching activity logs with params:", params);
      const response = await api.get(`${API_BASE_URL}/activity-logs`, {
        params,
      });
      console.log("Activity logs API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      // Return mock data for development/testing when API fails
      const mockData = {
        data: [
          {
            id: "1",
            user_id: "1",
            user_name: "John Doe",
            user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
            action: "login",
            description: "Logged in to the system",
            created_at: new Date().toISOString(),
            ip_address: "192.168.1.1",
          },
          {
            id: "2",
            user_id: "1",
            user_name: "John Doe",
            user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
            action: "update",
            description: "Updated user profile",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            ip_address: "192.168.1.1",
          },
          {
            id: "3",
            user_id: "2",
            user_name: "Jane Smith",
            user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
            action: "create",
            description: "Created a new role",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            ip_address: "192.168.1.2",
          },
          {
            id: "4",
            user_id: "3",
            user_name: "Robert Johnson",
            user_avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
            action: "delete",
            description: "Deleted a user",
            created_at: new Date(Date.now() - 10800000).toISOString(),
            ip_address: "192.168.1.3",
          },
          {
            id: "5",
            user_id: "2",
            user_name: "Jane Smith",
            user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
            action: "update",
            description: "Updated permissions for role 'Admin'",
            created_at: new Date(Date.now() - 14400000).toISOString(),
            ip_address: "192.168.1.2",
          },
        ],
        meta: {
          total: 5,
          current_page: params?.page || 1,
          per_page: params?.per_page || 10,
          last_page: 1,
        },
      };
      console.log("Returning mock activity logs:", mockData);
      return mockData;
    }
  }

  /**
   * Get a single activity log entry by ID
   */
  async getActivityLog(id: string): Promise<ApiResponse<ActivityLogEntry>> {
    try {
      const response = await api.get(`${API_BASE_URL}/activity-logs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity log ${id}:`, error);
      // Return mock data for development
      return {
        data: {
          id,
          user_id: "1",
          user_name: "John Doe",
          user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          action: "login",
          description: "Logged in to the system",
          created_at: new Date().toISOString(),
          ip_address: "192.168.1.1",
        },
      };
    }
  }

  /**
   * Get activity logs for a specific user
   */
  async getUserActivityLogs(
    userId: string,
    params?: ActivityLogQueryParams,
  ): Promise<PaginatedResponse<ActivityLogEntry>> {
    try {
      const response = await api.get(
        `${API_BASE_URL}/users/${userId}/activity-logs`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity logs for user ${userId}:`, error);
      // Return mock data for development
      return {
        data: [
          {
            id: "1",
            user_id: userId,
            user_name: "User",
            action: "login",
            description: "Logged in to the system",
            created_at: new Date().toISOString(),
            ip_address: "192.168.1.1",
          },
          {
            id: "2",
            user_id: userId,
            user_name: "User",
            action: "update",
            description: "Updated user profile",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            ip_address: "192.168.1.1",
          },
        ],
        meta: {
          total: 2,
          current_page: params?.page || 1,
          per_page: params?.per_page || 10,
          last_page: 1,
        },
      };
    }
  }

  /**
   * Export activity logs as CSV or JSON
   */
  async exportActivityLogs(
    format: "csv" | "json",
    params?: ActivityLogQueryParams,
  ): Promise<Blob> {
    try {
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
        throw new Error(
          errorData.message || `Export failed: ${response.status}`,
        );
      }

      return response.blob();
    } catch (error) {
      console.error(`Error exporting activity logs as ${format}:`, error);

      // For development, create a mock CSV or JSON blob
      const mockData =
        format === "csv"
          ? "id,user_id,user_name,action,description,created_at\n1,1,John Doe,login,Logged in to the system,2023-01-01T12:00:00Z"
          : JSON.stringify({
              data: [
                {
                  id: "1",
                  user_id: "1",
                  user_name: "John Doe",
                  action: "login",
                  description: "Logged in to the system",
                  created_at: new Date().toISOString(),
                },
              ],
            });

      const blob = new Blob([mockData], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      return blob;
    }
  }
}

// Export a singleton instance
export const activityLogService = new ActivityLogService();
