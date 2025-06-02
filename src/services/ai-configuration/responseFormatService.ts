import { apiService } from '../api';
import { ResponseFormat } from '@/types/ai-configuration';
import { LaravelPaginatedResponse } from '../api/types';

// Get all response formats
export const getAllFormats = async (): Promise<ResponseFormat[]> => {
  try {
    const response = await apiService.get<any>('/response-formats');

    // Handle Laravel paginated response wrapped in ResponseService format
    // Response structure: { success: true, data: { current_page: 1, data: [...], ... } }
    if (response.data && Array.isArray(response.data)) {
      // Direct array response
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Paginated response
      return response.data.data;
    } else {
      // Fallback for unexpected structure
      console.warn('Unexpected response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching response formats:', error);
    return [];
  }
};

// Get default response format
export const getDefaultFormat = async (): Promise<ResponseFormat> => {
  return apiService.get<ResponseFormat>('/response-formats/default');
};

// Get format by ID
export const getFormatById = async (id: string): Promise<ResponseFormat> => {
  return apiService.get<ResponseFormat>(`/response-formats/${id}`);
};

// Create new response format
export const createFormat = async (data: Omit<ResponseFormat, 'id'>): Promise<ResponseFormat> => {
  return apiService.post<ResponseFormat>('/response-formats', data);
};

// Update response format
export const updateFormat = async (id: string, data: Partial<ResponseFormat>): Promise<ResponseFormat> => {
  return apiService.put<ResponseFormat>(`/response-formats/${id}`, data);
};

// Delete response format
export const deleteFormat = async (id: string): Promise<void> => {
  return apiService.delete(`/response-formats/${id}`);
};

// Set format as default
export const setDefaultFormat = async (id: string): Promise<ResponseFormat> => {
  return apiService.post<ResponseFormat>(`/response-formats/${id}/set-default`);
};

// Test format with a prompt
export const testFormat = async (formatId: string, prompt: string): Promise<{ formatted: string }> => {
  return apiService.post<{ formatted: string }>(`/response-formats/${formatId}/test`, { prompt });
};
