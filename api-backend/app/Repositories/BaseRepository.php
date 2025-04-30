<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseRepository
{
    /**
     * @var Model
     */
    protected $model;

    /**
     * BaseRepository constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get all models.
     *
     * @param array $columns
     * @param array $relations
     * @return Collection
     */
    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->model->with($relations)->get($columns);
    }

    /**
     * Get all models with pagination.
     *
     * @param array $params
     * @return array
     */
    public function getAllWithPagination(array $params): array
    {
        $page = $params['page'] ?? 1;
        $perPage = $params['per_page'] ?? 10;
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortDirection = $params['sort_direction'] ?? 'desc';
        
        $query = $this->model->query();
        
        // Apply search if provided
        if (isset($params['search']) && !empty($params['search'])) {
            $this->applySearchFilter($query, $params['search']);
        }
        
        // Apply additional filters
        $this->applyAdditionalFilters($query, $params);
        
        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);
        
        // Get paginated results
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        
        return [
            'data' => $this->processItems($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ];
    }

    /**
     * Find model by id.
     *
     * @param int $id
     * @param array $columns
     * @param array $relations
     * @param array $appends
     * @return Model|null
     */
    public function find(int $id, array $columns = ['*'], array $relations = [], array $appends = []): ?Model
    {
        return $this->model->select($columns)->with($relations)->findOrFail($id)->append($appends);
    }

    /**
     * Find model by id or fail.
     *
     * @param int $id
     * @param array $columns
     * @param array $relations
     * @param array $appends
     * @return Model
     */
    public function findOrFail(int $id, array $columns = ['*'], array $relations = [], array $appends = []): Model
    {
        return $this->model->select($columns)->with($relations)->findOrFail($id)->append($appends);
    }

    /**
     * Create a model.
     *
     * @param array $payload
     * @return Model
     */
    public function create(array $payload): Model
    {
        $model = $this->model->create($payload);
        return $model->fresh();
    }

    /**
     * Update existing model.
     *
     * @param Model $model
     * @param array $payload
     * @return Model
     */
    public function update(Model $model, array $payload): Model
    {
        $model->update($payload);
        return $model->fresh();
    }

    /**
     * Delete model by id.
     *
     * @param Model $model
     * @return bool
     */
    public function delete(Model $model): bool
    {
        return $model->delete();
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
        // Override in child repositories
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
        // Override in child repositories
    }
    
    /**
     * Process items before returning.
     *
     * @param array $items
     * @return array
     */
    protected function processItems(array $items): array
    {
        return $items;
    }
}
