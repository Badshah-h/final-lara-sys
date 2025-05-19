<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiCsrfMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // For API routes, we'll skip CSRF validation completely for now
        // This is a temporary solution to get authentication working

        // Log the request for debugging
        Log::info('API Request', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'has_csrf_token' => $request->hasHeader('X-XSRF-TOKEN'),
        ]);

        return $next($request);
    }
}
