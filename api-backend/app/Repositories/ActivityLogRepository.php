<?php

namespace App\Repositories;

use App\Models\ActivityLog;

class ActivityLogRepository extends BaseRepository
{
    /**
     * ActivityLogRepository constructor.
     *
     * @param ActivityLog $model
     */
    public function __construct(ActivityLog $model)
    {
        parent::__construct($model);
    }
    
    /**
     * Apply search filter to query.
     *
     * @param $query
     * @param string $search
     * @return void
     */
    protected function applySearchFilter($query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('action', 'like', "%{$search}%")
              ->orWhere('target', 'like', "%{$search}%");
        });
    }
    
    /**
     * Apply additional filters to query.
     *
     * @param $query
     * @param array $params
     * @return void
     */
    protected function applyAdditionalFilters($query, array $params): void
    {
        // Filter by user ID
        if (isset($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        }
        
        // Filter by action type
        if (isset($params['action_type'])) {
            $query->where('action', 'like', "%{$params['action_type']}%");
        }
        
        // Filter by date range
        if (isset($params['date_from'])) {
            $query->whereDate('created_at', '>=', $params['date_from']);
        }
        
        if (isset($params['date_to'])) {
            $query->whereDate('created_at', '<=', $params['date_to']);
        }
    }
    
    /**
     * Get activity logs by user ID.
     *
     * @param int $userId
     * @param array $params
     * @return array
     */
    public function getByUserId(int $userId, array $params): array
    {
        $params['user_id'] = $userId;
        return $this->getAllWithPagination($params);
    }
    
    /**
     * Get activity logs for export.
     *
     * @param array $params
     * @return array
     */
    public function getForExport(array $params): array
    {
        $query = $this->model->query();
        
        // Apply filters
        $this->applyAdditionalFilters($query, $params);
        
        // Apply search if provided
        if (isset($params['search']) && !empty($params['search'])) {
            $this->applySearchFilter($query, $params['search']);
        }
        
        // Apply sorting
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortDirection = $params['sort_direction'] ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);
        
        // Get all matching logs
        $logs = $query->with('user')->get();
        
        // Format for export
        return $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? $log->user->name : 'System',
                'action' => $log->action,
                'target' => $log->target,
                'details' => $log->details,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }
}
