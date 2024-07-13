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
        // \App\Models\User::factory(10)->create();

        \App\Models\User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Judge 1',
            'email' => 'judge1@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'judge',
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Judge 2',
            'email' => 'judge2@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'judge',
        ]);
    }
}
