<?php

namespace App\Guards;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use App\Services\ExternalAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Redirect;

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
            return $this->createUserFromSession(Session::get('userData'));
        }

        // dd("hello world");

        //if session has timed out:
        // if (Session::has('userData') && Session::has('last_activity')) {
        //     $lastActivity = Session::get('last_activity');
        //     $sessionTimeout = config('session.lifetime') * 60; // Convert minutes to seconds
    
        //     if (time() - $lastActivity > $sessionTimeout) {
        //         // Session has expired
        //         Session::flush();
        //         return null;
        //     }
    
        //     // Update last activity time
        //     Session::put('last_activity', time());
    
        //     return $this->createUserFromSession(Session::get('userData'));
        // }

        // Check if we have the authentication cookie
        $authId = Cookie::get('RW_AuthID');
        if ($authId && Session::get('authID') === $authId) {
            // We have a valid auth cookie, but no user data in session
            // This might happen if the session expired but the cookie is still valid
            // You might want to implement a re-authentication process here in the future
            return null;
        }

        return null;
    }

    protected function createUserFromSession($userData)
    {
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

            public function getAuthPasswordName()
            {
                return 'password'; // This is the new method we need to implement
            }

            public function getRememberToken()
            {
                return null;
            }

            public function setRememberToken($value)
            {
            }

            public function getRememberTokenName()
            {
                return null;
            }

            public function getAttribute($key)
            {
                return $this->userData[$key] ?? null;
            }
        };

        return $this->user;
    }

    public function id()
    {   
        if ($user = $this->user()) {
            return $user->getAuthIdentifier();
        }
    }

    public function validate(array $credentials = [])
    {
        $userData = $this->externalAuthService->login($credentials['username'], $credentials['password']);
        if ($userData) {
            $user = $this->createUserFromSession($userData);
            $this->setUser($user);
            return true;
        }
        return false;
    }

    public function setUser(Authenticatable $user)
    {
        $this->user = $user;
        return $this;
    }

    public function hasUser()
    {
        return $this->user() !== null;
    }

    public function attempt(array $credentials = [])
    {
        // dd("hello world");
        if ($this->validate($credentials)) {
            // Authentication successful, redirect to candidates/live
            return Redirect::to(route('candidates.live'));
        }
        return false;
    }
}