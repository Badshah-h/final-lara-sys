<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    protected $authService;

    /**
     * Create a new controller instance.
     *
     * @param AuthService $authService
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login a user
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Log the request for debugging
            \Illuminate\Support\Facades\Log::info('Login attempt', [
                'email' => $request->input('email'),
                'remember' => $request->boolean('remember'),
                'headers' => $request->headers->all(),
                'ip' => $request->ip(),
                'csrf_token' => $request->header('X-XSRF-TOKEN'),
                'session_id' => $request->session()->getId(),
                'has_session' => $request->hasSession(),
            ]);

            $validated = $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
                // Remove 'remember' from validation as it's handled separately
            ]);

            // Get the remember flag but don't include it in the credentials
            $remember = $request->boolean('remember');

            // Only pass email and password to Auth::attempt
            $credentials = [
                'email' => $validated['email'],
                'password' => $validated['password'],
            ];

            if (!Auth::attempt($credentials, $remember)) {
                \Illuminate\Support\Facades\Log::warning('Login failed: Invalid credentials', [
                    'email' => $request->input('email'),
                    'ip' => $request->ip(),
                ]);

                return response()->json([
                    'message' => 'Invalid login credentials'
                ], 401);
            }

            $user = Auth::user();
            $user->update(['last_active' => now()]);

            // Log user login activity
            ActivityLogService::logLogin($user);

            \Illuminate\Support\Facades\Log::info('Login successful', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return response()->json([
                'user' => $user->load('roles', 'permissions'),
                'token' => $user->createToken('auth_token')->plainTextToken,
            ]);
        } catch (\Exception $e) {
            // Log the exception
            \Illuminate\Support\Facades\Log::error('Login exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return a more user-friendly error response
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
            ], 500);
        }
    }

    /**
     * Register a new user
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'active',
            'last_active' => now(),
        ]);

        // Assign default role
        $user->assignRole('user');

        // Log user registration activity
        ActivityLogService::logRegistration($user);

        Auth::login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->load('roles', 'permissions'),
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    /**
     * Logout a user
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = Auth::user();

        // Log user logout activity
        if ($user) {
            ActivityLogService::logLogout($user);
        }

        if ($user) {
            $user->tokens()->where('id', $user->currentAccessToken()->id)->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->update(['last_active' => now()]);

        // Load roles and permissions
        $user->load('roles');
        $userData = $user->toArray();

        // Get permissions - handle both array and collection return types
        $permissions = $user->getAllPermissions();
        if (is_array($permissions)) {
            // If getAllPermissions returns an array, use it directly
            $userData['permissions'] = $permissions;
        } else {
            // If getAllPermissions returns a collection, use pluck
            $userData['permissions'] = $permissions->pluck('name')->toArray();
        }

        return response()->json($userData);
    }

    /**
     * Send password reset link
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendPasswordResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)])
            : response()->json(['email' => __($status)], 400);
    }

    /**
     * Reset password
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Log password reset
                ActivityLogService::log('Password Reset', 'User reset their password', $user);
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)])
            : response()->json(['email' => __($status)], 400);
    }
}
