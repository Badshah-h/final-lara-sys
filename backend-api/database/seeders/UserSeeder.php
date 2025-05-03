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

        // Create additional regular users
        User::factory(5)->create();
    }
}
