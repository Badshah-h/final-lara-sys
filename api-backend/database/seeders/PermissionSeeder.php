<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions by category
        $permissions = [
            'User Management' => [
                'create_users',
                'edit_users',
                'delete_users',
                'assign_roles',
            ],
            'AI Configuration' => [
                'manage_models',
                'edit_prompts',
                'test_ai',
                'view_ai_logs',
            ],
            'Widget Builder' => [
                'create_widgets',
                'edit_widgets',
                'publish_widgets',
                'delete_widgets',
            ],
            'Knowledge Base' => [
                'create_kb_articles',
                'edit_kb_articles',
                'delete_kb_articles',
                'manage_kb_categories',
            ],
            'System Settings' => [
                'manage_api_keys',
                'billing_subscription',
                'system_backup',
                'view_audit_logs',
            ],
        ];

        // Create permissions in the database
        foreach ($permissions as $category => $permissionNames) {
            foreach ($permissionNames as $permission) {
                Permission::create([
                    'name' => $permission,
                    'guard_name' => 'web',
                    'category' => $category,
                ]);
            }
        }

        // Create roles and assign permissions
        $superAdmin = Role::create([
            'name' => 'super-admin',
            'guard_name' => 'web',
            'description' => 'Full access to all system features and settings',
        ]);
        $superAdmin->givePermissionTo(Permission::all());

        $businessAdmin = Role::create([
            'name' => 'business-admin',
            'guard_name' => 'web',
            'description' => 'Manage business-specific settings and content',
        ]);
        $businessAdmin->givePermissionTo([
            'create_users',
            'edit_users',
            'manage_models',
            'edit_prompts',
            'test_ai',
            'view_ai_logs',
            'create_widgets',
            'edit_widgets',
            'publish_widgets',
            'create_kb_articles',
            'edit_kb_articles',
            'delete_kb_articles',
            'manage_kb_categories',
            'view_audit_logs',
        ]);

        $moderator = Role::create([
            'name' => 'moderator',
            'guard_name' => 'web',
            'description' => 'Monitor conversations and manage content',
        ]);
        $moderator->givePermissionTo([
            'create_kb_articles',
            'edit_kb_articles',
            'manage_kb_categories',
            'test_ai',
            'view_ai_logs',
        ]);

        // Create user role
        Role::create([
            'name' => 'user',
            'guard_name' => 'web',
            'description' => 'Regular user with limited access',
        ]);
    }
}
