<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ActivityLogController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/password/email', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Users
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::post('/users/password-reset', [UserController::class, 'sendPasswordReset']);
    Route::get('/users/{id}/permissions', [UserController::class, 'permissions']);
    Route::get('/users/{id}/activity-logs', [UserController::class, 'activityLogs']);

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
});