<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Admin123'),
                'email_verified_at' => now(),
                'remember_token' => \Str::random(10),
            ]
        );

        // Create moderator user
        $moderatorUser = User::updateOrCreate(
            ['email' => 'moderator@example.com'],
            [
                'name' => 'Moderator User',
                'password' => Hash::make('Moderator123'),
                'email_verified_at' => now(),
                'remember_token' => \Str::random(10),
            ]
        );

        // Create regular user
        $regularUser = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('User123'),
                'email_verified_at' => now(),
                'remember_token' => \Str::random(10),
            ]
        );

        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();
        $userRole = Role::where('name', 'user')->first();

        // Assign roles to users
        if ($adminRole) {
            $adminUser->roles()->sync([$adminRole->id => [
                'is_active' => true,
                'created_by' => $adminUser->id,
                'updated_by' => $adminUser->id,
            ]]);
        }

        if ($moderatorRole) {
            $moderatorUser->roles()->sync([$moderatorRole->id => [
                'is_active' => true,
                'created_by' => $adminUser->id,
                'updated_by' => $adminUser->id,
            ]]);
        }

        if ($userRole) {
            $regularUser->roles()->sync([$userRole->id => [
                'is_active' => true,
                'created_by' => $adminUser->id,
                'updated_by' => $adminUser->id,
            ]]);
        }

        // Create additional regular users
        User::factory(5)->create()->each(function ($user) use ($userRole, $adminUser) {
            if ($userRole) {
                $user->roles()->sync([$userRole->id => [
                    'is_active' => true,
                    'created_by' => $adminUser->id,
                    'updated_by' => $adminUser->id,
                ]]);
            }
        });
    }
}