<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\RoleRepository;
use App\Repositories\ActivityLogRepository;

class RoleService
{
    protected $roleRepository;
    protected $activityLogRepository;

    /**
     * Create a new service instance.
     *
     * @param RoleRepository $roleRepository
     * @param ActivityLogRepository $activityLogRepository
     */
    public function __construct(
        RoleRepository $roleRepository,
        ActivityLogRepository $activityLogRepository
    ) {
        $this->roleRepository = $roleRepository;
        $this->activityLogRepository = $activityLogRepository;
    }

    /**
     * Get all roles with pagination.
     *
     * @param array $params
     * @return array
     */
    public function getAllRoles(array $params): array
    {
        return $this->roleRepository->getAllWithPagination($params);
    }

    /**
     * Get role by ID.
     *
     * @param int $id
     * @return Role
     */
    public function getRoleById(int $id): Role
    {
        return $this->roleRepository->findOrFail($id)->load('permissions');
    }

    /**
     * Create a new role.
     *
     * @param array $data
     * @return Role
     */
    public function createRole(array $data): Role
    {
        $role = $this->roleRepository->create([
            'name' => $data['name'],
            'guard_name' => 'web',
            'description' => $data['description'] ?? null,
        ]);

        // Assign permissions if provided
        if (isset($data['permissions']) && is_array($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'created_role',
            'target' => $role->name,
            'details' => json_encode(['role_id' => $role->id]),
        ]);

        return $role->load('permissions');
    }

    /**
     * Update an existing role.
     *
     * @param int $id
     * @param array $data
     * @return Role
     */
    public function updateRole(int $id, array $data): Role
    {
        $role = $this->roleRepository->findOrFail($id);

        $roleData = [];
        if (isset($data['name'])) $roleData['name'] = $data['name'];
        if (isset($data['description'])) $roleData['description'] = $data['description'];

        $role = $this->roleRepository->update($role, $roleData);

        // Update permissions if provided
        if (isset($data['permissions']) && is_array($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'updated_role',
            'target' => $role->name,
            'details' => json_encode(['role_id' => $role->id]),
        ]);

        return $role->load('permissions');
    }

    /**
     * Delete a role.
     *
     * @param int $id
     * @return bool
     */
    public function deleteRole(int $id): bool
    {
        $role = $this->roleRepository->findOrFail($id);
        
        // Check if role has users
        if ($role->users()->count() > 0) {
            throw new \Exception('Cannot delete role with assigned users');
        }
        
        // Store name for activity log
        $name = $role->name;
        
        // Delete role
        $result = $this->roleRepository->delete($role);
        
        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'deleted_role',
            'target' => $name,
            'details' => json_encode(['role_id' => $id]),
        ]);
        
        return $result;
    }

    /**
     * Get users assigned to a role.
     *
     * @param int $id
     * @return array
     */
    public function getRoleUsers(int $id): array
    {
        $role = $this->roleRepository->findOrFail($id);
        return $role->users()->get()->toArray();
    }

    /**
     * Get permissions assigned to a role.
     *
     * @param int $id
     * @return array
     */
    public function getRolePermissions(int $id): array
    {
        $role = $this->roleRepository->findOrFail($id);
        return $role->permissions->pluck('name')->toArray();
    }

    /**
     * Update permissions for a role.
     *
     * @param int $id
     * @param array $permissions
     * @return array
     */
    public function updateRolePermissions(int $id, array $permissions): array
    {
        $role = $this->roleRepository->findOrFail($id);
        $role->syncPermissions($permissions);
        
        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'updated_role_permissions',
            'target' => $role->name,
            'details' => json_encode(['role_id' => $role->id]),
        ]);
        
        return $role->permissions->pluck('name')->toArray();
    }
}
