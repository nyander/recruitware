<?php

namespace App\Providers;

use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use App\Services\ExternalAuthService;

class ExternalUserProvider implements UserProvider
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
    }

    public function retrieveById($identifier)
    {
        // Implement this method to retrieve a user by their ID
        // You might need to add a method to your ExternalAuthService for this
        return $this->externalAuthService->getUserById($identifier);
    }

    public function retrieveByToken($identifier, $token)
    {
        // This method is typically used for "remember me" functionality
        // If you don't need this, you can return null
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        // This method is typically used for "remember me" functionality
        // If you don't need this, you can leave it empty
    }

    public function retrieveByCredentials(array $credentials)
    {
        // This method is called when attempting to authenticate a user
        if (empty($credentials['username'])) {
            return null;
        }

        // You might need to adjust this based on how your ExternalAuthService works
        return $this->externalAuthService->getUserByUsername($credentials['username']);
    }

    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        // This method should return true if the provided credentials are valid for the user
        return $this->externalAuthService->login($credentials['username'], $credentials['password']) !== null;
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): ?Authenticatable
    {
        // Since this is an external authentication system, we don't need to rehash passwords.
        // Just return the user as-is.
        return $user;
    }
}