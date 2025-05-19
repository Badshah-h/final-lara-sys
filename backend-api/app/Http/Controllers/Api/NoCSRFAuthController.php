<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class NoCSRFAuthController extends Controller
{
    /**
     * Simple login endpoint with no CSRF protection
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Log all request details for debugging
        Log::info('NoCSRF login attempt', [
            'email' => $request->input('email'),
            'headers' => $request->headers->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Validate request
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Attempt authentication
        if (!Auth::attempt($validated, $request->boolean('remember'))) {
            Log::warning('NoCSRF login failed: Invalid credentials', [
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
        $token = $user->createToken('nocsrf-auth-token')->plainTextToken;

        // Log success
        Log::info('NoCSRF login successful', [
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
        // Get token from request
        $token = $request->bearerToken();

        if ($token) {
            // Find the token in the database
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

            if ($tokenModel) {
                // Delete the token
                $tokenModel->delete();

                Log::info('NoCSRF token revoked', [
                    'token_id' => $tokenModel->id,
                ]);
            }
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Register a new user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Log all request details for debugging
        Log::info('NoCSRF register attempt', [
            'headers' => $request->headers->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Validate request
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'active',
            'last_active' => now(),
        ]);

        // Assign default role if available
        if (method_exists($user, 'assignRole')) {
            $user->assignRole('user');
        }

        // Create token
        $token = $user->createToken('nocsrf-auth-token')->plainTextToken;

        // Log success
        Log::info('NoCSRF registration successful', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        // Return user data and token
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful'
        ], 201);
    }

    /**
     * Get the authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        // Get token from request
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'No token provided'
            ], 401);
        }

        // Find the token in the database
        $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        if (!$tokenModel) {
            return response()->json([
                'message' => 'Invalid token'
            ], 401);
        }

        // Get the user
        $user = $tokenModel->tokenable;

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json($user);
    }
}
