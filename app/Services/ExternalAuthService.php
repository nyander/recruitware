<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Config;

class ExternalAuthService
{
    private $client;
    private $baseUrl;
    private $sessionId;
    private $userData;
    private $config;

    public function __construct()
    {
        $this->initializeConfig();
        $this->initializeClient();
        
        Log::info('ExternalAuthService: Initialized', [
            'environment' => app()->environment(),
            'base_url' => $this->baseUrl,
            'config' => array_diff_key($this->config, ['password' => true])
        ]);
    }

    private function initializeConfig()
    {
        $isProduction = app()->environment('production');
        
        $this->config = [
            'target_ip' => '31.193.136.171',
            'target_host' => 'www.recruitware.uk',
            'use_ip' => $isProduction, // Use IP in production, domain in local
            'protocol' => $isProduction ? 'http' : 'https',
            'timeout' => $isProduction ? 30 : 60,
            'connect_timeout' => $isProduction ? 10 : 20,
            'verify_ssl' => !$isProduction,
            'max_redirects' => 5,
            'curl_verbose' => env('CURLOPT_VERBOSE', true),
            'ssl_version' => CURL_SSLVERSION_TLSv1_2,
            'ssl_cipher_list' => env('CURLOPT_SSL_CIPHER_LIST', 'DEFAULT'),
        ];

        // Set base URL based on environment
        if ($isProduction && $this->config['use_ip']) {
            $this->baseUrl = "{$this->config['protocol']}://{$this->config['target_ip']}";
        } else {
            $this->baseUrl = env('EXTERNAL_AUTH_BASE_URL', 'https://www.recruitware.uk');
        }
    }

    private function initializeClient()
    {
        $this->client = new Client([
            'verify' => $this->config['verify_ssl'],
            'timeout' => $this->config['timeout'],
            'allow_redirects' => [
                'max' => $this->config['max_redirects'],
                'strict' => false,
                'referer' => true,
                'protocols' => ['http', 'https'],
                'track_redirects' => true
            ],
            'curl' => [
                CURLOPT_SSLVERSION => $this->config['ssl_version'],
                CURLOPT_SSL_CIPHER_LIST => $this->config['ssl_cipher_list'],
                CURLOPT_VERBOSE => $this->config['curl_verbose'],
                CURLOPT_SSL_VERIFYPEER => $this->config['verify_ssl'],
                CURLOPT_SSL_VERIFYHOST => $this->config['verify_ssl'] ? 2 : 0,
                CURLOPT_TCP_NODELAY => true,
                CURLOPT_TCP_KEEPALIVE => 1
            ]
        ]);
    }

    private function generateRandomString($length = 10) 
    {
        return bin2hex(random_bytes($length));
    }

