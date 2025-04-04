<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Support\Facades\Log;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];

    // In VerifyCsrfToken.php
    public function handle($request, Closure $next)
    {
        Log::info('Handling CSRF verification for request to: ' . $request->path());
        return parent::handle($request, $next);
    }
}