<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository extends BaseRepository
{
    /**
     * UserRepository constructor.
     *
     * @param User $model
     */
    public function __construct(User $model)
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
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
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
        // Filter by role
        if (isset($params['role']) && $params['role'] !== 'all') {
            $query->whereHas('roles', function ($q) use ($params) {
                $q->where('name', $params['role']);
            });
        }
        
        // Filter by status
        if (isset($params['status']) && $params['status'] !== 'all') {
            $query->where('status', $params['status']);
        }
    }
    
    /**
     * Process items before returning.
     *
     * @param array $items
     * @return array
     */
    protected function processItems(array $items): array
    {
        foreach ($items as &$item) {
            $item->load('roles');
        }
        
        return $items;
    }
}
