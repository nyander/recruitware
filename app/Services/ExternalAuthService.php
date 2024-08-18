<?php

namespace App\Services;

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

    public function __construct()
    {
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
            $redirectTo = urlencode("/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}");

            $response = $this->client->post('names.nsf?login', [
                'form_params' => [
                    'UserName' => $username,
                    'Password' => $password,
                    'RedirectTo' => $redirectTo,
                ],
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36',
                ],
            ]);

            
            

            $body = $response->getBody()->getContents();
            Log::info('ExternalAuthService: Login response received', ['status' => $response->getStatusCode()]);

            $user = $this->parseLoginResponse($body);

            if ($user) {
                $this->setSessionAndCookies($user, $username);
                Log::info('ExternalAuthService: Login successful', ['username' => $username]);
                return $user;
            }

            Log::error('ExternalAuthService: Login failed', ['username' => $username]);
            return null;

        } catch (GuzzleException $e) {
            Log::error('ExternalAuthService: Login exception', ['message' => $e->getMessage()]);
            dd($e);
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

    protected function setSessionAndCookies($user, $username)
    {
        $ck = $user['session_cookie'] ?? '';
        $fldr = $user['ApplicationFolder'] ?? 'demo';

        Cookie::queue('RW_AuthID', $ck, 30);
        Cookie::queue('RW_Fldr', $fldr, 30);
        Cookie::queue('RW_UserID', $username, 30);

        Session::put('authID', $ck);
        Session::put('userName', $username);
        Session::put('userData', $user);
        Session::put('fldr', $fldr);

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
        $url = $this->baseUrl . '/' . Session::get('fldr') . '/profiles.nsf/ag.getprsetts?openagent&' . $this->generateRandomString() . '|' . Session::get('userName') . '|' . $Ty;

        $args = [
            'url' => $url,
            'data-type' => 'Settings',
            'return-type' => 'Fields',
        ];

        $this->getDataUrl($args);
    }

    public function getDataUrl($args)
    {
        $ck = Session::get('authID');
        $url = preg_replace('/\[FLDR\]/', Session::get('fldr'), $args['url']);
        $url = preg_replace('/\[RND\]/', $this->generateRandomString(), $url);
        $data = isset($args['data']) ? $args['data'] : '';
        $data = preg_replace('/\[WKEND\]/', Session::get('weekending'), $data);
        $data = preg_replace('/\[NAVDATE\]/', Session::get('navdate'), $data);

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
    }

    protected function generateRandomString($length = 10)
    {
        return substr(str_shuffle(md5(microtime())), 0, $length);
    }
}
