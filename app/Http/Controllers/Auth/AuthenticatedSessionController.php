<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ExternalAuthService;
use App\Services\AuthLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function destroy(Request $request): RedirectResponse
    {
        dd("Hello world!");
        try {
            Log::info('Starting logout process', [
                'session_id' => Session::getId(),
                'has_session' => Session::has('authID')
            ]);

            // Perform external service logout
            if ($this->externalAuthService) {
                $this->externalAuthService->logout();
            }

            // Clear all session data
            Session::forget(['authID', 'userName', 'userData', 'fldr']);
            Session::invalidate();
            Session::regenerateToken();
            
            // Clear specific cookies
            $response = redirect()->route('login');
            $response->cookie(Cookie::forget('RW_AuthID'));
            $response->cookie(Cookie::forget('RW_Fldr'));
            $response->cookie(Cookie::forget('RW_UserID'));

            return $response;

        } catch (\Exception $e) {
            Log::error('Logout error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}