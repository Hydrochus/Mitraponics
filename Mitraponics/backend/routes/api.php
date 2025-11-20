<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Test route to check if API is working
Route::get('/test', function() {
    return response()->json([
        'message' => 'API is working',
        'status' => 'success',
        'timestamp' => now()
    ]);
});

Route::apiResource('products', ProductController::class);

Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/', [CartController::class, 'store']);
    Route::put('/{cart}', [CartController::class, 'update']);
    Route::delete('/{cart}', [CartController::class, 'destroy']);
    Route::delete('/', [CartController::class, 'clear']);
});

// Orders routes
Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::get('/{order}', [OrderController::class, 'show']);
    Route::post('/', [OrderController::class, 'checkout']);
    Route::put('/{order}', [OrderController::class, 'update']);
    Route::delete('/{order}', [OrderController::class, 'destroy']);
});

// User Authentication Routes
Route::prefix('user')->group(function () {
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login']);
    Route::post('/logout', [UserController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/check-auth', [UserController::class, 'checkAuth'])->middleware('auth:sanctum');
});

// Admin Authentication Routes
Route::prefix('admin')->group(function () {
    Route::post('/register', [AdminController::class, 'register']);
    Route::post('/login', [AdminController::class, 'login']);
    Route::post('/logout', [AdminController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/check-auth', [AdminController::class, 'checkAuth'])->middleware('auth:sanctum');

    // Admin order management
    Route::get('/orders', [OrderController::class, 'adminIndex'])->middleware('auth:sanctum');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->middleware('auth:sanctum');
    Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->middleware('auth:sanctum');
    
    // Admin user management
    Route::get('/users', [UserController::class, 'index'])->middleware('auth:sanctum');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('auth:sanctum');
});

// File Upload Route - Temporarily removed middleware for testing
Route::post('/upload', [UploadController::class, 'upload']);
