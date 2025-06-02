import { useMemo, useCallback } from 'react';
import { apiService } from '@/services/api';
import { Role, Permission } from '@/types';

export const useApi = () => {
  const api = useMemo(() => apiService, []);

  const getRoles = useCallback(async (): Promise<Role[]> => {
    return api.get<Role[]>('/roles');
  }, [api]);

  const getPermissions = useCallback(async (): Promise<Permission[]> => {
    return api.get<Permission[]>('/permissions');
  }, [api]);

  const getPermissionCategories = useCallback(async () => {
    return api.get('/permissions/categories');
  }, [api]);

  const createRole = useCallback(async (roleData: Omit<Role, 'id'>) => {
    return api.post<Role>('/roles', roleData);
  }, [api]);

  const updateRole = useCallback(async (id: string, roleData: Partial<Role>) => {
    return api.put<Role>(`/roles/${id}`, roleData);
  }, [api]);

  const deleteRole = useCallback(async (id: string) => {
    return api.delete(`/roles/${id}`);
  }, [api]);

  const assignPermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
    return api.post(`/roles/${roleId}/permissions`, { permission_ids: permissionIds });
  }, [api]);

  const revokePermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
    return api.put(`/roles/${roleId}/permissions/revoke`, { permission_ids: permissionIds });
  }, [api]);

  return {
    api,
    getRoles,
    getPermissions,
    getPermissionCategories,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    revokePermissions,
  };
};
