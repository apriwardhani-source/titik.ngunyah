<?php

namespace App\Services;

use App\Interfaces\OrderRepositoryInterface;
use App\Interfaces\PaymentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use App\Events\OrderPaid;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected OrderRepositoryInterface $orderRepository;
    protected PaymentRepositoryInterface $paymentRepository;

    public function __construct(
        OrderRepositoryInterface $orderRepository,
        PaymentRepositoryInterface $paymentRepository
    ) {
        $this->orderRepository = $orderRepository;
        $this->paymentRepository = $paymentRepository;
    }

    public function handleMidtransWebhook(array $payload)
    {
        $serverKey = config('services.midtrans.server_key', env('MIDTRANS_SERVER_KEY', ''));
        
        // 1. Verify Signature
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';

        $calculatedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        Log::info('Midtrans Signature Check', [
            'order_id' => $orderId,
            'server_key_length' => strlen($serverKey),
            'server_key_prefix' => substr($serverKey, 0, 15),
            'calculated' => substr($calculatedSignature, 0, 20) . '...',
            'received' => substr($signatureKey, 0, 20) . '...',
            'match' => $calculatedSignature === $signatureKey,
        ]);

        if ($calculatedSignature !== $signatureKey) {
            Log::error('Invalid Midtrans Signature', ['payload' => $payload]);
            throw new Exception("Invalid Signature Key");
        }

        // 2. Process Status inside Transaction
        DB::transaction(function () use ($payload, $orderId) {
            $transactionStatus = $payload['transaction_status'];
            $order = $this->orderRepository->getOrderByOrderNumber($orderId);

            if (!$order) {
                throw new Exception("Order not found: {$orderId}");
            }

            $payment = $this->paymentRepository->getPaymentByOrderId($order->id);

            // Ignore if already paid/completed to prevent duplicate processing
            if ($payment && in_array($payment->status, ['settlement', 'capture'])) {
                return;
            }

            $paymentStatus = 'pending';
            $orderStatus = 'waiting_payment';

            switch ($transactionStatus) {
                case 'capture':
                case 'settlement':
                    $paymentStatus = 'settlement'; // "paid"
                    $orderStatus = 'waiting_for_kitchen';
                    break;
                case 'deny':
                case 'cancel':
                case 'expire':
                case 'failure':
                    $paymentStatus = $transactionStatus;
                    $orderStatus = 'cancelled';
                    break;
                case 'pending':
                    $paymentStatus = 'pending';
                    $orderStatus = 'waiting_payment';
                    break;
            }

            // Update statuses
            $this->paymentRepository->updatePaymentStatus($payment->id, $paymentStatus, $payload);
            $this->orderRepository->updateOrderStatus($order->id, $orderStatus);

            // Dispatch Event if paid
            if ($paymentStatus === 'settlement') {
                event(new OrderPaid($order));
            }
        });
    }
}
