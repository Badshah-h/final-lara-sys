<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\WidgetConfig;
use Illuminate\Support\Facades\Auth;

class WidgetController extends Controller
{
    /**
     * Get the widget configuration for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConfig()
    {
        $userId = Auth::id();
        $config = WidgetConfig::where('user_id', $userId)->first();
        
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'Widget configuration not found',
                'data' => null
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Widget configuration retrieved successfully',
            'data' => $config->config
        ]);
    }
    
    /**
     * Save the widget configuration for the authenticated user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveConfig(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'appearance' => 'required|array',
            'behavior' => 'required|array',
            'content' => 'required|array',
            'advanced' => 'required|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        $config = WidgetConfig::updateOrCreate(
            ['user_id' => $userId],
            ['config' => $request->all()]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Widget configuration saved successfully',
            'data' => $config->config
        ]);
    }
}
