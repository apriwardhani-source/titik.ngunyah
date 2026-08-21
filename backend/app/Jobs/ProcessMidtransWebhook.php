<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\PaymentService;
use Exception;
use Illuminate\Support\Facades\Log;

class ProcessMidtransWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $payload;

    /**
     * Create a new job instance.
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(PaymentService $paymentService): void
    {
        try {
            $paymentService->handleMidtransWebhook($this->payload);
        } catch (Exception $e) {
            Log::error('Error processing Midtrans webhook job', [
                'error' => $e->getMessage(),
                'payload' => $this->payload
            ]);
            
            // Re-throw to allow job retries if appropriate
            throw $e;
        }
    }
}
