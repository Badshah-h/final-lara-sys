<?php

namespace App\Services;

use App\Models\ResponseFormat;
use Illuminate\Pagination\LengthAwarePaginator;

class ResponseFormatService
{
    /**
     * Get all response formats
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllFormats(int $perPage = 15): LengthAwarePaginator
    {
        return ResponseFormat::orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get a response format by ID
     *
     * @param int $id
     * @return ResponseFormat|null
     */
    public function getFormatById(int $id): ?ResponseFormat
    {
        return ResponseFormat::find($id);
    }

    /**
     * Get the default response format
     *
     * @return ResponseFormat|null
     */
    public function getDefaultFormat(): ?ResponseFormat
    {
        return ResponseFormat::where('is_default', true)->first();
    }

    /**
     * Create a new response format
     *
     * @param array $data
     * @return ResponseFormat
     */
    public function createFormat(array $data): ResponseFormat
    {
        // If this format is set as default, update others to non-default
        if (isset($data['isDefault']) && $data['isDefault']) {
            $this->resetDefaultFormats();
        }

        // Map frontend data to backend structure
        $formatData = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'template' => $data['content'] ?? $data['template'] ?? '',
            'system_instructions' => $data['systemInstructions'] ?? null,
            'is_default' => $data['isDefault'] ?? false,
        ];

        // Build parameters from frontend structure
        $parameters = [];
        if (isset($data['format'])) $parameters['format'] = $data['format'];
        if (isset($data['length'])) $parameters['length'] = $data['length'];
        if (isset($data['tone'])) $parameters['tone'] = $data['tone'];

        if (isset($data['options'])) {
            $parameters = array_merge($parameters, $data['options']);
        }

        if (isset($data['parameters'])) {
            $parameters = array_merge($parameters, $data['parameters']);
        }

        $formatData['parameters'] = $parameters;
        $formatData['variables'] = $data['variables'] ?? null;

        return ResponseFormat::create($formatData);
    }

    /**
     * Update a response format
     *
     * @param int $id
     * @param array $data
     * @return ResponseFormat|null
     */
    public function updateFormat(int $id, array $data): ?ResponseFormat
    {
        $format = ResponseFormat::find($id);

        if (!$format) {
            return null;
        }

        // If this format is set as default, update others to non-default
        if (isset($data['isDefault']) && $data['isDefault']) {
            $this->resetDefaultFormats();
        }

        // Map frontend data to backend structure
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }

        if (isset($data['content']) || isset($data['template'])) {
            $updateData['template'] = $data['content'] ?? $data['template'];
        }

        if (isset($data['systemInstructions'])) {
            $updateData['system_instructions'] = $data['systemInstructions'];
        }

        if (isset($data['isDefault'])) {
            $updateData['is_default'] = $data['isDefault'];
        }

        // Update parameters
        if (isset($data['format']) || isset($data['length']) || isset($data['tone']) || isset($data['options']) || isset($data['parameters'])) {
            $parameters = $format->parameters ?? [];

            if (isset($data['format'])) $parameters['format'] = $data['format'];
            if (isset($data['length'])) $parameters['length'] = $data['length'];
            if (isset($data['tone'])) $parameters['tone'] = $data['tone'];

            if (isset($data['options'])) {
                $parameters = array_merge($parameters, $data['options']);
            }

            if (isset($data['parameters'])) {
                $parameters = array_merge($parameters, $data['parameters']);
            }

            $updateData['parameters'] = $parameters;
        }

        if (isset($data['variables'])) {
            $updateData['variables'] = $data['variables'];
        }

        $format->update($updateData);

        return $format->fresh();
    }

    /**
     * Delete a response format
     *
     * @param int $id
     * @return bool
     */
    public function deleteFormat(int $id): bool
    {
        $format = ResponseFormat::find($id);

        if (!$format) {
            return false;
        }

        // Don't allow deletion of default format
        if ($format->is_default) {
            return false;
        }

        return $format->delete();
    }

    /**
     * Set a response format as default
     *
     * @param int $id
     * @return ResponseFormat|null
     */
    public function setDefaultFormat(int $id): ?ResponseFormat
    {
        $format = ResponseFormat::find($id);

        if (!$format) {
            return null;
        }

        // Reset all formats to non-default
        $this->resetDefaultFormats();

        // Set this format as default
        $format->is_default = true;
        $format->save();

        return $format->fresh();
    }

    /**
     * Test a response format with a prompt
     *
     * @param int $id
     * @param string $prompt
     * @return array|null
     */
    public function testFormat(int $id, string $prompt): ?array
    {
        $format = ResponseFormat::find($id);

        if (!$format) {
            return null;
        }

        // This is a simplified example. In a real implementation,
        // this would connect to an AI service to format the response
        $formatted = 'This is a test formatted response for: ' . $prompt;

        // Apply some basic formatting based on the format template
        if (strpos($format->template, '{{bullet_points}}') !== false) {
            $formatted = "• Point 1 about $prompt\n• Point 2 about $prompt\n• Point 3 about $prompt";
        } elseif (strpos($format->template, '{{steps}}') !== false) {
            $formatted = "Step 1: Introduction to $prompt\nStep 2: Details about $prompt\nStep 3: Conclusion about $prompt";
        }

        return ['formatted' => $formatted];
    }

    /**
     * Reset all formats to non-default
     *
     * @return void
     */
    private function resetDefaultFormats(): void
    {
        ResponseFormat::where('is_default', true)
            ->update(['is_default' => false]);
    }
}
