<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'provider',
        'transaction_id',
        'payment_type',
        'gross_amount',
        'status',
        'raw_response',
        'snap_token',
        'qr_url',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
