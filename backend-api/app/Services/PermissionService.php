<?php

namespace App\Services;

use App\Repositories\PermissionRepository;

class PermissionService
{
    protected $permissionRepository;

    /**
     * Create a new service instance.
     *
     * @param PermissionRepository $permissionRepository
     */
    public function __construct(PermissionRepository $permissionRepository)
    {
        $this->permissionRepository = $permissionRepository;
    }

    /**
     * Get all permissions grouped by category.
     *
     * @return array
     */
    public function getAllPermissions(): array
    {
        $permissions = $this->permissionRepository->all();
        $groupedPermissions = [];
        
        foreach ($permissions as $permission) {
            $category = $permission->category ?? 'General';
            
            if (!isset($groupedPermissions[$category])) {
                $groupedPermissions[$category] = [
                    'category' => $category,
                    'permissions' => [],
                ];
            }
            
            $groupedPermissions[$category]['permissions'][] = [
                'id' => $permission->name,
                'name' => $this->formatPermissionName($permission->name),
            ];
        }
        
        return array_values($groupedPermissions);
    }
    
    /**
     * Format permission name for display.
     *
     * @param string $name
     * @return string
     */
    private function formatPermissionName(string $name): string
    {
        return ucfirst(str_replace('_', ' ', $name));
    }
}
