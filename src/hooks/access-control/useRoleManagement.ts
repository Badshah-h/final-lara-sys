import { useState, useCallback } from 'react';
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
      
      if (response.success) {
        setRoles(response.data);
      } else {
        setRolesError(response.message || 'Failed to fetch roles');
      }
    } catch (error) {
      setRolesError('An error occurred while fetching roles');
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, [api]);

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
      
      if (response.success) {
        // Refresh the roles list
        await fetchRoles();
        return true;
      } else {
        throw new Error(response.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }, [api, fetchRoles]);

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
      
      if (response.success) {
        // Refresh the roles list
        await fetchRoles();
        return true;
      } else {
        throw new Error(response.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }, [api, fetchRoles]);

  /**
   * Delete a role
   */
  const deleteRole = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      
      if (response.success) {
        // Refresh the roles list
        await fetchRoles();
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }, [api, fetchRoles]);

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
