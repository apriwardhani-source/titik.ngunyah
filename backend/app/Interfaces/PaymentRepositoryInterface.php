<?php

namespace App\Interfaces;

use App\Models\Payment;

interface PaymentRepositoryInterface
{
    public function createPayment(array $data): Payment;
    public function getPaymentByOrderId(int $orderId): ?Payment;
    public function updatePaymentStatus(int $id, string $status, array $rawResponse = []): bool;
}
