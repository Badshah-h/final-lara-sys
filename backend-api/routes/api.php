<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\WidgetController;

// Authentication Routes (public)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/password/email', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Protected Routes (require auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Users
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::post('/users/{id}/password', [UserController::class, 'updatePassword']);
    Route::post('/users/password-reset', [UserController::class, 'sendPasswordReset']);
    Route::get('/users/{id}/permissions', [UserController::class, 'permissions']);
    Route::get('/users/{id}/activity-logs', [UserController::class, 'activityLogs']);
    Route::post('/users/{id}/avatar', [UserController::class, 'uploadAvatar']);

    // Roles
    Route::apiResource('roles', RoleController::class);
    Route::get('/roles/{id}/users', [RoleController::class, 'users']);
    Route::get('/roles/{id}/permissions', [RoleController::class, 'permissions']);
    Route::put('/roles/{id}/permissions', [RoleController::class, 'updatePermissions']);

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index']);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/{id}', [ActivityLogController::class, 'show']);
    Route::get('/activity-logs/export', [ActivityLogController::class, 'export']);
    
    // Widget Configuration
    Route::get('/widget/config', [WidgetController::class, 'getConfig']);
    Route::post('/widget/config', [WidgetController::class, 'saveConfig']);
});
