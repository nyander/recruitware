<?php

namespace App\Guards;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use App\Services\ExternalAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;


class ExternalGuard implements Guard
{
    protected $provider;
    protected $user;
    protected $externalAuthService;
    protected $request;

    public function __construct(UserProvider $provider, ExternalAuthService $externalAuthService, Request $request)
    {
        $this->provider = $provider;
        $this->externalAuthService = $externalAuthService;
        $this->request = $request;
    }

    public function check()
    {
        return $this->user() !== null;
    }

    public function guest()
    {
        return !$this->check();
    }

    public function user()
    {
        if ($this->user !== null) {
            return $this->user;
        }

        // Check if we have user data in the session
        if (Session::has('userData')) {
            $userData = Session::get('userData');
            
            // Create a user object from the session data
            $this->user = new class($userData) implements Authenticatable {
                protected $userData;

                public function __construct($userData)
                {
                    $this->userData = $userData;
                }

                public function getAuthIdentifierName()
                {
                    return 'UserName';
                }

                public function getAuthIdentifier()
                {
                    return $this->userData['UserName'] ?? null;
                }

                public function getAuthPassword()
                {
                    return ''; // External auth, so we don't store passwords
                }

                public function getRememberToken()
                {
                    return null; // Implement if you need "remember me" functionality
                }

                public function setRememberToken($value)
                {
                    // Implement if you need "remember me" functionality
                }

                public function getRememberTokenName()
                {
                    return null; // Implement if you need "remember me" functionality
                }

                // Add any other methods you need to access user data
                public function getAttribute($key)
                {
                    return $this->userData[$key] ?? null;
                }
            };

            return $this->user;
        }

        // If we don't have user data in the session, we might need to fetch it from the external service
        // This depends on how your external authentication system works
        // For example, you might have a token stored in the session that you can use to fetch user data

        if (Session::has('authToken')) {
            $token = Session::get('authToken');
            $userData = $this->externalAuthService->getUserDataByToken($token);
            if ($userData) {
                Session::put('userData', $userData);
                return $this->user();  // Recursive call to create user from session
            }
        }

        return null;
    }

    public function id()
    {   
        if ($user = $this->user()) {
            return $user->getAuthIdentifier();
        }
    }

    public function validate(array $credentials = [])
    {
        return $this->externalAuthService->login($credentials['username'], $credentials['password']) !== null;
    }

    public function setUser(Authenticatable $user)
    {
        $this->user = $user;
        return $this;
    }

    // Add this new method
    public function hasUser()
    {
        return $this->user() !== null;
    }
}