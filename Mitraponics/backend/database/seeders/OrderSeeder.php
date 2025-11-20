<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all products
        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->info('No products found. Please run ProductSeeder first.');
            return;
        }
        
        // Create 5 sample orders
        for ($i = 1; $i <= 5; $i++) {
            $status = $this->getRandomStatus();
            $paymentMethod = rand(0, 1) ? 'cod' : 'card';
            $date = Carbon::now()->subDays(rand(1, 30));
            
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 10)),
                'user_id' => null,
                'customer_name' => 'Sample Customer ' . $i,
                'email' => 'customer' . $i . '@example.com',
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta Selatan',
                'district' => 'Kebayoran Baru',
                'post_code' => '12170',
                'detailed_address' => 'Jl. Sample Address No. ' . $i . ', RT.5/RW.2',
                'subtotal' => 0, // Will calculate based on items
                'tax' => 0, // Will calculate based on subtotal
                'shipping' => 15000, // Fixed shipping cost (Rp 15,000)
                'total' => 0, // Will calculate
                'payment_method' => $paymentMethod,
                'status' => $status,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
            
            // Add 1-3 random products to the order
            $itemCount = rand(1, 3);
            $subtotal = 0;
            
            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 2);
                $itemPrice = $product->price;
                $subtotal += $itemPrice * $quantity;
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->title,
                    'price' => $itemPrice,
                    'quantity' => $quantity,
                    'personalization' => null,
                    'selected_options' => null,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
            
            // Calculate tax and total
            $tax = round($subtotal * 0.11); // 11% tax
            $total = $subtotal + $tax + $order->shipping;
            
            // Update the order with calculated values
            $order->update([
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
    
    /**
     * Get a random order status.
     */
    private function getRandomStatus(): string
    {
        $statuses = [
            'processing',
            'shipped',
            'delivered',
            'cancelled',
        ];
        
        return $statuses[array_rand($statuses)];
    }
}
