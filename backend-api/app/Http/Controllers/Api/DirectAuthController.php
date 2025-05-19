<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DirectAuthController extends Controller
{
    /**
     * Simple login endpoint with detailed logging
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Log all request details for debugging
        Log::info('Direct login attempt', [
            'email' => $request->input('email'),
            'headers' => $request->headers->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'cookies' => $request->cookies->all(),
            'session_id' => $request->session()->getId(),
            'has_session' => $request->hasSession(),
            'csrf_token' => $request->header('X-XSRF-TOKEN'),
        ]);

        // Validate request
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Attempt authentication
        if (!Auth::attempt($validated, $request->boolean('remember'))) {
            Log::warning('Direct login failed: Invalid credentials', [
                'email' => $request->input('email'),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        // Get authenticated user
        $user = Auth::user();
        $user->update(['last_active' => now()]);

        // Create token with all user permissions
        $token = $user->createToken('direct-auth-token')->plainTextToken;

        // Log success
        Log::info('Direct login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'token_length' => strlen($token),
        ]);

        // Return user data and token
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    /**
     * Simple logout endpoint
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Revoke the token that was used to authenticate the current request
            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            Log::info('User logged out', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get the authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user->update(['last_active' => now()]);

        return response()->json($user);
    }
}
