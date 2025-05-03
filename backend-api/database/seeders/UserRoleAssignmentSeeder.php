<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserRoleAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users
        $adminUser = User::where('email', 'admin@example.com')->first();
        $moderatorUser = User::where('email', 'moderator@example.com')->first();
        $regularUser = User::where('email', 'user@example.com')->first();
        
        if (!$adminUser) {
            return; // Exit if admin user doesn't exist
        }

        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();
        $userRole = Role::where('name', 'user')->first();

        // Assign roles to users
        if ($adminRole && $adminUser) {
            $adminUser->roles()->sync([$adminRole->id => [
                'is_active' => true,
                'created_by' => $adminUser->id,
                'updated_by' => $adminUser->id,
            ]]);
        }

        if ($moderatorRole && $moderatorUser) {
            $moderatorUser->roles()->sync([$moderatorRole->id => [
                'is_active' => true,
                'created_by' => $adminUser->id,
                'updated_by' => $adminUser->id,
            ]]);
        }

        if ($userRole && $regularUser) {
            $regularUser->roles()->sync([$userRole->id => [
                'is_active' => true,
                'created_by' => $adminUser->id,
                'updated_by' => $adminUser->id,
            ]]);
        }

        // Assign roles to additional users
        $additionalUsers = User::whereNotIn('email', [
            'admin@example.com', 
            'moderator@example.com', 
            'user@example.com'
        ])->get();

        if ($userRole) {
            foreach ($additionalUsers as $user) {
                $user->roles()->sync([$userRole->id => [
                    'is_active' => true,
                    'created_by' => $adminUser->id,
                    'updated_by' => $adminUser->id,
                ]]);
            }
        }
    }
}
