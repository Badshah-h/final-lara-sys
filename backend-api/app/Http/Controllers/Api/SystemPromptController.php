<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SystemPrompt;
use App\Services\ResponseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemPromptController extends Controller
{
    /**
     * Get the current system prompt
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $systemPrompt = SystemPrompt::where('is_default', true)->first();

        if (!$systemPrompt) {
            // Create a default system prompt if none exists
            $systemPrompt = SystemPrompt::create([
                'name' => 'Default System Prompt',
                'description' => 'Default system prompt for AI assistant',
                'content' => 'You are a helpful AI assistant. Please provide accurate, helpful, and professional responses.',
                'is_default' => true,
            ]);
        }

        return ResponseService::success($systemPrompt);
    }

    /**
     * Update the system prompt
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        $systemPrompt = SystemPrompt::where('is_default', true)->first();

        if (!$systemPrompt) {
            // Create a new system prompt if none exists
            $systemPrompt = SystemPrompt::create([
                'name' => $request->input('name', 'Default System Prompt'),
                'description' => $request->input('description', 'Default system prompt for AI assistant'),
                'content' => $request->input('content'),
                'is_default' => true,
            ]);
        } else {
            // Update existing system prompt
            $systemPrompt->update([
                'content' => $request->input('content'),
                'name' => $request->input('name', $systemPrompt->name),
                'description' => $request->input('description', $systemPrompt->description),
            ]);
        }

        return ResponseService::success($systemPrompt, 'System prompt updated successfully');
    }
}