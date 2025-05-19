<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NoThrottleMiddleware
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
        // This middleware does nothing - it's a no-op replacement for ThrottleRequests
        Log::info('NoThrottleMiddleware: Bypassing rate limiting for request', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
        ]);
        
        return $next($request);
    }
}
