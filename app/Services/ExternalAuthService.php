<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;

class ExternalAuthService
{
    private $client;
    private $baseUrl;
    private $sessionId;
    private $userData;
    private const TARGET_IP = '31.193.136.171';

    public function __construct()
    {
        $this->client = new Client([
            'verify' => false,
            'timeout' => 30,
            'allow_redirects' => [
                'max' => 5,
                'strict' => false,
                'referer' => true,
                'protocols' => ['http', 'https'],
                'track_redirects' => true
            ]
        ]);

        // Use IP address directly with HTTPS
        $this->baseUrl = 'https://' . self::TARGET_IP;
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
                'base_url' => $this->baseUrl
            ]);

            $rnd = $this->generateRandomString();
            
            // Create debug output file
            $debugOutput = tmpfile();
            
            $options = [
                'form_params' => [
                    'UserName' => $username,
                    'Password' => $password,
                    'RedirectTo' => "https://www.recruitware.uk/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}",
                ],
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding' => 'gzip, deflate',
                    'Accept-Language' => 'en-US,en;q=0.9',
                    'Host' => 'www.recruitware.uk',
                    'Origin' => 'https://www.recruitware.uk',
                    'Referer' => 'https://www.recruitware.uk/names.nsf?login',
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                ],
                'verify' => false,
                'timeout' => 30,
                'connect_timeout' => 10,
                'curl' => [
                    CURLOPT_VERBOSE => true,
                    CURLOPT_STDERR => $debugOutput,
                    CURLINFO_HEADER_OUT => true,
                    CURLOPT_FAILONERROR => false,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_TCP_NODELAY => true,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_MAXREDIRS => 5
                ]
            ];

            try {
                $response = $this->client->post("http://" . self::TARGET_IP . "/names.nsf?login", $options);
                
                // Read debug output
                fseek($debugOutput, 0);
                $curlDebug = fread($debugOutput, 8192);
                fclose($debugOutput);

                Log::info('ExternalAuthService: Response received', [
                    'status_code' => $response->getStatusCode(),
                    'headers' => $response->getHeaders(),
                    'curl_debug' => $curlDebug
                ]);

            } catch (GuzzleException $e) {
                fseek($debugOutput, 0);
                $curlDebug = fread($debugOutput, 8192);
                fclose($debugOutput);

                Log::error('ExternalAuthService: Request failed', [
                    'error_message' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'curl_debug' => $curlDebug
                ]);

                throw $e;
            }

            $cookies = $response->getHeader('Set-Cookie');
            
            Log::info('ExternalAuthService: Processing cookies', [
                'cookies_received' => $cookies
            ]);
                
            $this->sessionId = null;
            foreach ($cookies as $cookie) {
                if (strpos($cookie, 'DomAuthSessId') !== false) {
                    preg_match('/DomAuthSessId=([^;]+)/', $cookie, $matches);
                    if (isset($matches[1])) {
                        $this->sessionId = $matches[1];
                        Log::info('ExternalAuthService: Session ID found', [
                            'session_id_length' => strlen($this->sessionId)
                        ]);
                        break;
                    }
                }
            }

            if ($this->sessionId) {
                return $this->postLogin($username, $password);
            }

            Log::error('ExternalAuthService: Login failed - No session ID', [
                'cookies_received' => $cookies,
                'response_status' => $response->getStatusCode(),
                'response_headers' => $response->getHeaders()
            ]);
            return null;

        } catch (GuzzleException $e) {
            Log::error('ExternalAuthService: Login exception', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    public function postLogin($username, $password)
    {
        try {
            $rnd = $this->generateRandomString();
            $redirectTo = "https://www.recruitware.uk/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

            // Create debug output file
            $debugOutput = tmpfile();
            
            $options = [
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
                    'Host' => 'www.recruitware.uk',
                    'Origin' => 'https://www.recruitware.uk',
                    'Referer' => 'https://www.recruitware.uk/names.nsf?login',
                    'Cookie' => 'DomAuthSessId=' . $this->sessionId,
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                ],
                'verify' => false,
                'timeout' => 30,
                'connect_timeout' => 10,
                'curl' => [
                    CURLOPT_VERBOSE => true,
                    CURLOPT_STDERR => $debugOutput,
                    CURLINFO_HEADER_OUT => true,
                    CURLOPT_FAILONERROR => false,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_TCP_NODELAY => true,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_MAXREDIRS => 5
                ]
            ];

            Log::info('ExternalAuthService: Sending postLogin request', [
                'session_id' => $this->sessionId,
                'request_url' => "http://" . self::TARGET_IP . "/names.nsf?login"
            ]);

            try {
                $response = $this->client->post("http://" . self::TARGET_IP . "/names.nsf?login", $options);
                
                // Read debug output
                fseek($debugOutput, 0);
                $curlDebug = fread($debugOutput, 8192);
                fclose($debugOutput);

                $body = $response->getBody()->getContents();

                Log::info('ExternalAuthService: PostLogin response received', [
                    'status_code' => $response->getStatusCode(),
                    'headers' => $response->getHeaders(),
                    'curl_debug' => $curlDebug,
                    'body_length' => strlen($body)
                ]);

                $this->userData = $this->parseUserData($body);

                if ($this->sessionId && $this->userData) {
                    Log::info('ExternalAuthService: PostLogin successful', [
                        'user_data_keys' => array_keys($this->userData)
                    ]);

                    $this->setSessionAndCookies($username);
                    return redirect()->intended('/dashboard');
                }

            } catch (GuzzleException $e) {
                fseek($debugOutput, 0);
                $curlDebug = fread($debugOutput, 8192);
                fclose($debugOutput);

                Log::error('ExternalAuthService: PostLogin request failed', [
                    'error_message' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'curl_debug' => $curlDebug
                ]);

                throw $e;
            }

            Log::error('ExternalAuthService: PostLogin failed - Invalid response data', [
                'has_session_id' => !empty($this->sessionId),
                'has_user_data' => !empty($this->userData),
                'response_status' => $response->getStatusCode(),
                'response_headers' => $response->getHeaders(),
                'body_excerpt' => substr($body, 0, 500)
            ]);

            return null;

        } catch (GuzzleException $e) {
            Log::error('ExternalAuthService: PostLogin exception', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    private function parseUserData($html)
    {
        try {
            // Extract user data from HTML response
            $userData = [];
            
            // Add your parsing logic here based on the HTML structure
            // This is a placeholder - implement according to your HTML structure
            if (preg_match('/userdata=(.*?)&/i', $html, $matches)) {
                $userData['data'] = $matches[1];
            }

            Log::info('ExternalAuthService: Parsed user data', [
                'data_found' => !empty($userData)
            ]);

            return $userData;
        } catch (\Exception $e) {
            Log::error('ExternalAuthService: Error parsing user data', [
                'message' => $e->getMessage(),
                'html_excerpt' => substr($html, 0, 500)
            ]);
            return null;
        }
    }

    private function setSessionAndCookies($username)
    {
        try {
            // Set session data
            Session::put('authID', $this->sessionId);
            Session::put('userName', $username);
            Session::put('userData', $this->userData);
            
            // Set cookies
            Cookie::queue('RW_AuthID', $this->sessionId, 60);
            Cookie::queue('RW_UserID', $username, 60);
            
            Log::info('ExternalAuthService: Session and cookies set', [
                'username' => $username,
                'session_id' => $this->sessionId
            ]);
        } catch (\Exception $e) {
            Log::error('ExternalAuthService: Error setting session/cookies', [
                'message' => $e->getMessage()
            ]);
        }
    }
}