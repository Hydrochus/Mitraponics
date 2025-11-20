<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@mitraponics.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'is_admin' => true,
            ]
        );

        // Create regular user
        \App\Models\User::updateOrCreate(
            ['email' => 'user@mitraponics.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('user123'),
                'is_admin' => false,
            ]
        );

        $this->call([
            ProductSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
