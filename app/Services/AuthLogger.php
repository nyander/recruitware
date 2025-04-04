<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Request;

class AuthLogger
{
    /**
     * Log the current authentication status including session and cookie data
     */
    public static function logAuthStatus()
    {
        $sessionData = [
            'authID' => Session::has('authID'),
            'userName' => Session::has('userName'),
            'userData' => Session::has('userData'),
            'fldr' => Session::has('fldr'),
        ];

        $cookieData = [
            'RW_AuthID' => Cookie::has('RW_AuthID'),
            'RW_Fldr' => Cookie::has('RW_Fldr'),
            'RW_UserID' => Cookie::has('RW_UserID'),
        ];

        // Add actual values for debugging (be careful with sensitive data in production)
        $sessionValues = [
            'authID' => Session::get('authID'),
            'userName' => Session::get('userName'),
            'fldr' => Session::get('fldr'),
            // Omit sensitive userData details
        ];

        $cookieValues = [
            'RW_AuthID' => Cookie::get('RW_AuthID'),
            'RW_Fldr' => Cookie::get('RW_Fldr'),
            'RW_UserID' => Cookie::get('RW_UserID'),
        ];

        Log::info('Auth Status Check', [
            'timestamp' => now()->toDateTimeString(),
            'session_exists' => $sessionData,
            'session_values' => $sessionValues,
            'cookie_exists' => $cookieData,
            'cookie_values' => $cookieValues,
            'session_id' => Session::getId(),
            'request_method' => Request::method(),
            'request_path' => Request::path(),
            'request_url' => Request::url(),
        ]);
    }

    /**
     * Log authentication failures
     */
    public static function logAuthFailure($reason, $context = [])
    {
        $sessionData = Session::all();
        // Remove sensitive data
        unset($sessionData['userData']);

        Log::warning('Authentication Failure', [
            'timestamp' => now()->toDateTimeString(),
            'reason' => $reason,
            'context' => $context,
            'session_id' => Session::getId(),
            'current_session_data' => $sessionData,
            'request_info' => [
                'method' => Request::method(),
                'path' => Request::path(),
                'url' => Request::url(),
            ]
        ]);
    }

    /**
     * Log successful authentication
     */
    public static function logAuthSuccess($username)
    {
        Log::info('Authentication Success', [
            'timestamp' => now()->toDateTimeString(),
            'username' => $username,
            'session_id' => Session::getId(),
            'request_info' => [
                'method' => Request::method(),
                'path' => Request::path(),
            ]
        ]);
    }

    /**
     * Log logout events
     */
    public static function logLogout($username = null)
    {
        $sessionData = Session::all();
        // Remove sensitive data
        unset($sessionData['userData']);

        Log::info('User Logout', [
            'timestamp' => now()->toDateTimeString(),
            'username' => $username ?? Session::get('userName'),
            'session_id' => Session::getId(),
            'session_data_before_logout' => $sessionData,
            'cookies_before_logout' => [
                'RW_AuthID' => Cookie::has('RW_AuthID'),
                'RW_Fldr' => Cookie::has('RW_Fldr'),
                'RW_UserID' => Cookie::has('RW_UserID'),
            ],
            'request_info' => [
                'method' => Request::method(),
                'path' => Request::path(),
                'url' => Request::url(),
            ]
        ]);
    }

    /**
     * Log logout completion
     */
    public static function logLogoutComplete($success = true)
    {
        Log::info('Logout Process Complete', [
            'timestamp' => now()->toDateTimeString(),
            'success' => $success,
            'remaining_session_data' => Session::all(),
            'remaining_cookies' => [
                'RW_AuthID' => Cookie::has('RW_AuthID'),
                'RW_Fldr' => Cookie::has('RW_Fldr'),
                'RW_UserID' => Cookie::has('RW_UserID'),
            ],
            'session_id' => Session::getId(),
        ]);
    }

    /**
     * Log session clearing
     */
    public static function logSessionClearing()
    {
        Log::info('Clearing Session Data', [
            'timestamp' => now()->toDateTimeString(),
            'session_data_before_clear' => Session::all(),
            'cookies_before_clear' => [
                'RW_AuthID' => Cookie::has('RW_AuthID'),
                'RW_Fldr' => Cookie::has('RW_Fldr'),
                'RW_UserID' => Cookie::has('RW_UserID'),
            ],
            'session_id' => Session::getId(),
        ]);
    }

    /**
     * Log CSRF token information
     */
    public static function logCsrfInfo()
    {
        Log::info('CSRF Token Information', [
            'timestamp' => now()->toDateTimeString(),
            'token_present' => Session::has('_token'),
            'session_id' => Session::getId(),
            'request_has_token' => Request::hasHeader('X-CSRF-TOKEN'),
        ]);
    }
}