<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sessionId = $request->cookie('cart_session_id', Str::uuid());
        
        return Cart::with('product')
            ->where('session_id', $sessionId)
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'personalization' => 'nullable|string',
            'selected_options' => 'nullable|array'
        ]);

        $sessionId = $request->cookie('cart_session_id', Str::uuid());
        
        // Check if product already exists in cart
        $cartItem = Cart::where('session_id', $sessionId)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => $cartItem->quantity + $validated['quantity']
            ]);
        } else {
            $cartItem = Cart::create([
                'session_id' => $sessionId,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'personalization' => $validated['personalization'] ?? null,
                'selected_options' => $validated['selected_options'] ?? null
            ]);
        }

        return response()->json($cartItem->load('product'))
            ->cookie('cart_session_id', $sessionId, 60 * 24 * 30); // 30 days
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cart $cart)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'personalization' => 'nullable|string',
            'selected_options' => 'nullable|array'
        ]);

        $cart->update($validated);
        return $cart->load('product');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cart $cart)
    {
        $cart->delete();
        return response()->json(null, 204);
    }

    public function clear(Request $request)
    {
        $sessionId = $request->cookie('cart_session_id');
        if ($sessionId) {
            Cart::where('session_id', $sessionId)->delete();
        }
        return response()->json(null, 204);
    }
}
