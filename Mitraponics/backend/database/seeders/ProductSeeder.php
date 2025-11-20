<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample products
        Product::create([
            'title' => 'Monstera Deliciosa',
            'description' => 'A beautiful house plant with unique leaf patterns.',
            'price' => 350000,
            'seller' => 'MITRAPONICS',
            'images' => [
                'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhbnR8ZW58MHx8MHx8fDA%3D',
                'https://images.unsplash.com/photo-1620313779164-6edeba553b7f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9uc3RlcmElMjBwbGFudHxlbnwwfHwwfHx8MA%3D%3D'
            ],
            'personalizable' => false,
            'options' => null
        ]);

        Product::create([
            'title' => 'Snake Plant',
            'description' => 'Low maintenance plant perfect for beginners.',
            'price' => 200000,
            'seller' => 'MITRAPONICS',
            'images' => [
                'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHBsYW50fGVufDB8fDB8fHww',
                'https://images.unsplash.com/photo-1620803103392-a939c30b0ae6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNuYWtlJTIwcGxhbnR8ZW58MHx8MHx8fDA%3D'
            ],
            'personalizable' => false,
            'options' => null
        ]);

        Product::create([
            'title' => 'Fiddle Leaf Fig',
            'description' => 'Trendy indoor plant with large, violin-shaped leaves.',
            'price' => 450000,
            'seller' => 'MITRAPONICS',
            'images' => [
                'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmlkZGxlJTIwbGVhZiUyMGZpZ3xlbnwwfHwwfHx8MA%3D%3D',
                'https://images.unsplash.com/photo-1627441539211-f3dc95cf1c26?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmlkZGxlJTIwbGVhZiUyMGZpZ3xlbnwwfHwwfHx8MA%3D%3D'
            ],
            'personalizable' => false,
            'options' => null
        ]);
    }
} 