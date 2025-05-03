<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * 
     * For API requests, we don't redirect but instead return null to trigger a JSON response.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, don't redirect - just return null to trigger a JSON response
        return null;
    }

    /**
     * Handle an unauthenticated request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        abort(response()->json([
            'success' => false,
            'message' => 'Unauthenticated',
        ], 401));
    }
}
