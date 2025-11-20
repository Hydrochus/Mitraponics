<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check for user authentication
        $userId = null;
        $userToken = $request->bearerToken();
        $sessionId = $request->cookie('cart_session_id');
        
        if ($userToken) {
            // Get user from token
            $user = \App\Models\User::whereHas('tokens', function ($query) use ($userToken) {
                $query->where('token', hash('sha256', $userToken));
            })->first();
            
            if ($user) {
                $userId = $user->id;
                Log::info("Fetching orders for authenticated user ID: {$userId}");
                
                // For authenticated users, ONLY show orders associated with their user ID
                $orders = Order::with('items.product')
                    ->where('user_id', $userId)
                    ->latest()
                    ->get();
                    
                return response()->json(['orders' => $orders]);
            } else {
                Log::warning("Invalid token provided for order history request");
            }
        }
        
        // If no authenticated user found or token is invalid, fall back to session-based filtering
        if ($sessionId) {
            Log::info("Fetching orders for session ID: {$sessionId}");
            $orders = Order::with('items.product')
                ->where('session_id', $sessionId)
                ->latest()
                ->get();
                
            return response()->json(['orders' => $orders]);
        }
        
        // If neither authentication nor session is available, return empty array
        Log::warning("No authentication or session found for order history request");
        return response()->json(['orders' => []]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Redirect to checkout method
        return $this->checkout($request);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        try {
            // Get user ID from token if authenticated
            $userId = null;
            $userToken = $request->bearerToken();
            
            if ($userToken) {
                $user = \App\Models\User::whereHas('tokens', function ($query) use ($userToken) {
                    $query->where('token', hash('sha256', $userToken));
                })->first();
                
                if ($user) {
                    $userId = $user->id;
                }
            }
            
            // Get the session ID from the request
            $sessionId = $request->cookie('cart_session_id');
            
            // Query for the order with proper access restrictions
            $query = Order::with('items.product');
            
            // If user is authenticated, restrict by user_id
            if ($userId) {
                $query->where('user_id', $userId);
            } 
            // If not authenticated but has session ID, restrict by session_id
            elseif ($sessionId) {
                $query->where('session_id', $sessionId);
            }
            
            // Add the ID restriction
            $query->where('id', $id);
            
            // Execute the query
            $order = $query->firstOrFail();
            
            return response()->json($order)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Order not found',
                'message' => $e->getMessage()
            ], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $orderId)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
                'cancel_reason' => 'nullable|string|max:255'
            ]);

            // Get user ID from token if authenticated
            $userId = null;
            $userToken = $request->bearerToken();
            
            if ($userToken) {
                $user = \App\Models\User::whereHas('tokens', function ($query) use ($userToken) {
                    $query->where('token', hash('sha256', $userToken));
                })->first();
                
                if ($user) {
                    $userId = $user->id;
                }
            }
            
            // Get the session ID from the request
            $sessionId = $request->cookie('cart_session_id');
            
            // Query for the order with proper access restrictions
            $query = Order::with('items.product');
            
            // If user is authenticated, restrict by user_id
            if ($userId) {
                $query->where('user_id', $userId);
            } 
            // If not authenticated but has session ID, restrict by session_id
            elseif ($sessionId) {
                $query->where('session_id', $sessionId);
            }
            
            // Add the ID restriction
            $query->where('id', $orderId);
            
            // Execute the query
            $order = $query->firstOrFail();

            // Check if the order can be cancelled
            if ($validated['status'] === 'cancelled' && !in_array($order->status, ['pending', 'processing'])) {
                return response()->json([
                    'error' => 'Cannot cancel order',
                    'message' => 'Only pending or processing orders can be cancelled'
                ], 422)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
            }

            $updateData = ['status' => $validated['status']];
            
            // If order is being cancelled, store the reason if provided
            if ($validated['status'] === 'cancelled' && isset($request->cancel_reason)) {
                $updateData['cancel_reason'] = $request->cancel_reason;
                Log::info('Order ' . $order->id . ' cancelled with reason: ' . $request->cancel_reason);
            }

            $order->update($updateData);

            return response()->json([
                'message' => 'Order updated successfully',
                'order' => $order->load('items')
            ])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->errors(),
            ], 422)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        } catch (\Exception $e) {
            Log::error('Error updating order: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update order',
                'message' => $e->getMessage(),
            ], 500)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        try {
            // Get user ID from token if authenticated
            $userId = null;
            $userToken = $request->bearerToken();
            
            if ($userToken) {
                $user = \App\Models\User::whereHas('tokens', function ($query) use ($userToken) {
                    $query->where('token', hash('sha256', $userToken));
                })->first();
                
                if ($user) {
                    $userId = $user->id;
                }
            }
            
            // Get the session ID from the request
            $sessionId = $request->cookie('cart_session_id');
            
            // Query for the order with proper access restrictions
            $query = Order::query();
            
            // If user is authenticated, restrict by user_id
            if ($userId) {
                $query->where('user_id', $userId);
            } 
            // If not authenticated but has session ID, restrict by session_id
            elseif ($sessionId) {
                $query->where('session_id', $sessionId);
            }
            
            // Add the ID restriction
            $query->where('id', $id);
            
            // Execute the query and delete
            $order = $query->firstOrFail();
            $order->delete();

            return response()->json([
                'message' => 'Order deleted successfully'
            ])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        } catch (\Exception $e) {
            Log::error('Error deleting order: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete order',
                'message' => $e->getMessage(),
            ], 500)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        }
    }

    /**
     * Process a checkout and create an order.
     */
    public function checkout(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'province' => 'required|string|max:255',
                'city' => 'required|string|max:255',
                'district' => 'required|string|max:255',
                'post_code' => 'required|string|max:20',
                'detailed_address' => 'required|string',
                'payment_method' => 'required|in:cod,card'
            ]);

            // Get the session ID from the request
            $sessionId = $request->cookie('cart_session_id');
            if (!$sessionId) {
                return response()->json([
                    'error' => 'No session ID found'
                ], 400);
            }

            // Get user ID if authenticated
            $userId = null;
            $userToken = $request->bearerToken();
            
            if ($userToken) {
                // Get user from token
                $user = \App\Models\User::whereHas('tokens', function ($query) use ($userToken) {
                    $query->where('token', hash('sha256', $userToken));
                })->first();
                
                if ($user) {
                    $userId = $user->id;
                }
            }

            // Get the cart items
            $cartItems = Cart::where('session_id', $sessionId)
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'error' => 'Your cart is empty'
                ], 400);
            }

            // Calculate the order totals
            $subtotal = $cartItems->sum(function ($item) {
                return $item->product->price * $item->quantity;
            });
            $tax = $subtotal * 0.11; // 11% tax for Indonesia
            $shipping = 15000; // Rp 15,000 shipping cost
            $total = $subtotal + $tax + $shipping;

            // Generate an order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));

            // Create the order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'],
                'province' => $validated['province'],
                'city' => $validated['city'],
                'district' => $validated['district'],
                'post_code' => $validated['post_code'],
                'detailed_address' => $validated['detailed_address'],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'pending',
                'session_id' => $sessionId
            ]);

            // Create the order items
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->title,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'personalization' => $item->personalization ?? null,
                    'selected_options' => $item->selected_options ?? null
                ]);
            }

            // Clear the cart
            Cart::where('session_id', $sessionId)->delete();

            // Return the order
            return response()->json([
                'message' => 'Order created successfully',
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
                'created_at' => $order->created_at,
                'payment_method' => $order->payment_method,
                'order' => $order->load('items')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create order',
                'message' => $e->getMessage(),
                'id' => 0,
                'order_number' => 'ORD-ERR-' . time(),
                'total' => 0
            ], 500);
        }
    }

    /**
     * Get admin orders.
     */
    public function adminIndex()
    {
        $orders = Order::with(['items.product' => function ($query) {
            $query->select('id', 'title', 'images');
        }])->orderBy('created_at', 'desc')->get();

        return response()->json(['orders' => $orders]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $orderId)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
                'cancel_reason' => 'nullable|string|max:255'
            ]);

            // Get the order
            $order = Order::findOrFail($orderId);

            $updateData = ['status' => $validated['status']];
            
            // If order is being cancelled, store the reason if provided
            if ($validated['status'] === 'cancelled' && isset($request->cancel_reason)) {
                $updateData['cancel_reason'] = $request->cancel_reason;
            }

            $order->update($updateData);

            return response()->json([
                'message' => 'Order status updated successfully',
                'order' => $order->load('items')
            ])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->errors(),
            ], 422)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        } catch (\Exception $e) {
            Log::error('Error updating order status: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update order status',
                'message' => $e->getMessage(),
            ], 500)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With');
        }
    }
}
