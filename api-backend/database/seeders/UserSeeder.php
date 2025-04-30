<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
            'last_active_at' => now(),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        ]);
        $admin->assignRole('super-admin');

        // Create business admin user
        $businessAdmin = User::create([
            'name' => 'Business Admin',
            'email' => 'business@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
            'last_active_at' => now(),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=business',
        ]);
        $businessAdmin->assignRole('business-admin');

        // Create moderator user
        $moderator = User::create([
            'name' => 'Moderator User',
            'email' => 'moderator@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
            'last_active_at' => now(),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator',
        ]);
        $moderator->assignRole('moderator');

        // Create regular user
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
            'last_active_at' => now(),
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        ]);
        $user->assignRole('user');
    }
}
