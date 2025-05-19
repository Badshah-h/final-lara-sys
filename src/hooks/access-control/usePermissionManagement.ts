import { useState, useCallback, useEffect } from 'react';
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
      
      if (response.success) {
        setPermissionCategories(response.data);
      } else {
        setPermissionsError(response.message || 'Failed to fetch permissions');
      }
    } catch (error) {
      setPermissionsError('An error occurred while fetching permissions');
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [api]);

  // Fetch permission categories on mount
  useEffect(() => {
    fetchPermissionCategories();
  }, [fetchPermissionCategories]);

  return {
    permissionCategories,
    isLoadingPermissions,
    permissionsError,
    fetchPermissionCategories
  };
}
