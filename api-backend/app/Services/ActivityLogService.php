<?php

namespace App\Services;

use App\Repositories\ActivityLogRepository;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ActivityLogService
{
    protected $activityLogRepository;

    /**
     * Create a new service instance.
     *
     * @param ActivityLogRepository $activityLogRepository
     */
    public function __construct(ActivityLogRepository $activityLogRepository)
    {
        $this->activityLogRepository = $activityLogRepository;
    }

    /**
     * Get all activity logs with pagination.
     *
     * @param array $params
     * @return array
     */
    public function getAllActivityLogs(array $params): array
    {
        return $this->activityLogRepository->getAllWithPagination($params);
    }

    /**
     * Get activity log by ID.
     *
     * @param int $id
     * @return mixed
     */
    public function getActivityLogById(int $id)
    {
        return $this->activityLogRepository->findOrFail($id);
    }

    /**
     * Export activity logs.
     *
     * @param string $format
     * @param array $params
     * @return array
     */
    public function exportActivityLogs(string $format, array $params): array
    {
        try {
            $logs = $this->activityLogRepository->getForExport($params);
            
            if ($format === 'json') {
                $filename = 'activity-logs-' . date('Y-m-d') . '.json';
                $content = json_encode($logs, JSON_PRETTY_PRINT);
                $contentType = 'application/json';
            } else { // csv
                $filename = 'activity-logs-' . date('Y-m-d') . '.csv';
                $content = $this->convertToCsv($logs);
                $contentType = 'text/csv';
            }
            
            $headers = [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];
            
            $file = Response::make($content, 200, $headers);
            
            return [
                'success' => true,
                'file' => $file,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Convert array data to CSV format.
     *
     * @param array $data
     * @return string
     */
    private function convertToCsv(array $data): string
    {
        if (empty($data)) {
            return '';
        }
        
        $output = fopen('php://temp', 'r+');
        
        // Add headers
        fputcsv($output, array_keys($data[0]));
        
        // Add rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return $csv;
    }
}
