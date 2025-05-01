<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ClearAllCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all caches and optimize the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Clearing all caches and optimizing the application...');

        // Clear application cache
        $this->call('cache:clear');
        $this->info('✓ Application cache cleared');

        // Clear configuration cache
        $this->call('config:clear');
        $this->info('✓ Configuration cache cleared');

        // Clear route cache
        $this->call('route:clear');
        $this->info('✓ Route cache cleared');

        // Clear compiled views
        $this->call('view:clear');
        $this->info('✓ Compiled views cleared');

        // Clear optimization cache
        $this->call('optimize:clear');
        $this->info('✓ Optimization cache cleared');

        // Clear event cache
        $this->call('event:clear');
        $this->info('✓ Event cache cleared');

        $this->newLine();
        $this->info('All caches have been cleared successfully!');
        
        return Command::SUCCESS;
    }
}
