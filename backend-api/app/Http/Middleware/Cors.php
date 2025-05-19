<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(\Illuminate\Http\Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
        } else {
            $response = $next($request);
        }

        // Get the origin from the request
        $origin = $request->header('Origin');
        $allowedOrigins = explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5176'));

        // Check if the origin is allowed
        if ($origin && in_array($origin, $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            // Default to the first allowed origin if the request origin is not in the allowed list
            $response->headers->set('Access-Control-Allow-Origin', $allowedOrigins[0]);
        }

        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization, X-XSRF-TOKEN');
        $response->headers->set('Access-Control-Expose-Headers', 'Authorization');
        $response->headers->set('Access-Control-Max-Age', '86400'); // 24 hours

        // Log CORS headers for debugging
        \Illuminate\Support\Facades\Log::info('CORS headers set', [
            'origin' => $origin,
            'headers' => $response->headers->all(),
        ]);

        return $response;
    }
}
