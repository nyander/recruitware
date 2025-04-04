<?php

namespace App\Providers;

use App\Services\CandidateService;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Guards\ExternalGuard;
use App\Http\Controllers\CandidateController;
use App\Providers\ExternalUserProvider;
use App\Services\ExternalAuthService;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::provider('external', function ($app, array $config) {
            return new ExternalUserProvider($app->make(ExternalAuthService::class));
        });

        Auth::extend('external', function ($app, $name, array $config) {
            $provider = Auth::createUserProvider($config['provider']);
            $externalAuthService = $app->make(ExternalAuthService::class);
            return new ExternalGuard($provider, $externalAuthService, $app['request']);
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(CandidateService::class);

        $this->app->singleton(ExternalAuthService::class, function ($app) {
            return new ExternalAuthService($app->make(CandidateService::class));
        });

        $this->app->when(CandidateController::class)
            ->needs(CandidateService::class)
            ->give(function ($app) {
                return $app->make(CandidateService::class);
            });

        $this->app->when(CandidateController::class)
            ->needs(ExternalAuthService::class)
            ->give(function ($app) {
                return $app->make(ExternalAuthService::class);
            });
    }
}