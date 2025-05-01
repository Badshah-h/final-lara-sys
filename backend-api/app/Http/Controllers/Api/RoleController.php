<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Requests\Role\UpdatePermissionsRequest;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends BaseApiController
{
    protected $roleService;

    /**
     * Create a new controller instance.
     *
     * @param RoleService $roleService
     */
    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Display a listing of roles.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->roleService->getAllRoles($request->all());
        return $this->paginatedResponse($result['data'], $result['meta']);
    }

    /**
     * Store a newly created role.
     *
     * @param StoreRoleRequest $request
     * @return JsonResponse
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->createRole($request->validated());
        return $this->successResponse($role, 'Role created successfully', 201);
    }

    /**
     * Display the specified role.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);
        return $this->successResponse($role);
    }

    /**
     * Update the specified role.
     *
     * @param UpdateRoleRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = $this->roleService->updateRole($id, $request->validated());
        return $this->successResponse($role, 'Role updated successfully');
    }

    /**
     * Remove the specified role.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $this->roleService->deleteRole($id);
        return $this->successResponse(null, 'Role deleted successfully');
    }

    /**
     * Get users assigned to a role.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function users(int $id): JsonResponse
    {
        $users = $this->roleService->getRoleUsers($id);
        return $this->successResponse($users);
    }

    /**
     * Get permissions assigned to a role.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function permissions(int $id): JsonResponse
    {
        $permissions = $this->roleService->getRolePermissions($id);
        return $this->successResponse($permissions);
    }

    /**
     * Update permissions for a role.
     *
     * @param UpdatePermissionsRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function updatePermissions(UpdatePermissionsRequest $request, int $id): JsonResponse
    {
        $permissions = $this->roleService->updateRolePermissions($id, $request->permissions);
        return $this->successResponse($permissions, 'Role permissions updated successfully');
    }
}
