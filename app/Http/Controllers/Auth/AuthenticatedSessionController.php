<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\ExternalAuthService;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;  // Add this line
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
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
    public function store(LoginRequest $request): RedirectResponse
    {
        // Log::info('AuthenticatedSessionController: Login attempt', ['username' => $request->input('username')]);

        // $result = $this->externalAuthService->login($request->input('username'), $request->input('password'));

        // if ($result) {
        //     $request->session()->regenerate();
        //     return redirect()->intended(route('dashboard'));
        // }

        // Log::warning('AuthenticatedSessionController: Authentication failed', ['username' => $request->input('username')]);
        // throw ValidationException::withMessages([
        //     'username' => __('auth.failed'),
        // ]);

        $result = $this->externalAuthService->login($request->input('username'), $request->input('password'));

        if ($result) {
            $request->session()->regenerate();

            
            return redirect()->intended(route('candidates.live'));
        }
    
        return back()->withErrors([
            'username' => __('auth.failed'),
        ]);
    }
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        dd("Logging out");
        $this->externalAuthService->logout();
        // Clear the session data set by ExternalAuthService
        Session::forget('authID');
        Session::forget('userName');
        Session::forget('userData');
        Session::forget('fldr');
        Session::forget('navdate');
        Session::forget('weekending');

        // Clear cookies set by ExternalAuthService
        Cookie::queue(Cookie::forget('RW_AuthID'));
        Cookie::queue(Cookie::forget('RW_Fldr'));
        Cookie::queue(Cookie::forget('RW_UserID'));

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}