<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('midtrans');
            $table->string('transaction_id')->nullable();
            $table->string('payment_type')->nullable(); // e.g. qris
            $table->integer('gross_amount');
            $table->string('status')->default('pending');
            $table->json('raw_response')->nullable();
            $table->string('snap_token')->nullable();
            $table->string('qr_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
