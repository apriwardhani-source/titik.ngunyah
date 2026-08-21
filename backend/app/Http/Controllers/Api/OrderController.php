<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items.menu', 'payment')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,waiting_payment,waiting_for_kitchen,preparing,ready,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->order_status = $request->status;
        $order->save();

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }
}
