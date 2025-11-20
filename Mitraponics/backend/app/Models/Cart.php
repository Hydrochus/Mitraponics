<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'product_id',
        'quantity',
        'personalization',
        'selected_options'
    ];

    protected $casts = [
        'selected_options' => 'array'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
