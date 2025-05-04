<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminPermissionSeeder extends Seeder
{
    /**
     * Assign all permissions to the admin role and ensure admin user has the admin role.
     */
    public function run(): void
    {
        // Get the admin user
        $adminUser = User::where('email', 'admin@example.com')->first();
        
        if (!$adminUser) {
            $this->command->info('Admin user not found. Creating admin user...');
            
            // Create admin user if it doesn't exist
            $adminUser = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'), // Change this to a secure password
                'email_verified_at' => now(),
            ]);
        }
        
        // Get or create admin role
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'guard_name' => 'web',
                'description' => 'Administrator with full system access',
                'is_active' => true,
                'created_by' => $adminUser->id,
            ]
        );
        
        // Get all permissions
        $allPermissions = Permission::all();
        
        if ($allPermissions->isEmpty()) {
            $this->command->info('No permissions found. Make sure to run the PermissionSeeder first.');
            return;
        }
        
        // Assign all permissions to admin role
        $adminRole->permissions()->sync($allPermissions->pluck('id')->toArray());
        $this->command->info('Assigned ' . $allPermissions->count() . ' permissions to admin role.');
        
        // Assign admin role to admin user
        $adminUser->roles()->sync([$adminRole->id => [
            'is_active' => true,
            'created_by' => $adminUser->id,
            'updated_by' => $adminUser->id,
        ]]);
        
        $this->command->info('Admin user has been assigned the admin role with all permissions.');
        
        // Add role permissions to user permissions table for direct access
        // This is optional and depends on how your permission system is set up
        $adminUser->permissions()->sync($allPermissions->pluck('id')->toArray());
        $this->command->info('Direct permissions have also been assigned to the admin user.');
    }
}
