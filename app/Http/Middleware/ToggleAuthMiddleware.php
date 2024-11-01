<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ToggleAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (config('app.use_dummy_user') && !Auth::check()) {
            $user = User::firstOrCreate(
                ['email' => 'dummy@example.com'],
                [
                    'name' => 'Dummy User',
                    'password' => bcrypt('password'),
                ]
            );

            Auth::login($user);
        }

        return $next($request);
    }
}