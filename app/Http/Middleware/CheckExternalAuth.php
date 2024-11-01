<?php

namespace App\Http\Middleware;

use App\Services\AuthLogger;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;

class CheckExternalAuth
{
    public function handle(Request $request, Closure $next)
    {
        $routeName = $request->route()->getName();
        $method = $request->method();

        Log::info('CheckExternalAuth middleware executing', [
            'route' => $routeName,
            'session_exists' => Session::has('authID'),
            'method' => $method,
            'path' => $request->path(),
            'all_session_keys' => array_keys(Session::all()),
        ]);

        // Check for valid session
        $requiredSessionKeys = ['authID', 'userName', 'userData', 'fldr'];
        $missingKeys = [];

        foreach ($requiredSessionKeys as $key) {
            if (!Session::has($key)) {
                $missingKeys[] = $key;
            }
        }

        if (!empty($missingKeys)) {
            Log::warning('Missing required session keys', [
                'missing_keys' => $missingKeys,
                'route' => $routeName
            ]);

            // Only clear sessions and cookies if it's not already a login route
            if ($routeName !== 'login') {
                $this->clearSessionAndCookies();
                Log::info("Redirecting to login due to missing session keys");
                return redirect()->route('login');
            }
        }

        // Verify session matches cookies
        if (Cookie::has('RW_AuthID') && Session::has('authID') &&
            Cookie::get('RW_AuthID') !== Session::get('authID')) {
            Log::warning('Session-Cookie mismatch', [
                'cookie_auth_id' => Cookie::get('RW_AuthID'),
                'session_auth_id' => Session::get('authID')
            ]);
            $this->clearSessionAndCookies();
            Log::info("Redirecting to login due to session-cookie mismatch");
            return redirect()->route('login');
        }

        Log::info("CheckExternalAuth: No issues found, proceeding with request");

        return $next($request);
    }


    private function clearSessionAndCookies(): void
    {
        Log::info('Clearing sessions and cookies', [
            'previous_session' => Session::all()
        ]);

        // Clear specific session keys first
        $keysToForget = ['authID', 'userName', 'userData', 'fldr'];
        foreach ($keysToForget as $key) {
            Session::forget($key);
        }

        // Create cookie forget instances
        $cookies = [
            Cookie::forget('RW_AuthID'),
            Cookie::forget('RW_Fldr'),
            Cookie::forget('RW_UserID')
        ];

        // Queue the cookies to be cleared
        foreach ($cookies as $cookie) {
            Cookie::queue($cookie);
        }

        // Finally flush the entire session
        Session::flush();

        Log::info('Sessions and cookies cleared');
    }
}