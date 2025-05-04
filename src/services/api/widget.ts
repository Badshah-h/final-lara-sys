import { apiService } from './base';

/**
 * Widget configuration API service
 */

// Define response type for widget configuration API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Widget configuration type
export interface WidgetConfig {
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    position: string;
    size: string;
    darkMode: boolean;
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    autoOpenTrigger?: string;
    persistOpen: boolean;
    showNotifications: boolean;
    collectUserInfo: boolean;
    requiredFields: string[];
  };
  content: {
    welcomeMessage: string;
    botName: string;
    placeholderText: string;
    offlineMessage: string;
  };
  advanced: {
    customCSS: string;
    customJS: string;
    domain: string;
    apiKey: string;
    secureMode?: boolean;
    dataCollection?: boolean;
  };
}

/**
 * Get the widget configuration for the current user
 */
export const getWidgetConfig = async (): Promise<ApiResponse<WidgetConfig>> => {
  try {
    const response = await apiService.get<ApiResponse<WidgetConfig>>('/widget/config');
    return response;
  } catch (error) {
    console.error('Error fetching widget config:', error);
    throw error;
  }
};

/**
 * Save the widget configuration for the current user
 * @param config Widget configuration data
 */
export const saveWidgetConfig = async (config: WidgetConfig): Promise<ApiResponse<WidgetConfig>> => {
  try {
    const response = await apiService.post<ApiResponse<WidgetConfig>>('/widget/config', config);
    return response;
  } catch (error) {
    console.error('Error saving widget config:', error);
    throw error;
  }
};
