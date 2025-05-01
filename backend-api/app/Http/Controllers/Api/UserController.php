<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateStatusRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends BaseApiController
{
    protected $userService;

    /**
     * Create a new controller instance.
     *
     * @param UserService $userService
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of users.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->userService->getAllUsers($request->all());
        return $this->paginatedResponse($result['data'], $result['meta']);
    }

    /**
     * Store a newly created user.
     *
     * @param StoreUserRequest $request
     * @return JsonResponse
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());
        return $this->successResponse($user, 'User created successfully', 201);
    }

    /**
     * Display the specified user.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        return $this->successResponse($user);
    }

    /**
     * Update the specified user.
     *
     * @param UpdateUserRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->updateUser($id, $request->validated());
        return $this->successResponse($user, 'User updated successfully');
    }

    /**
     * Remove the specified user.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $this->userService->deleteUser($id);
        return $this->successResponse(null, 'User deleted successfully');
    }

    /**
     * Update user status.
     *
     * @param UpdateStatusRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(UpdateStatusRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->updateUserStatus($id, $request->status);
        return $this->successResponse($user, 'User status updated successfully');
    }

    /**
     * Send password reset email to user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sendPasswordReset(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $result = $this->userService->sendPasswordResetEmail($request->email);

        if (!$result['success']) {
            return $this->errorResponse($result['message']);
        }

        return $this->successResponse(null, $result['message']);
    }

    /**
     * Get user permissions.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function permissions(int $id): JsonResponse
    {
        $permissions = $this->userService->getUserPermissions($id);
        return $this->successResponse($permissions);
    }

    /**
     * Get user activity logs.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function activityLogs(Request $request, int $id): JsonResponse
    {
        $result = $this->userService->getUserActivityLogs($id, $request->all());
        return $this->paginatedResponse($result['data'], $result['meta']);
    }
}
