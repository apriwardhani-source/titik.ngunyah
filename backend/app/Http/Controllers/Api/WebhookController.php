<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Jobs\ProcessMidtransWebhook;
use Illuminate\Http\JsonResponse;

class WebhookController extends Controller
{
    public function midtrans(Request $request): JsonResponse
    {
        // Midtrans typically sends JSON payload
        $payload = $request->all();

        // Basic validation that required fields are present
        if (!isset($payload['order_id']) || !isset($payload['status_code']) || !isset($payload['signature_key'])) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        // Dispatch the queue job
        ProcessMidtransWebhook::dispatch($payload);

        // Acknowledge receipt to Midtrans immediately
        return response()->json(['message' => 'Webhook received and queued for processing'], 200);
    }
}
