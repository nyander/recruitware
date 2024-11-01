<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ExternalAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ExternalAuthController extends Controller
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
    }

    public function logout(Request $request)
    {
        
        Log::info('External logout endpoint hit', [
            'request_method' => $request->method(),
            'request_path' => $request->path(),
            'request_headers' => $request->headers->all()
        ]);

        try {
            // Call external logout
            $this->externalAuthService->logout();

           
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            Log::info('Logout successful');

            return redirect('/');

        } catch (\Exception $e) {
            Log::error('Logout failed', ['error' => $e->getMessage()]);
            return response()
                ->json(['message' => 'Logout failed', 'error' => $e->getMessage()], 500);
        }
    }
}