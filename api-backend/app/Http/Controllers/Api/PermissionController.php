<?php

namespace App\Http\Controllers\Api;

use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;

class PermissionController extends BaseApiController
{
    protected $permissionService;

    /**
     * Create a new controller instance.
     *
     * @param PermissionService $permissionService
     */
    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Display a listing of permissions grouped by category.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $permissions = $this->permissionService->getAllPermissions();
        return $this->successResponse($permissions);
    }
}
