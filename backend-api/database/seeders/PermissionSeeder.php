<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define permission categories and their permissions
        $permissionsByCategory = [
            'User Management' => [
                'create_users' => 'Create new users in the system',
                'edit_users' => 'Edit existing user details',
                'delete_users' => 'Delete users from the system',
                'assign_roles' => 'Assign roles to users',
                'view_users' => 'View user list and details',
            ],
            'AI Configuration' => [
                'manage_models' => 'Manage AI models and configurations',
                'edit_prompts' => 'Edit AI prompts and templates',
                'test_ai' => 'Test AI functionality',
                'view_ai_logs' => 'View AI interaction logs',
            ],
            'Widget Builder' => [
                'create_widgets' => 'Create new widgets',
                'edit_widgets' => 'Edit existing widgets',
                'publish_widgets' => 'Publish widgets to production',
                'delete_widgets' => 'Delete widgets',
                'view_widgets' => 'View widget list and details',
            ],
            'Knowledge Base' => [
                'create_kb_articles' => 'Create knowledge base articles',
                'edit_kb_articles' => 'Edit knowledge base articles',
                'delete_kb_articles' => 'Delete knowledge base articles',
                'manage_kb_categories' => 'Manage knowledge base categories',
                'view_kb_articles' => 'View knowledge base articles',
            ],
            'System Settings' => [
                'manage_api_keys' => 'Manage API keys and integrations',
                'billing_subscription' => 'Manage billing and subscription settings',
                'system_backup' => 'Perform and manage system backups',
                'view_audit_logs' => 'View system audit logs',
                'manage_system_settings' => 'Manage general system settings',
            ],
        ];

        // Since this seeder runs before UserSeeder, we'll set created_by to null
        $adminId = null;

        // Create permissions
        foreach ($permissionsByCategory as $category => $permissions) {
            foreach ($permissions as $name => $description) {
                Permission::updateOrCreate(
                    ['name' => $name],
                    [
                        'guard_name' => 'web',
                        'category' => $category,
                        'description' => $description,
                        'is_active' => true,
                        'created_by' => $adminId, // Use a real user ID or null
                    ]
                );
            }
        }
    }
}
