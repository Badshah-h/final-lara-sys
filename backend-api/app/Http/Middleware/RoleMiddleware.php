<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        // Only check if user is authenticated, bypass role checks
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Commented out role checks - allow all authenticated users
        // $roles = is_array($role) ? $role : explode('|', $role);
        // if (!Auth::user()->hasAnyRole($roles)) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Access denied. You do not have the required role.',
        //     ], 403);
        // }

        return $next($request);
    }
}