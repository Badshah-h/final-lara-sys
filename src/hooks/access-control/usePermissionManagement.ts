import { useState, useCallback } from 'react';
import { PermissionCategory } from '@/types';
import { useApi } from '@/hooks/useApi';

/**
 * Hook for managing permissions
 * Provides functions for fetching permissions and permission categories
 */
export function usePermissionManagement() {
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const api = useApi();

  /**
   * Fetch all permission categories
   */
  const fetchPermissionCategories = useCallback(async () => {
    setIsLoadingPermissions(true);
    setPermissionsError(null);

    try {
      const response = await api.get('/permissions/categories');

      // Handle direct array response or wrapped response
      if (Array.isArray(response)) {
        setPermissionCategories(response);
      } else if (response.success && response.data) {
        setPermissionCategories(response.data);
      } else if (response.data && Array.isArray(response.data)) {
        setPermissionCategories(response.data);
      } else {
        setPermissionCategories(response || []);
      }
    } catch (error: any) {
      setPermissionsError(error?.response?.data?.message || 'An error occurred while fetching permissions');
      console.error('Error fetching permissions:', error);
      setPermissionCategories([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []); // Remove api dependency to prevent infinite loop

  return {
    permissionCategories,
    isLoadingPermissions,
    permissionsError,
    fetchPermissionCategories
  };
}
