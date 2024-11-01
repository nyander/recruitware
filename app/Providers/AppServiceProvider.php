<?php

namespace App\Providers;

use App\Services\CandidateService;
use App\Services\ExternalAuthService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(CandidateService::class, function ($app) {
            return new CandidateService();
        });

        $this->app->bind(ExternalAuthService::class, function ($app) {
            return new ExternalAuthService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
