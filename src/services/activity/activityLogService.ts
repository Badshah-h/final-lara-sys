import { useApi } from "@/hooks/useApi";

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface ActivityLogResponse {
  meta: Record<string, unknown>;
  data: ActivityLog[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

class ActivityLogService {
  /**
   * Get paginated activity logs
   */
  static async getActivityLogs(
    params: Record<string, any> = {}
  ): Promise<ActivityLogResponse> {
    // Create a temporary API instance
    const api = {
      get: async (endpoint: string) => {
        const response = await fetch(`/api${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      }
    };

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/activity-logs${queryString ? `?${queryString}` : ''}`;
    return await api.get(endpoint);
  }

  /**
   * Get all available action types for filtering
   */
  static async getActionTypes(): Promise<string[]> {
    const api = {
      get: async (endpoint: string) => {
        const response = await fetch(`/api${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      }
    };

    return await api.get("/activity-logs/action-types");
  }

  /**
   * Export activity logs as CSV
   */
  static async exportActivityLogs(
    params: Record<string, any> = {}
  ): Promise<Blob> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/activity-logs/export${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'text/csv',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  /**
   * Get activity log by ID
   */
  static async getActivityLog(id: string): Promise<ActivityLog> {
    const api = {
      get: async (endpoint: string) => {
        const response = await fetch(`/api${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      }
    };

    return await api.get(`/activity-logs/${id}`);
  }
}

export default ActivityLogService;
