<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Interfaces\OrderRepositoryInterface;
use App\Repositories\OrderRepository;
use App\Interfaces\PaymentRepositoryInterface;
use App\Repositories\PaymentRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, PaymentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
