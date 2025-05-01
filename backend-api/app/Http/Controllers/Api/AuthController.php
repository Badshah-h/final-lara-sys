<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends BaseApiController
{
    protected $authService;

    /**
     * Create a new controller instance.
     *
     * @param AuthService $authService
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login user and create token
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        if (!$result['success']) {
            return $this->sendError($result['message'], $result['errors'] ?? [], $result['code'] ?? 401);
        }

        return $this->sendResponse($result['data'], $result['message']);
    }

    /**
     * Register a new user
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        if (!$result['success']) {
            return $this->sendError($result['message'], $result['errors'] ?? [], $result['code'] ?? 400);
        }

        return $this->sendResponse($result['data'], $result['message'], 201);
    }

    /**
     * Get the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        $result = $this->authService->getAuthenticatedUser();

        if (!$result['success']) {
            return $this->sendError($result['message'], $result['errors'] ?? [], $result['code'] ?? 401);
        }

        return $this->sendResponse($result['data'], $result['message']);
    }

    /**
     * Logout user (Revoke the token)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $result = $this->authService->logout();

        if (!$result['success']) {
            return $this->sendError($result['message'], $result['errors'] ?? [], $result['code'] ?? 400);
        }

        return $this->sendResponse(null, $result['message']);
    }

    /**
     * Send password reset link
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $result = $this->authService->sendPasswordResetLink($request->validated());

        if (!$result['success']) {
            return $this->sendError($result['message'], $result['errors'] ?? [], $result['code'] ?? 400);
        }

        return $this->sendResponse(null, $result['message']);
    }

    /**
     * Reset password
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $result = $this->authService->resetPassword($request->validated());

        if (!$result['success']) {
            return $this->sendError($result['message'], $result['errors'] ?? [], $result['code'] ?? 400);
        }

        return $this->sendResponse(null, $result['message']);
    }
}