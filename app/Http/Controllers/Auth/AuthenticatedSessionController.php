<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ExternalAuthService;
use App\Services\AuthLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
        
        // Instead of using middleware()->except, use this syntax:
        $this->except = ['destroy'];
    }

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        AuthLogger::logAuthStatus(); // Log initial state
        
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $userData = $this->externalAuthService->login($credentials['username'], $credentials['password']);

        if (!$userData) {
            AuthLogger::logAuthFailure('Invalid credentials');
            return back()->withErrors([
                'username' => 'The provided credentials do not match our records.',
            ]);
        }

        // Session is set in ExternalAuthService, but we can verify it here
        if (!Session::has('authID') || !Session::has('userData')) {
            AuthLogger::logAuthFailure('Missing session data after login');
            return back()->withErrors([
                'username' => 'Authentication failed. Please try again.',
            ]);
        }

        AuthLogger::logAuthSuccess($credentials['username']);
        return redirect()->intended(route('dashboard'));
    }

    // AuthenticatedSessionController.php
    // app/Http/Controllers/Auth/AuthenticatedSessionController.php
    // AuthenticatedSessionController.php

    public function destroy(Request $request)
    {
        // Call the ExternalAuthService's logout method
        $this->externalAuthService->logout();
        
        // Clear Laravel's session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Clear cookies related to Laravel and external authentication
        Cookie::queue(Cookie::forget('laravel_session'));
        Cookie::queue(Cookie::forget('XSRF-TOKEN'));
        Cookie::queue(Cookie::forget('RW_AuthID'));
        Cookie::queue(Cookie::forget('RW_UserID'));
        Cookie::queue(Cookie::forget('RW_Fldr'));

        // Redirect to the login page
        return redirect('/login');
    }


}