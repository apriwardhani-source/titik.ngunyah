<?php

namespace App\Interfaces;

use App\Models\Order;

interface OrderRepositoryInterface
{
    public function createOrder(array $data): Order;
    public function getOrderById(int $id): ?Order;
    public function getOrderByOrderNumber(string $orderNumber): ?Order;
    public function updateOrderStatus(int $id, string $status): bool;
    public function generateQueueNumber(): string;
}
