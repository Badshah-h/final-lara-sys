<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class PublicAuthController extends Controller
{
    /**
     * Public login endpoint with no protection
     */
    public function login(Request $request)
    {
        // Log request
        Log::info('Public login attempt', [
            'email' => $request->input('email'),
        ]);

        // Validate request
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Attempt authentication
        if (!Auth::attempt($validated, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        // Get authenticated user
        $user = Auth::user();
        $user->update(['last_active' => now()]);

        // Create token with all user permissions
        $token = $user->createToken('public-auth-token')->plainTextToken;

        // Log success
        Log::info('Public login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        // Return user data and token
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    /**
     * Public register endpoint with no protection
     */
    public function register(Request $request)
    {
        // Log request
        Log::info('Public register attempt', [
            'email' => $request->input('email'),
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
        $token = $user->createToken('public-auth-token')->plainTextToken;

        // Log success
        Log::info('Public registration successful', [
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
     * Public logout endpoint with no protection
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
                
                Log::info('Public token revoked', [
                    'token_id' => $tokenModel->id,
                ]);
            }
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Public get user endpoint with no protection
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
