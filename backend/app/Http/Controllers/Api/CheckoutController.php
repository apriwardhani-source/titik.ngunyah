<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'payment_method' => 'nullable|string|in:qris,cash'
        ]);

        try {
            $paymentMethod = $request->payment_method ?? 'qris';

            if ($paymentMethod === 'cash') {
                $order = $this->orderService->createOrderWithCash(
                    $request->items,
                    $request->customer_name
                );
            } else {
                $order = $this->orderService->createOrderWithQris(
                    $request->items,
                    $request->customer_name
                );
            }

            return response()->json([
                'status' => 'success',
                'message' => $paymentMethod === 'cash' 
                    ? 'Order created (pay at counter)' 
                    : 'Order created and QRIS generated',
                'data' => $order
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
