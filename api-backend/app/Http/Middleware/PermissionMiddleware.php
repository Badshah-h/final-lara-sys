<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $permissions = is_array($permission) ? $permission : explode('|', $permission);

        if (!Auth::user()->hasAnyPermission($permissions)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. You do not have the required permission.',
            ], 403);
        }

        return $next($request);
    }
}
