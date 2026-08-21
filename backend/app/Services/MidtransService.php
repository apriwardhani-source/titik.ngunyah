<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class MidtransService
{
    protected string $serverKey;
    protected bool $isProduction;
    protected string $baseUrl;

    public function __construct()
    {
        $this->serverKey = env('MIDTRANS_SERVER_KEY', '');
        $this->isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        $this->baseUrl = $this->isProduction 
            ? 'https://api.midtrans.com/v2' 
            : 'https://api.sandbox.midtrans.com/v2';
    }

    public function createQrisTransaction(string $orderId, int $grossAmount)
    {
        $payload = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'qris' => [
                'acquirer' => 'gopay'
            ]
        ];

        $response = Http::withBasicAuth($this->serverKey, '')
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ])
            ->post($this->baseUrl . '/charge', $payload);

        if ($response->failed()) {
            Log::error('Midtrans API Failed', [
                'status' => $response->status(),
                'body' => $response->json(),
                'key_used' => $this->serverKey,
                'url_used' => $this->baseUrl . '/charge'
            ]);
            throw new Exception('Midtrans API Error: ' . $response->body());
        }

        return $response->json();
    }
}
