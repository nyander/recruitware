<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CheckExternalAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!Session::has('authID') || !Session::has('userData')) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}