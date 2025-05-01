<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Login user and create token
     *
     * @param array $data
     * @return array
     */
    public function login(array $data): array
    {
        $credentials = [
            'email' => $data['email'],
            'password' => $data['password']
        ];

        if (!Auth::attempt($credentials)) {
            return [
                'success' => false,
                'message' => 'Invalid login credentials',
                'code' => 401
            ];
        }

        $user = Auth::user();
        
        // Check if user is active
        if ($user->status !== 'active') {
            Auth::logout();
            return [
                'success' => false,
                'message' => 'Your account is not active. Please contact the administrator.',
                'code' => 403
            ];
        }

        // Update last active timestamp
        $user->last_active_at = now();
        $user->save();

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'success' => true,
            'message' => 'User logged in successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ];
    }

    /**
     * Register a new user
     *
     * @param array $data
     * @return array
     */
    public function register(array $data): array
    {
        // Check if email already exists
        if (User::where('email', $data['email'])->exists()) {
            return [
                'success' => false,
                'message' => 'Email already exists',
                'code' => 422
            ];
        }

        // Create user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => 'active', // Default status
            'last_active_at' => now()
        ]);

        // Assign default role if specified
        if (isset($data['role']) && !empty($data['role'])) {
            $user->assignRole($data['role']);
        } else {
            // Assign default user role
            $user->assignRole('user');
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ];
    }

    /**
     * Get the authenticated user
     *
     * @return array
     */
    public function getAuthenticatedUser(): array
    {
        if (!Auth::check()) {
            return [
                'success' => false,
                'message' => 'Unauthenticated',
                'code' => 401
            ];
        }

        $user = Auth::user();
        $user->load('roles.permissions');
        
        // Get all permissions from user's roles
        $permissions = $user->getAllPermissions()->pluck('name');

        return [
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => [
                'user' => $user,
                'permissions' => $permissions
            ]
        ];
    }

    /**
     * Logout user (Revoke the token)
     *
     * @return array
     */
    public function logout(): array
    {
        if (!Auth::check()) {
            return [
                'success' => false,
                'message' => 'Unauthenticated',
                'code' => 401
            ];
        }

        // Revoke all tokens
        Auth::user()->tokens()->delete();

        return [
            'success' => true,
            'message' => 'User logged out successfully'
        ];
    }

    /**
     * Send password reset link
     *
     * @param array $data
     * @return array
     */
    public function sendPasswordResetLink(array $data): array
    {
        $status = Password::sendResetLink(['email' => $data['email']]);

        if ($status !== Password::RESET_LINK_SENT) {
            return [
                'success' => false,
                'message' => __($status),
                'code' => 400
            ];
        }

        return [
            'success' => true,
            'message' => __($status)
        ];
    }

    /**
     * Reset password
     *
     * @param array $data
     * @return array
     */
    public function resetPassword(array $data): array
    {
        $status = Password::reset(
            $data,
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return [
                'success' => false,
                'message' => __($status),
                'code' => 400
            ];
        }

        return [
            'success' => true,
            'message' => __($status)
        ];
    }
}
