<?php

namespace App\Repositories;

use App\Models\Role;

class RoleRepository extends BaseRepository
{
    /**
     * RoleRepository constructor.
     *
     * @param Role $model
     */
    public function __construct(Role $model)
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
              ->orWhere('description', 'like', "%{$search}%");
        });
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
            $item->load('permissions');
            $item->userCount = $item->users()->count();
        }
        
        return $items;
    }
}
