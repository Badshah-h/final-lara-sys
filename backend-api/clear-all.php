<?php

/**
 * Clear All Command
 * 
 * This script runs all Laravel cache clearing commands in one go.
 * 
 * Usage: php clear-all.php
 */

// Define the commands to run
$commands = [
    'php artisan cache:clear',
    'php artisan config:clear',
    'php artisan route:clear',
    'php artisan view:clear',
    'php artisan optimize:clear',
    'php artisan event:clear',
];

// Function to output colored text
function coloredOutput($text, $type = 'info') {
    $colors = [
        'info' => "\033[0;32m", // Green
        'error' => "\033[0;31m", // Red
        'reset' => "\033[0m",    // Reset
    ];
    
    echo $colors[$type] . $text . $colors['reset'] . PHP_EOL;
}

// Print header
coloredOutput('=== CLEARING ALL CACHES ===', 'info');
echo PHP_EOL;

// Run each command
foreach ($commands as $command) {
    coloredOutput("Running: $command", 'info');
    
    // Execute the command
    $output = [];
    $returnCode = 0;
    exec($command, $output, $returnCode);
    
    // Check if the command was successful
    if ($returnCode === 0) {
        coloredOutput("✓ Success", 'info');
    } else {
        coloredOutput("✗ Failed with code $returnCode", 'error');
        foreach ($output as $line) {
            echo "  $line" . PHP_EOL;
        }
    }
    
    echo PHP_EOL;
}

// Print footer
coloredOutput('=== ALL CACHES CLEARED SUCCESSFULLY ===', 'info');
