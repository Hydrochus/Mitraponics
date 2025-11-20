<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'price',
        'seller',
        'images',
        'personalizable',
        'options'
    ];

    protected $casts = [
        'images' => 'array',
        'options' => 'array',
        'personalizable' => 'boolean',
        'price' => 'decimal:2'
    ];

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }
}
