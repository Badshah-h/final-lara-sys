<?php

namespace App\Http\Controllers\Api;

use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ActivityLogController extends BaseApiController
{
    protected $activityLogService;

    /**
     * Create a new controller instance.
     *
     * @param ActivityLogService $activityLogService
     */
    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Display a listing of activity logs.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->activityLogService->getAllActivityLogs($request->all());
        return $this->paginatedResponse($result['data'], $result['meta']);
    }

    /**
     * Display the specified activity log.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $activityLog = $this->activityLogService->getActivityLogById($id);
        return $this->successResponse($activityLog);
    }

    /**
     * Export activity logs.
     *
     * @param Request $request
     * @return BinaryFileResponse|JsonResponse
     */
    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:csv,json',
        ]);

        $result = $this->activityLogService->exportActivityLogs(
            $request->format,
            $request->except('format')
        );

        if (!$result['success']) {
            return $this->errorResponse($result['message']);
        }

        return $result['file'];
    }
}
