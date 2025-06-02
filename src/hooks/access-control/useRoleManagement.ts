import { useState, useCallback, useEffect } from 'react';
import { Role } from '@/types';
import { useApi } from '@/hooks/useApi';

/**
 * Hook for managing roles
 * Provides functions for fetching, creating, updating, and deleting roles
 */
export function useRoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const api = useApi();

  /**
   * Fetch all roles
   */
  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    setRolesError(null);

    try {
      const response = await api.get('/roles');

      // Handle direct array response or wrapped response
      if (Array.isArray(response)) {
        setRoles(response);
      } else if (response.success && response.data) {
        setRoles(response.data);
      } else if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        setRoles(response || []);
      }
    } catch (error: any) {
      setRolesError(error?.response?.data?.message || 'An error occurred while fetching roles');
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []); // Remove api dependency to prevent infinite loop

  /**
   * Create a new role
   */
  const createRole = useCallback(async (name: string, description: string, permissions: string[]) => {
    try {
      const response = await api.post('/roles', {
        name,
        description,
        permissions
      });

      // Handle different response formats
      if (response.success || response.message) {
        // Refresh the roles list
        await fetchRoles();
        return true;
      } else {
        throw new Error(response.message || 'Failed to create role');
      }
    } catch (error: any) {
      console.error('Error creating role:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Failed to create role');
    }
  }, [fetchRoles]);

  /**
   * Update an existing role
   */
  const updateRole = useCallback(async (id: string, name: string, description: string, permissions: string[]) => {
    try {
      const response = await api.put(`/roles/${id}`, {
        name,
        description,
        permissions
      });

      // Handle different response formats
      if (response.success || response.message) {
        // Refresh the roles list
        await fetchRoles();
        return true;
      } else {
        throw new Error(response.message || 'Failed to update role');
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Failed to update role');
    }
  }, [fetchRoles]);

  /**
   * Delete a role
   */
  const deleteRole = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/roles/${id}`);

      // Handle different response formats
      if (response.success || response.message) {
        // Refresh the roles list
        await fetchRoles();
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete role');
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Failed to delete role');
    }
  }, [fetchRoles]);

  return {
    roles,
    isLoadingRoles,
    rolesError,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  };
}
