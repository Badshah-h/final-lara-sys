<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Determine if the application is in maintenance mode
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel
/** @var Application $app */
$app = require __DIR__.'/../bootstrap/app.php';

// Define the start time of the request
define('LARAVEL_START', microtime(true));

// Handle the request
$app->handleRequest(Request::capture());
