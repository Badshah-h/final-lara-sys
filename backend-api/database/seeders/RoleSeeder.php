<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the admin user
        $adminUser = \App\Models\User::where('email', 'admin@example.com')->first();
        $adminId = $adminUser ? $adminUser->id : null;

        // Create admin role with all permissions
        $adminRole = Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'guard_name' => 'web',
                'description' => 'Administrator with full system access',
                'is_active' => true,
                'created_by' => $adminId,
            ]
        );

        // Create moderator role with limited permissions
        $moderatorRole = Role::updateOrCreate(
            ['name' => 'moderator'],
            [
                'guard_name' => 'web',
                'description' => 'Moderator with content management permissions',
                'is_active' => true,
                'created_by' => $adminId,
            ]
        );

        // Create user role with basic permissions
        $userRole = Role::updateOrCreate(
            ['name' => 'user'],
            [
                'guard_name' => 'web',
                'description' => 'Regular user with limited access',
                'is_active' => true,
                'created_by' => $adminId,
            ]
        );

        // Get all permissions
        $allPermissions = Permission::all();

        // Assign all permissions to admin role
        $adminRole->permissions()->sync($allPermissions->pluck('id')->toArray());

        // Assign specific permissions to moderator role
        $moderatorPermissions = Permission::whereIn('name', [
            // User Management (limited)
            'view_users',

            // AI Configuration (limited)
            'test_ai',
            'view_ai_logs',

            // Widget Builder
            'create_widgets',
            'edit_widgets',
            'view_widgets',

            // Knowledge Base (full access)
            'create_kb_articles',
            'edit_kb_articles',
            'delete_kb_articles',
            'manage_kb_categories',
            'view_kb_articles',

            // System Settings (very limited)
            'view_audit_logs',
        ])->get();

        $moderatorRole->permissions()->sync($moderatorPermissions->pluck('id')->toArray());

        // Assign basic permissions to user role
        $userPermissions = Permission::whereIn('name', [
            // Widget Builder (limited)
            'view_widgets',

            // Knowledge Base (limited)
            'view_kb_articles',
        ])->get();

        $userRole->permissions()->sync($userPermissions->pluck('id')->toArray());
    }
}
