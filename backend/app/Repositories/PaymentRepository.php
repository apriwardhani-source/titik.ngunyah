<?php

namespace App\Repositories;

use App\Interfaces\PaymentRepositoryInterface;
use App\Models\Payment;
use Carbon\Carbon;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function createPayment(array $data): Payment
    {
        return Payment::create($data);
    }

    public function getPaymentByOrderId(int $orderId): ?Payment
    {
        return Payment::where('order_id', $orderId)->first();
    }

    public function updatePaymentStatus(int $id, string $status, array $rawResponse = []): bool
    {
        $updateData = [
            'status' => $status,
            'raw_response' => json_encode($rawResponse)
        ];

        if ($status === 'settlement' || $status === 'capture') {
            $updateData['paid_at'] = Carbon::now();
        }

        return Payment::where('id', $id)->update($updateData) > 0;
    }
}
