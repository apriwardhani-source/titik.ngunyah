<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\OrderController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/menus', [MenuController::class, 'index']);
Route::post('/menus', [MenuController::class, 'store']);
Route::put('/menus/{id}', [MenuController::class, 'update']);
Route::delete('/menus/{id}', [MenuController::class, 'destroy']);
Route::post('/upload', [MenuController::class, 'upload']);

Route::post('/checkout', [CheckoutController::class, 'store']);
Route::post('/payment/midtrans/webhook', [WebhookController::class, 'midtrans']);
Route::get('/orders', [OrderController::class, 'index']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
