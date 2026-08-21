<?php

namespace App\Services;

use App\Interfaces\OrderRepositoryInterface;
use App\Interfaces\PaymentRepositoryInterface;
use App\Models\Menu;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Str;

class OrderService
{
    protected OrderRepositoryInterface $orderRepository;
    protected PaymentRepositoryInterface $paymentRepository;
    protected MidtransService $midtransService;

    public function __construct(
        OrderRepositoryInterface $orderRepository,
        PaymentRepositoryInterface $paymentRepository,
        MidtransService $midtransService
    ) {
        $this->orderRepository = $orderRepository;
        $this->paymentRepository = $paymentRepository;
        $this->midtransService = $midtransService;
    }

    /**
     * Calculate order items from request data.
     * Validates menu existence and computes prices server-side.
     */
    private function calculateOrderItems(array $items): array
    {
        $subtotal = 0;
        $orderItemsData = [];

        foreach ($items as $item) {
            $menu = Menu::where('id', $item['menu_id'])->where('visible', true)->first();
            
            if (!$menu) {
                throw new Exception("Menu item with ID {$item['menu_id']} not found or unavailable.");
            }

            $itemSubtotal = $menu->price * $item['qty'];
            $subtotal += $itemSubtotal;

            $orderItemsData[] = [
                'menu_id' => $menu->id,
                'price' => $menu->price,
                'qty' => $item['qty'],
                'subtotal' => $itemSubtotal,
                'notes' => $item['notes'] ?? null,
            ];
        }

        return ['subtotal' => $subtotal, 'items' => $orderItemsData];
    }

    /**
     * Create order with QRIS payment via Midtrans.
     */
    public function createOrderWithQris(array $items, ?string $customerName = null)
    {
        return DB::transaction(function () use ($items, $customerName) {
            // 1. Calculate price from DB to avoid frontend manipulation
            $calculated = $this->calculateOrderItems($items);

            // 2. Create Order
            $queueNumber = $this->orderRepository->generateQueueNumber();
            $orderNumber = 'ORD-' . date('YmdHis') . '-' . Str::upper(Str::random(4));
            
            $orderData = [
                'order_number' => $orderNumber,
                'queue_number' => $queueNumber,
                'customer_name' => $customerName,
                'subtotal' => $calculated['subtotal'],
                'tax' => 0,
                'total' => $calculated['subtotal'],
                'payment_method' => 'qris',
                'payment_status' => 'pending',
                'order_status' => 'waiting_payment',
            ];

            $order = $this->orderRepository->createOrder($orderData);

            // 3. Create Order Items
            foreach ($calculated['items'] as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // 4. Request QRIS from Midtrans
            $midtransResponse = $this->midtransService->createQrisTransaction($order->order_number, $order->total);

            // 5. Save Payment Record
            $paymentData = [
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'transaction_id' => $midtransResponse['transaction_id'] ?? null,
                'payment_type' => 'qris',
                'gross_amount' => $order->total,
                'status' => 'pending',
                'raw_response' => json_encode($midtransResponse),
                'snap_token' => null,
                'qr_url' => $midtransResponse['actions'][0]['url'] ?? null,
            ];

            $this->paymentRepository->createPayment($paymentData);

            // Return order with payment info
            return $this->orderRepository->getOrderById($order->id);
        });
    }

    /**
     * Create order with cash payment (pay at counter).
     */
    public function createOrderWithCash(array $items, ?string $customerName = null)
    {
        return DB::transaction(function () use ($items, $customerName) {
            // 1. Calculate price from DB
            $calculated = $this->calculateOrderItems($items);

            // 2. Create Order — cash orders go directly to "waiting_for_kitchen"
            $queueNumber = $this->orderRepository->generateQueueNumber();
            $orderNumber = 'ORD-' . date('YmdHis') . '-' . Str::upper(Str::random(4));

            $orderData = [
                'order_number' => $orderNumber,
                'queue_number' => $queueNumber,
                'customer_name' => $customerName,
                'subtotal' => $calculated['subtotal'],
                'tax' => 0,
                'total' => $calculated['subtotal'],
                'payment_method' => 'cash',
                'payment_status' => 'pending',
                'order_status' => 'waiting_for_kitchen',
            ];

            $order = $this->orderRepository->createOrder($orderData);

            // 3. Create Order Items
            foreach ($calculated['items'] as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // 4. Save Payment Record (cash — no external provider)
            $paymentData = [
                'order_id' => $order->id,
                'provider' => 'cash',
                'transaction_id' => null,
                'payment_type' => 'cash',
                'gross_amount' => $order->total,
                'status' => 'pending', // Will be marked 'settlement' when cashier confirms
                'raw_response' => null,
                'snap_token' => null,
                'qr_url' => null,
            ];

            $this->paymentRepository->createPayment($paymentData);

            // Return order with payment info
            return $this->orderRepository->getOrderById($order->id);
        });
    }
}
