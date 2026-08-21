<?php

namespace App\Repositories;

use App\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use Carbon\Carbon;

class OrderRepository implements OrderRepositoryInterface
{
    public function createOrder(array $data): Order
    {
        return Order::create($data);
    }

    public function getOrderById(int $id): ?Order
    {
        return Order::with('items.menu', 'payment')->find($id);
    }

    public function getOrderByOrderNumber(string $orderNumber): ?Order
    {
        return Order::with('items.menu', 'payment')->where('order_number', $orderNumber)->first();
    }

    public function updateOrderStatus(int $id, string $status): bool
    {
        return Order::where('id', $id)->update(['order_status' => $status]);
    }

    public function generateQueueNumber(): string
    {
        $today = Carbon::today();
        $count = Order::whereDate('created_at', $today)
            ->whereNotNull('queue_number')
            ->count();
            
        return 'A-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
    }
}
