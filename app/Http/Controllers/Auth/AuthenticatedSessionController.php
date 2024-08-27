<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\ExternalAuthService;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;  // Add this line
use Illuminate\Validation\ValidationException;
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

        $credentials = $request->only('username', 'password');

        if (Auth::guard('external')->attempt($credentials)) {
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
        // You might need to call a logout method on your ExternalAuthService if required
        $this->externalAuthService->logout();

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}