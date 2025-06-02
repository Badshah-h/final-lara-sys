
import apiService from '../api/api';
import { PromptTemplate, PromptTemplateCategory } from '@/types/ai-configuration';
import { LaravelPaginatedResponse } from '../api/types';

/**
 * Service for managing prompt templates
 * Provides methods for CRUD operations on prompt templates and categories
 */

/**
 * Get all prompt templates
 * @returns Array of prompt templates
 */
export const getAllTemplates = async (): Promise<PromptTemplate[]> => {
  const response = await apiService.get<LaravelPaginatedResponse<PromptTemplate>>('/prompt-templates');
  return response.data; // Extract the actual array from the paginated response
};

/**
 * Get a specific prompt template by ID
 * @param id The template ID
 * @returns The prompt template
 */
export const getTemplateById = async (id: string): Promise<PromptTemplate> => {
  return apiService.get<PromptTemplate>(`/prompt-templates/${id}`);
};

/**
 * Get all prompt template categories
 * @returns Array of template categories
 */
export const getCategories = async (): Promise<PromptTemplateCategory[]> => {
  return apiService.get<PromptTemplateCategory[]>('/prompt-templates/categories/list');
};

/**
 * Create a new prompt template
 * @param data The template data
 * @returns The created template
 */
export const createTemplate = async (data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<PromptTemplate> => {
  return apiService.post<PromptTemplate>('/prompt-templates', data);
};

/**
 * Update an existing prompt template
 * @param id The template ID
 * @param data The updated template data
 * @returns The updated template
 */
export const updateTemplate = async (id: string, data: Partial<PromptTemplate>): Promise<PromptTemplate> => {
  return apiService.put<PromptTemplate>(`/prompt-templates/${id}`, data);
};

/**
 * Delete a prompt template
 * @param id The template ID
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  return apiService.delete(`/prompt-templates/${id}`);
};

/**
 * Increment the usage count for a template
 * @param id The template ID
 * @returns The updated template
 */
export const incrementUsage = async (id: string): Promise<PromptTemplate> => {
  return apiService.post<PromptTemplate>(`/prompt-templates/${id}/increment-usage`);
};
