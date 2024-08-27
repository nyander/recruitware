<?php

namespace App\Services;

use App\Http\Controllers\CandidateController;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Psy\Readline\Hoa\Console;

class ExternalAuthService
{
    protected $client;
    protected $cookieJar;

    protected $baseUrl;

    protected $sessionId;

    protected $userData;

    protected $candidateService;

    protected $candidateController;

    public function __construct(CandidateService $candidateService, CandidateController $candidateController)
    {
        $this->candidateService = $candidateService;
        $this->candidateController = $candidateController;
        $this->baseUrl = config('services.external_auth.base_url', 'https://www.recruitware.uk');
        $this->cookieJar = new CookieJar();
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 30.0,
            'cookies' => $this->cookieJar,
            'verify' => false, // Only for testing, enable in production
        ]);
    }

    public function login($username, $password)
    {
        try {
            $rnd = $this->generateRandomString();
            $redirectTo = "https://www.recruitware.uk/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

            $initialBody = null;
            $finalResponse = null;

            $response = $this->client->post('https://www.recruitware.uk/names.nsf?login', [
                'form_params' => [
                    'UserName' => $username,
                    'Password' => $password,
                    'RedirectTo' => $redirectTo,
                ],
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36',
                ],
                'allow_redirects' => false, // Prevent automatic redirects
            ]);

            // Use the final response for getting cookies
            $cookies = $finalResponse ? $finalResponse->getHeader('Set-Cookie') : $response->getHeader('Set-Cookie');
            
            $this->sessionId = null;
            foreach ($cookies as $cookie) {
                if (strpos($cookie, 'DomAuthSessId') !== false) {
                    preg_match('/DomAuthSessId=([^;]+)/', $cookie, $matches);
                    if (isset($matches[1])) {
                        $this->sessionId = $matches[1];
                        break;
                    }
                }
            }

            if($this->sessionId) {
                return $this->postLogin($username, $password);
            }

            Log::error('ExternalAuthService: Login failed', ['username' => $username]);
            return null;


        } catch (GuzzleException $e) {
            Log::error('ExternalAuthService: Login exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    public function postLogin($username, $password)
    {
        try {
            $rnd = $this->generateRandomString();
            $redirectTo = "https://www.recruitware.uk/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

            $initialBody = null;
            $finalResponse = null;

            $response = $this->client->post('https://www.recruitware.uk/names.nsf?login', [
                'form_params' => [
                    'UserName' => $username,
                    'Password' => $password,
                    'RedirectTo' => $redirectTo,
                ],
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36',
                ],
                'allow_redirects' => true,
            ]);

            // Use the final response for getting cookies

            // Use the initial body for parsing user data
            $body = $initialBody ?? $response->getBody()->getContents();
            Log::info('ExternalAuthService: Login response received', ['status' => $response->getStatusCode(), 'body' => $body]);
            
            $this->userData = $this->parseUserData($body);

            if (empty($this->userData)) {
                Log::error('ExternalAuthService: Failed to parse user data', ['username' => $username]);
                return null;
            }

            
    
            // Store user data in session
            Session::put('userData', $this->userData);
            
            // Next phase check the last page which user was at.

            //if not last page, then redirect to the dashboard


            if ($this->sessionId && $this->userData) {
                $this->setSessionAndCookies($username);
                return $this->userData;
            }

            return null;

        } catch (GuzzleException $e) {
            Log::error('ExternalAuthService: Login exception', ['message' => $e->getMessage()]);
            return null;
        } catch (\Exception $e) {
            Log::error('ExternalAuthService: Unexpected error', ['message' => $e->getMessage()]);
            return null;
        }
    }

    protected function parseLoginResponse($response)
    {
        $user = [];
        $arrel = explode('~END~', $response);
        $i1 = 0;
        $ck = '';

        foreach ($arrel as $val) {
            if ($i1 > 0) {
                $a1 = preg_split('/\|/', $val);
                $user[trim($a1[0])] = trim(join('|', array_slice($a1, 1)));
            } else {
                $a1 = preg_split('/DomAuthSessId=/', $val);
                if (count($a1) > 1) {
                    $a1 = preg_split('/;/', $a1[1]);
                    $ck = 'DomAuthSessId=' . $a1[0];
                }
            }
            $i1++;
        }

        if (!empty($ck)) {
            Session::put('authID', $ck);
            $user['session_cookie'] = $ck;
        }

        return $user;
    }

    protected function setSessionAndCookies($username)
    {
        Cookie::queue('RW_AuthID', $this->sessionId, 30);
        Cookie::queue('RW_Fldr', $this->userData['ApplicationFolder'] ?? 'demo', 30);
        Cookie::queue('RW_UserID', $username, 30);

        Session::put('authID', $this->sessionId);
        Session::put('userName', $username);
        Session::put('userData', $this->userData);
        Session::put('fldr', $this->userData['ApplicationFolder'] ?? 'demo');

        $d = strtotime("today");
        if (request()->has('dt')) {
            $d = strtotime(str_replace('/', '-', request()->input('dt')));
        }
        Session::put('navdate', date("d/m/Y", $d));

        $end_week = strtotime("next saturday", $d);
        $end = date("d/m/Y", $end_week);
        Session::put('weekending', $end);
    }

    public function getUserSettings($Ty)
    {

        
        $url = $this->baseUrl .'//'. $this->userData['ApplicationFolder'] . '/profiles.nsf/ag.getprsetts?openagent&' . $this->generateRandomString() . '|' . $this->userData['UserName'] . '|' . $Ty;
        $args = [
            'url' => $url,
            'data-type' => 'Settings',
            'return-type' => 'Fields',
        ];

        $this->getDataUrl($args);
    }

    public function getDataUrl($args)
    {

        $ck = $this->sessionId;
        $url = preg_replace('/\[FLDR\]/', $this->userData['ApplicationFolder'], $args['url']);
        $url = preg_replace('/\[RND\]/', $this->generateRandomString(), $url);
        $url = $args['url'];
        $data = isset($args['data']) ? $args['data'] : '';
        // $data = preg_replace('/\[WKEND\]/', Session::get('weekending'), $data); -> weekend is usually sunday of the week
        // $data = preg_replace('/\[NAVDATE\]/', Session::get('navdate'), $data);

        $response = $this->client->request('GET', $url, [
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36',
                'Cookie' => $ck,
            ],
        ]);
        $resp = $response->getBody()->getContents();
        
        $resp = str_replace(["
        ", "
        "], '', $resp);
        $arrel = explode('~END~', $resp);
        $i1 = 0;
        $rList = [];

        dd($url,$resp);

        if ($args['return-type'] == 'View') {
            $rList = preg_split('/;/', $args['return-list']);
        }

        $vData = [];

        foreach ($arrel as $val) {
            if ($i1 > 0) {
                if ($args['return-type'] == 'View') {
                    $a1 = preg_split('/\|/', $val);
                    if (count($a1) > 2) {
                        $docId = $a1[count($a1) - 1];
                        $vData[$docId] = array_combine(array_map('trim', $rList), $a1);
                        $vData[$docId]['DocID'] = $docId;
                    }
                } elseif ($args['return-type'] == 'Fields') {
                    if (strpos($val, '#@#') > 1) {
                        $a1 = preg_split('/#@#/', $val);
                        if ($args['data-type'] == 'Settings') {
                            $vSetts[$a1[0]] = $a1[1];
                        } else {
                            $vData[$a1[0]] = $a1[1];
                        }
                    }
                } elseif ($args['return-type'] == 'Doc') {
                    if (strpos($val, '|') > 1) {
                        $a1 = preg_split('/\|/', $val);
                        $vData[strtolower($a1[0])] = $a1[1];
                    }
                }
            }
            $i1++;
        }

        // Return or store $vData as needed
        return $vData;
//         $ck = $this->sessionId;
//         $url = preg_replace('/\[FLDR\]/', Session::get('fldr'), $args['url']);
//         $url = preg_replace('/\[RND\]/', $this->generateRandomString(), $url);
//         $data = isset($args['data']) ? $args['data'] : '';
//         $data = preg_replace('/\[WKEND\]/', Session::get('weekending'), $data);
//         $data = preg_replace('/\[NAVDATE\]/', Session::get('navdate'), $data);

//         $response = $this->client->request('GET', $url, [
//             'headers' => [
//                 'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36',
//                 'Cookie' => $ck,
//             ],
//         ]);

//         $resp = $response->getBody()->getContents();
//         $resp = str_replace(["
// ", "
// "], '', $resp);
//         $arrel = explode('~END~', $resp);
//         $i1 = 0;
//         $rList = [];

//         if ($args['return-type'] == 'View') {
//             $rList = preg_split('/;/', $args['return-list']);
//         }

//         $vData = [];

//         foreach ($arrel as $val) {
//             if ($i1 > 0) {
//                 if ($args['return-type'] == 'View') {
//                     $a1 = preg_split('/\|/', $val);
//                     if (count($a1) > 2) {
//                         $docId = $a1[count($a1) - 1];
//                         $vData[$docId] = array_combine(array_map('trim', $rList), $a1);
//                         $vData[$docId]['DocID'] = $docId;
//                     }
//                 } elseif ($args['return-type'] == 'Fields') {
//                     if (strpos($val, '#@#') > 1) {
//                         $a1 = preg_split('/#@#/', $val);
//                         if ($args['data-type'] == 'Settings') {
//                             $vSetts[$a1[0]] = $a1[1];
//                         } else {
//                             $vData[$a1[0]] = $a1[1];
//                         }
//                     }
//                 } elseif ($args['return-type'] == 'Doc') {
//                     if (strpos($val, '|') > 1) {
//                         $a1 = preg_split('/\|/', $val);
//                         $vData[strtolower($a1[0])] = $a1[1];
//                     }
//                 }
//             }
//             $i1++;
//         }

//         // Return or store $vData as needed
//         return $vData;

        
    }

    protected function generateRandomString($length = 10)
    {
        return substr(str_shuffle(md5(microtime())), 0, $length);
    }

    private function parseUserData($content) {
        $lines = explode("~END~", $content);
        $userData = [];
    
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
    
            // Check if the line contains a '|' character
            if (strpos($line, '|') !== false) {
                list($key, $value) = explode('|', $line, 2);
                $key = trim($key);
                $value = trim($value);
    
                if (strpos($value, ';') !== false && strpos($key, '_Access') !== false) {
                    // This is an _Access field with multiple values
                    $userData[$key] = explode(';', $value);
                    // Trim each value in the array
                    $userData[$key] = array_map('trim', $userData[$key]);
                } else {
                    $userData[$key] = $value;
                }
            } else {
                // If there's no '|', treat the whole line as a value with a numeric key
                $userData[] = $line;
            }
        }
    
        return $userData;
    }
}