    public function login($username, $password)
    {
        try {
            Log::info('ExternalAuthService: Starting login request', [
                'username' => $username,
                'environment' => app()->environment(),
                'base_url' => $this->baseUrl
            ]);

            $rnd = $this->generateRandomString();
            $debugOutput = tmpfile();
            
            $options = $this->buildRequestOptions($username, $password, $rnd, $debugOutput);

            return $this->executeLoginRequest($options, $debugOutput, $username, $password);

        } catch (\Exception $e) {
            Log::error('ExternalAuthService: Login exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'environment' => app()->environment()
            ]);
            return null;
        }
    }

    private function buildRequestOptions($username, $password, $rnd, $debugOutput)
    {
        $redirectTo = "https://{$this->config['target_host']}/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

        return [
            'form_params' => [
                'UserName' => $username,
                'Password' => $password,
                'RedirectTo' => $redirectTo,
            ],
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding' => 'gzip, deflate',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Host' => $this->config['target_host'],
                'Origin' => "https://{$this->config['target_host']}",
                'Referer' => "https://{$this->config['target_host']}/names.nsf?login",
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ],
            'verify' => $this->config['verify_ssl'],
            'timeout' => $this->config['timeout'],
            'connect_timeout' => $this->config['connect_timeout'],
            'curl' => [
                CURLOPT_VERBOSE => true,
                CURLOPT_STDERR => $debugOutput,
                CURLINFO_HEADER_OUT => true,
                CURLOPT_FAILONERROR => false,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_TCP_NODELAY => true
            ]
        ];
    }

    private function executeLoginRequest($options, $debugOutput, $username, $password)
    {
        try {
            $response = $this->client->post($this->baseUrl . '/names.nsf?login', $options);
            
            fseek($debugOutput, 0);
            $curlDebug = fread($debugOutput, 8192);
            fclose($debugOutput);

            Log::info('ExternalAuthService: Response received', [
                'status_code' => $response->getStatusCode(),
                'headers' => $response->getHeaders(),
                'curl_debug' => $curlDebug,
                'environment' => app()->environment()
            ]);

            $cookies = $response->getHeader('Set-Cookie');
            foreach ($cookies as $cookie) {
                if (strpos($cookie, 'DomAuthSessId') !== false) {
                    preg_match('/DomAuthSessId=([^;]+)/', $cookie, $matches);
                    if (isset($matches[1])) {
                        $this->sessionId = $matches[1];
                        return $this->postLogin($username, $password);
                    }
                }
            }

            Log::error('ExternalAuthService: No session ID found', [
                'cookies' => $cookies,
                'environment' => app()->environment()
            ]);
            return null;

        } catch (GuzzleException $e) {
            fseek($debugOutput, 0);
            $curlDebug = fread($debugOutput, 8192);
            fclose($debugOutput);

            Log::error('ExternalAuthService: Request failed', [
                'error' => $e->getMessage(),
                'curl_debug' => $curlDebug,
                'url' => $this->baseUrl . '/names.nsf?login',
                'environment' => app()->environment()
            ]);

            throw $e;
        }
    }

    public function postLogin($username, $password)
    {
        try {
            $rnd = $this->generateRandomString();
            $debugOutput = tmpfile();
            
            $options = $this->buildPostLoginOptions($username, $password, $rnd, $debugOutput);

            return $this->executePostLoginRequest($options, $debugOutput, $username);

        } catch (\Exception $e) {
            Log::error('ExternalAuthService: PostLogin exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'environment' => app()->environment()
            ]);
            return null;
        }
    }

    private function buildPostLoginOptions($username, $password, $rnd, $debugOutput)
    {
        $redirectTo = "https://{$this->config['target_host']}/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

        return [
            'form_params' => [
                'UserName' => $username,
                'Password' => $password,
                'RedirectTo' => $redirectTo,
            ],
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding' => 'gzip, deflate',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Host' => $this->config['target_host'],
                'Origin' => "https://{$this->config['target_host']}",
                'Referer' => "https://{$this->config['target_host']}/names.nsf?login",
                'Cookie' => 'DomAuthSessId=' . $this->sessionId,
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ],
            'verify' => $this->config['verify_ssl'],
            'timeout' => $this->config['timeout'],
            'connect_timeout' => $this->config['connect_timeout'],
            'curl' => [
                CURLOPT_VERBOSE => true,
                CURLOPT_STDERR => $debugOutput,
                CURLINFO_HEADER_OUT => true,
                CURLOPT_FAILONERROR => false,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_TCP_NODELAY => true
            ]
        ];
    }

    private function executePostLoginRequest($options, $debugOutput, $username)
    {
        try {
            $response = $this->client->post($this->baseUrl . '/names.nsf?login', $options);
            
            fseek($debugOutput, 0);
            $curlDebug = fread($debugOutput, 8192);
            fclose($debugOutput);

            $body = $response->getBody()->getContents();

            Log::info('ExternalAuthService: PostLogin response received', [
                'status_code' => $response->getStatusCode(),
                'headers' => $response->getHeaders(),
                'curl_debug' => $curlDebug,
                'body_length' => strlen($body),
                'environment' => app()->environment()
            ]);

            $this->userData = $this->parseUserData($body);

            if ($this->sessionId && $this->userData) {
                $this->setSessionAndCookies($username);
                return redirect()->intended('/dashboard');
            }

            Log::error('ExternalAuthService: PostLogin validation failed', [
                'has_session_id' => !empty($this->sessionId),
                'has_user_data' => !empty($this->userData),
                'environment' => app()->environment()
            ]);

            return null;

        } catch (GuzzleException $e) {
            fseek($debugOutput, 0);
            $curlDebug = fread($debugOutput, 8192);
            fclose($debugOutput);

            Log::error('ExternalAuthService: PostLogin request failed', [
                'error' => $e->getMessage(),
                'curl_debug' => $curlDebug,
                'url' => $this->baseUrl . '/names.nsf?login',
                'environment' => app()->environment()
            ]);

            throw $e;
        }
    }

    private function parseUserData($html)
    {
        try {
            $userData = [];
            
            // Add your HTML parsing logic here
            if (preg_match('/userdata=(.*?)&/i', $html, $matches)) {
                $userData['data'] = $matches[1];
            }

            Log::info('ExternalAuthService: Parsed user data', [
                'data_found' => !empty($userData),
                'environment' => app()->environment()
            ]);

            return $userData;

        } catch (\Exception $e) {
            Log::error('ExternalAuthService: Error parsing user data', [
                'message' => $e->getMessage(),
                'html_excerpt' => substr($html, 0, 500),
                'environment' => app()->environment()
            ]);
            return null;
        }
    }

    private function setSessionAndCookies($username)
    {
        $cookieOptions = [
            'secure' => env('SESSION_SECURE_COOKIE', true),
            'httponly' => true,
            'domain' => env('SESSION_DOMAIN'),
            'path' => env('SESSION_PATH', '/')
        ];

        Session::put('authID', $this->sessionId);
        Session::put('userName', $username);
        Session::put('userData', $this->userData);

        Cookie::queue('RW_AuthID', $this->sessionId, env('SESSION_LIFETIME', 120), $cookieOptions['path'], 
            $cookieOptions['domain'], $cookieOptions['secure'], $cookieOptions['httponly']);
        Cookie::queue('RW_UserID', $username, env('SESSION_LIFETIME', 120), $cookieOptions['path'], 
            $cookieOptions['domain'], $cookieOptions['secure'], $cookieOptions['httponly']);

        Log::info('ExternalAuthService: Session and cookies set', [
            'username' => $username,
            'session_id_length' => strlen($this->sessionId),
            'environment' => app()->environment(),
            'cookie_options' => $cookieOptions
        ]);
    }
}