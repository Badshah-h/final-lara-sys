<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Define the 'web' middleware group
        $middleware->group('web', [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        // Define the 'api' middleware group
        $middleware->group('api', [
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // Uncomment if needed
            // 'throttle:api', // Uncomment if you define a rate limiter
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        // Register middleware aliases
        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
            'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
            'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
            'can' => \Illuminate\Auth\Middleware\Authorize::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
            'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always render exceptions as JSON for API requests
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->is('api/*/*')) {
                $status = 500;
                $message = 'Server Error';
                $errors = [];

                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $status = 401;
                    $message = 'Unauthenticated.';
                } elseif ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    $status = 403;
                    $message = $e->getMessage() ?: 'Forbidden.';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    $status = 404;
                    $message = 'Not Found.';
                } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                    $status = 422;
                    $message = 'The given data was invalid.';
                    $errors = $e->errors();
                } elseif (method_exists($e, 'getStatusCode')) {
                    $status = $e->getStatusCode();
                    $message = $e->getMessage() ?: $message;
                } else {
                    $message = $e->getMessage() ?: $message;
                }

                $response = [
                    'success' => false,
                    'message' => $message,
                ];
                if (!empty($errors)) {
                    $response['errors'] = $errors;
                }
                return response()->json($response, $status);
            }
        });
    })
    ->create();
