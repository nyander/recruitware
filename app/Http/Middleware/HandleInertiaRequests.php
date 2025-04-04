<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Session;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $isLoggedIn = Session::has('authID') && Session::has('userData');
        $userData = Session::get('userData', []);

        return [
            ...parent::share($request),
            'fldr' => Session::get('fldr'),
            'auth' => [
                'user' => $isLoggedIn ? [
                    'name' => $userData['FullName'] ?? $userData['UserName'] ?? '',
                    'email' => $userData['Email'] ?? '',
                    'role' => $userData['DefaultRole'] ?? '',
                ] : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}