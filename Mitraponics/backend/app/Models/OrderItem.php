<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'price',
        'quantity',
        'personalization',
        'selected_options'
    ];

    protected $casts = [
        'selected_options' => 'array',
        'price' => 'decimal:2'
    ];

    /**
     * Get the order that owns the order item.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product that the order item is for.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
