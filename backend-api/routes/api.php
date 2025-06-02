<?php

use App\Http\Controllers\API\AIModelController;
use App\Http\Controllers\API\ModelProviderController;
use App\Http\Controllers\API\PermissionController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\WidgetController;
use App\Http\Controllers\API\PromptTemplateController;
use App\Http\Controllers\API\ResponseFormatController;
use App\Http\Controllers\API\SystemPromptController;
use App\Http\Controllers\API\FollowUpController;
use App\Http\Controllers\API\SettingsController;
use App\Http\Controllers\API\KnowledgeBaseController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\ActivityLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// Public routes
Route::get('/test', function() {
    return response()->json([
        'success' => true,
        'message' => 'API is working correctly',
        'timestamp' => now()->toIso8601String(),
        'environment' => app()->environment(),
    ]);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User Management
    Route::apiResource('users', UserController::class);
    Route::put('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::put('/users/{id}/assign-roles', [UserController::class, 'assignRoles']);

    // Roles and Permissions
    Route::apiResource('roles', RoleController::class);
    Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions']);
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::get('/permissions/categories', [PermissionController::class, 'getByCategory']);

    // AI Models and Providers
    Route::apiResource('models', AIModelController::class);
    Route::post('/models/{id}/default', [AIModelController::class, 'setDefault'])->middleware('permission:manage models');
    Route::post('/models/{id}/test', [AIModelController::class, 'testModel']);
    Route::apiResource('providers', ModelProviderController::class);

    // Widgets
    Route::apiResource('widgets', WidgetController::class);
    Route::get('/widgets/{id}/analytics', [WidgetController::class, 'getAnalytics']);
    Route::get('/widgets/{id}/code', [WidgetController::class, 'getCode']);

    // Prompt Templates
    Route::apiResource('prompt-templates', PromptTemplateController::class);
    Route::get('/prompt-templates/categories/list', [PromptTemplateController::class, 'getCategories']);
    Route::post('/prompt-templates/{id}/increment-usage', [PromptTemplateController::class, 'incrementUsage']);

    // System Prompt
    Route::get('/system-prompt', [SystemPromptController::class, 'show']);
    Route::put('/system-prompt', [SystemPromptController::class, 'update']);

    // Response Formats
    Route::apiResource('response-formats', ResponseFormatController::class);
    Route::get('/response-formats/default', [ResponseFormatController::class, 'getDefault']);
    Route::post('/response-formats/{id}/set-default', [ResponseFormatController::class, 'setDefault']);
    Route::post('/response-formats/{id}/test', [ResponseFormatController::class, 'test']);

    // Follow-up Suggestions
    Route::prefix('follow-up')->group(function () {
        Route::get('/settings', [FollowUpController::class, 'getSettings']);
        Route::put('/settings', [FollowUpController::class, 'updateSettings']);
        Route::get('/suggestions', [FollowUpController::class, 'getSuggestions']);
        Route::post('/suggestions', [FollowUpController::class, 'createSuggestion']);
        Route::put('/suggestions/{id}', [FollowUpController::class, 'updateSuggestion']);
        Route::delete('/suggestions/{id}', [FollowUpController::class, 'deleteSuggestion']);
        Route::put('/suggestions/reorder', [FollowUpController::class, 'reorderSuggestions']);
        Route::get('/categories', [FollowUpController::class, 'getCategories']);
    });

    // Settings
    Route::get('/get-app-settings', [SettingsController::class, 'getAppSettings']);
    Route::put('/update-app-settings', [SettingsController::class, 'updateAppSettings']);
    Route::get('/get-user-settings', [SettingsController::class, 'getUserSettings']);
    Route::post('/update-user-settings', [SettingsController::class, 'updateUserSettings']);
    Route::put('/reset-user-settings', [SettingsController::class, 'resetUserSettings']);

    // Knowledge Base
    Route::prefix('knowledge-base')->group(function () {
        Route::apiResource('documents', KnowledgeBaseController::class);
        Route::post('/documents/{id}/process', [KnowledgeBaseController::class, 'processDocument']);
        Route::get('/search', [KnowledgeBaseController::class, 'search']);
    });

    // Chat
    Route::prefix('chat')->group(function () {
        Route::get('/sessions', [ChatController::class, 'getSessions']);
        Route::post('/sessions', [ChatController::class, 'createSession']);
        Route::get('/sessions/{id}', [ChatController::class, 'getSession']);
        Route::post('/sessions/{id}/messages', [ChatController::class, 'sendMessage']);
        Route::get('/sessions/{id}/messages', [ChatController::class, 'getMessages']);
    });

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/{id}', [ActivityLogController::class, 'show']);
});
