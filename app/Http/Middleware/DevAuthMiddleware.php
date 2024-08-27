<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class DevAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            $user = User::firstOrCreate(
                ['email' => 'dev@example.com'],
                [
                    'name' => 'Dev User',
                    'password' => bcrypt('password'),
                ]
            );

            Auth::login($user);
        }

        return $next($request);
    }
}