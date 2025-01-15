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

    protected $url;


    protected $vSetts;

    protected $vData;

    protected $vText;

    public function __construct(CandidateService $candidateService)
{
    $this->candidateService = $candidateService;
    $this->baseUrl = 'http://31.193.136.171'; // Back to using IP address

    $this->cookieJar = new CookieJar();
    $this->client = new Client([
        'base_uri' => $this->baseUrl,
        'cookies' => $this->cookieJar,
        'verify' => false,
        'curl' => [
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_SSLVERSION => CURL_SSLVERSION_TLSv1_2,
            CURLOPT_SSL_CIPHER_LIST => 'DEFAULT@SECLEVEL=1',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_MAXREDIRS => 5,
            // Remove or set to false to disable debug output
            CURLOPT_VERBOSE => false,
            CURLOPT_STDERR => null
        ],
        'headers' => [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept' => '*/*',
            'Connection' => 'keep-alive',
            'Host' => 'www.recruitware.uk'
        ],
        'allow_redirects' => [
            'max' => 5,
            'strict' => false,
            'referer' => true,
            'protocols' => ['http', 'https'],
            'track_redirects' => true
        ],
        'connect_timeout' => 30,
        'timeout' => 30,
        // Set debug to false
        'debug' => false,
        'decode_content' => true,
        'http_errors' => false
    ]);
}

    public function login($username, $password)
    {
        try {
            Log::info('ExternalAuthService: Starting login request', [
                'username' => $username,
                'base_url' => $this->baseUrl
            ]);

            $rnd = $this->generateRandomString();
            $redirectTo = "{$this->baseUrl}/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

            $options = [
                'form_params' => [
                    'UserName' => $username,
                    'Password' => $password,
                    'RedirectTo' => $redirectTo,
                    '%%ModDate' => time() * 1000
                ],
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Origin' => $this->baseUrl,
                    'Referer' => "{$this->baseUrl}/names.nsf?Login",
                    'Host' => '31.193.136.171'
                ],
                'curl' => [
                    CURLOPT_FRESH_CONNECT => true,
                    CURLOPT_TCP_NODELAY => true,
                ],
            ];

            $response = $this->client->post('/names.nsf?Login', $options);
            $responseBody = (string)$response->getBody();
            $statusCode = $response->getStatusCode();

            Log::debug('Login Response', [
                'status_code' => $statusCode,
                'headers' => $response->getHeaders(),
                'body' => substr($responseBody, 0, 1000), // Log first 1000 chars
                'cookies' => $this->cookieJar->toArray()
            ]);

            // Debug log for cookie structure
            Log::debug('Cookies after login:', [
                'raw_cookies' => $this->cookieJar->toArray(),
                'cookie_structure' => array_map(function($cookie) {
                    return [
                        'type' => gettype($cookie),
                        'properties' => is_object($cookie) ? get_object_vars($cookie) : $cookie
                    ];
                }, $this->cookieJar->toArray())
            ]);

            // Check for DomAuthSessId cookie
            $cookies = $this->cookieJar->toArray();
            $authCookie = null;

            foreach ($cookies as $cookie) {
                // Check if $cookie is array or object and handle accordingly
                $cookieName = is_array($cookie) ? $cookie['Name'] : $cookie->getName();
                $cookieValue = is_array($cookie) ? $cookie['Value'] : $cookie->getValue();
                
                if (strpos($cookieName, 'DomAuthSessId') !== false) {
                    $authCookie = [
                        'name' => $cookieName,
                        'value' => $cookieValue
                    ];
                    break;
                }
            }

            if (!$authCookie) {
                Log::error('ExternalAuthService: No auth cookie found after login');
                return null;
            }

            // Make a second request to get user data
            $userDataResponse = $this->client->get("/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$this->generateRandomString()}&id={$username}", [
                'headers' => [
                    'Cookie' => "DomAuthSessId={$authCookie['value']}",
                    'Host' => '31.193.136.171'
                ],
                'verify' => false
            ]);

            $userData = $this->parseUserData($userDataResponse->getBody()->getContents());

            if ($userData) {
                $this->sessionId = $authCookie['value'];
                $this->userData = $userData;
                $this->setSessionAndCookies($username);
                return $userData;
            }

            Log::error('ExternalAuthService: Login failed', ['username' => $username]);
            return null;

        } catch (GuzzleException $e) {
            Log::error('ExternalAuthService: Login exception', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'url' => $this->baseUrl,
                'curl_info' => isset($e->getHandlerContext()['errno']) ? $e->getHandlerContext() : null,
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }


    public function postLogin($username, $password)
    {
        try {
            $rnd = $this->generateRandomString();
            $redirectTo = "{$this->baseUrl}/tech/sysadmin.nsf/ag.getdocdetail?openagent&{$rnd}&id={$username}";

            $response = $this->client->post("{$this->baseUrl}/names.nsf?login", [
                'form_params' => [
                    'UserName' => $username,
                    'Password' => $password,
                    'RedirectTo' => $redirectTo,
                ],
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0',
                ],
                'allow_redirects' => true,
            ]);

            $body = $response->getBody()->getContents();
            $this->userData = $this->parseUserData($body);

            if ($this->sessionId && $this->userData) {
                $this->setSessionAndCookies($username);

                // After successfully setting session and cookies, redirect to the intended URL.
                return redirect()->intended('/dashboard'); // Or any specific route
            }

            return null;
        } catch (GuzzleException $e) {
            Log::error('Login exception', ['message' => $e->getMessage()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Unexpected error', ['message' => $e->getMessage()]);
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
        if (is_array($this->sessionId)) {
            $sessionIdValue = $this->sessionId['value'];
        } else {
            $sessionIdValue = $this->sessionId;
        }

        Cookie::queue('RW_AuthID', $sessionIdValue, 30);
        Cookie::queue('RW_Fldr', $this->userData['ApplicationFolder'] ?? 'demo', 30);
        Cookie::queue('RW_UserID', $username, 30);

        Session::put('authID', $sessionIdValue);
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
        Session::put('cookieJar', serialize($this->cookieJar));

        Log::debug('Session and cookies set:', [
            'session_id' => $sessionIdValue,
            'username' => $username,
            'folder' => $this->userData['ApplicationFolder'] ?? 'demo',
            'cookies_set' => [
                'RW_AuthID' => $sessionIdValue,
                'RW_Fldr' => $this->userData['ApplicationFolder'] ?? 'demo',
                'RW_UserID' => $username
            ]
        ]);
    }


    public function getUserSettings($Ty)
    {
        
        $applicationFolder = $this->userData['ApplicationFolder'] ?? Session::get('userData')['ApplicationFolder'];
        $userName = $this->userData['UserName'] ?? Session::get('userData')['UserName'];

        $url = $this->baseUrl .'/'.$applicationFolder . '/profiles.nsf/ag.getprsetts?openagent&' . $this->generateRandomString() .  '|' . $userName . '|' . $Ty;
        
        $args = [
            'url' => $url,
            'data-type' => 'Settings',
            'return-type' => 'Fields',
        ];
        // dd($url);

        


        $this->url = $url;
        $this->getDataUrl($args);
    }

    public function getDataUrl($args)
    {
        
        $sessionId = $this->sessionId ?? session('authID');
        $applicationFolder = $this->userData['ApplicationFolder'] ?? Session::get('userData')['ApplicationFolder'];
        $ck = "DomAuthSessId=".$sessionId;
        $url = $args['url'];
        $url = preg_replace('/\[FLDR\]/', $applicationFolder, $url);
        $url = preg_replace('/\[BASEURL\]/', $this->baseUrl, $url);
        $url = preg_replace('/\[RND\]/', $this->generateRandomString(), $url);
        $getValue = isset($args['is-post']) ? 'POST' : 'GET';
        $data = isset($args['data']) ? $args['data'] : '';

        
        Log::info('Before request data url:', ['url' => $url, 'data' => $data]);

        
        // dd(session('cookieJar'));
        
        
        // $data = preg_replace('/\[WKEND\]/', Session::get('weekending'), $data); -> weekend is usually sunday of the week
        // $data = preg_replace('/\[NAVDATE\]/', Session::get('navdate'), $data);
        $response = $this->client->request( $getValue,$url, [
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/32.0.1700.107 Chrome/32.0.1700.107 Safari/537.36',
                'Cookie' => $ck,
            ], 'body' =>  $data,
            
        ]);
    
        Log::info('Cookies sent with request:', ['cookies' => Session::get('cookieJar')]);
        $resp = $response->getBody()->getContents();

        Log::debug('getDataUrl Response', ['resp' => $resp]);

        

        // dd($resp);
        
       
        $resp1 = str_replace("\n", '',$resp);
        $resp2 = str_replace("~END~~END~", '~END~',$resp1);
        Log::debug('resp1 Data returned', ['resp1' => $resp1]);
        Log::debug('resp2 Data returned', ['resp2' => $resp2]);
		$arrel = explode('~END~',$resp2);
        
        $i1 = 0;
        $rList = [];

        
        
        
        $this->vData = [];

       if ($args['return-type'] == 'Text'){
            $variableTest = $resp2;
            $this->vText = $variableTest;
        }

        try {
            if ($args['return-type'] == 'View') {
                $rList = preg_split('/;/', $args['return-list']);
                Log::debug('Return list split:', [
                    'raw_return_list' => $args['return-list'],
                    'split_array' => $rList
                ]);
            }
            
            Log::debug('Return list split general', ['raw_return_list' => $args]);

            Log::debug('Return arrel' , ['arrel' => $arrel]);
            foreach ($arrel as $val) {
                
                Log::debug('Before val Value Start' , ['val' => $val]);
                if ($i1 > 0) {
                    // dd($val);
                    if ($args['return-type'] == 'View') {
                        // Skip HTML closing tags
                        


                        Log::debug('Return val Value Start' , ['val' => $val]);
                    
                        
                        $a1 = preg_split('/\|/', $val);
                        
                        Log::debug('Processing row data:', [
                            'row_data' => $val,
                            'split_data' => $a1,
                            'rList_count' => count($rList),
                            'split_data_count' => count($a1),
                            'val' => $val,
                            'a1' => count($a1),
                            'rList' => count($rList),
                            'is a1 >= rList' => count($a1) >= count($rList),
                        ]);
                    
                        Log::debug('Return val Value End Result' , ['a1' => $a1, 'a1 - the data count' => count($a1), 'rList - the data count' => count($rList)]);
                        if (count($a1) >= count($rList)) {
                            $docId = end($a1); // Get last element safely
                            $dataValues = array_slice($a1, 0, count($rList)); // Take only needed values
                            Log::debug('Before the Data values is created:', [
                                'vData' => $this->vData,
                            ]);
                            Log::debug('Data values Created Here:', [
                                'doc_id' => $docId,
                                'data_values' => $dataValues,
                                'rList' => $rList
                            ]);
                            if (count($dataValues) === count($rList)) {
                                $this->vData[$docId] = array_combine(
                                    array_map('trim', $rList),
                                    array_map('trim', $dataValues)
                                );
                                $this->vData[$docId]['DocID'] = $docId;
                            }
                            Log::debug('After the Data values is created:', [
                                'vData' => $this->vData,
                            ]);
                        }

                        
                    } elseif ($args['return-type'] == 'Fields') {
                        if (strpos($val, '#@#') > 1) {
                            $a1 = preg_split('/#@#/', $val);
                            if ($args['data-type'] == 'Settings') {
                                $this->vSetts[$a1[0]] = $a1[1];
                            } else {
                                $this->vData[$a1[0]] = $a1[1];
                            }
                        }
                    } elseif ($args['return-type'] == 'Doc') {
                        if (strpos($val, '|') > 1) {
                            $a1 = preg_split('/\|/', $val);
                            $this->vData[strtolower($a1[0])] = $a1[1];
                        }
                    }
                        
                }
                $i1++;
            }

            Log::debug('HERE IS THE FINAL VDATA:', [
                'return-type' => $args['return-type'],
                'VDATA' => $this->vData,

            ]);
            return $this->vData;
        } catch (\Exception $e) {
            Log::error('Error in getDataUrl:', [
                'message' => $e->getMessage(),
                'args' => $args,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }


        
        
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
    
        Log::debug('Parsed user data:', [
            'data_structure' => array_keys($userData),
            'data_sample' => array_slice($userData, 0, 5, true)
        ]);
    
        return $userData;
    }

    public function getMenuData()
    {
        $userData = Session::get('userData');

        
        if (!$userData || !isset($userData['menuopts'])) {
            Log::warning('Menu options not found in session', [
                'userData_exists' => !empty($userData),
                'session_id' => Session::getId()
            ]);
            return [];
        }
        
        return $this->parseMenuOptions($userData['menuopts']);
    }

    public function collectionFormSettings($content)
    {
        // Temporary debug output
        Log::info('collectionFormSettings called with content: ' . $content);

        $ty = $content;
        $url = "{$this->baseUrl}/[FLDR]/candidates.nsf/ag.searchdata?openagent&[RND]";
        $colLs = preg_split('/\;/', 'Candidate Ref;Full Name;Email;Shift Pattern;Location;First Name;Last Name;Job Type;Phone;Assessed;Date Of Birth;Branch;Avail Window;Classification;County;ID');
        $qry = '(Form="Candidate") & (RegStatus="Completed")|0~FirstName;1~LastName;2~Email;3~Mobile;4~UnitName;5~AvailDays;6~EarliestStart;7~LatestStart;8~ClientName;9~AssessedClients;10~DateOfBirth;11~CandidateRef;12~Classification;13~Town;14~County;15~CandidatePack;16~JobType';
        $ret = 'First Name;Last Name;Email;Phone;Branch;Shift Pattern;Earliest Start;Latest Start;Location;Assessed;Date Of Birth;Candidate Ref;Classification;Town;County;Pack;Job Type;DocID';

        $this->getUserSettings($content);

        if (isset($this->vSetts['url'])) {
            $url = $this->vSetts['url'];
        }

        $v1 = [
            'url' => $url,
            'is-post' => '0',
            'return-type' => 'Doc',
        ];

        $this->getDataUrl($v1);

        // Check if $content includes "Form"
        if (strpos($content, 'Form') !== false) {
            // dd($this->vSetts, $this->vData);
            $structuredData = [
                'tabs_Sections' => $this->structureFormData(),
                'data' => $this->vData,
                'saveURL' => $this->vSetts['SaveUrl'] ?? '',
                'saveData' => $this->vSetts['SaveData']?? '',
                'buttons' => $this->vSetts['Buttons']?? '',
                'popups' => $this->vSetts['Popups']?? '',
                'lookups' => $this->vSetts['Lookups']?? '',
            ];


        } else {
            $structuredData = [
                'columns' => $colLs,
                'data' => $this->vData,
                'menu' => $this->getMenuData(),
                'sets' => $this->structureFormFields($this->vSetts),
            ];
        }

        return $structuredData;
    }

    public function collectionUserSettings($content, $url = null, $query = null, $return = null)
{
    // DEFAULT URL and QUERY
    $defaultUrl = "{$this->baseUrl}/[FLDR]/candidates.nsf/ag.searchdata?openagent&[RND]";
    $defaultQuery = '(Form="Candidate") & (RegStatus="Completed")|0~FirstName;1~LastName;2~Email;3~Mobile;4~UnitName;5~AvailDays;6~EarliestStart;7~LatestStart;8~ClientName;9~AssessedClients;10~DateOfBirth;11~CandidateRef;12~Classification;13~Town;14~County;15~CandidatePack;16~JobType';

    $colLs = preg_split('/\;/', 'Candidate Ref;Full Name;Email;Shift Pattern;Location;First Name;Last Name;Job Type;Phone;Assessed;Date Of Birth;Branch;Avail Window;Classification;County;ID');
    $ret = 'First Name;Last Name;Email;Phone;Branch;Shift Pattern;Earliest Start;Latest Start;Location;Assessed;Date Of Birth;Candidate Ref;Classification;Town;County;Pack;Job Type;DocID';

    // Fetch user settings
    $this->getUserSettings($content);

    // If user settings are provided, override defaults
    if (isset($this->vSetts['url'])) {
        $defaultUrl = $this->vSetts['url'];
        $colLs = preg_split('/\;/', $this->vSetts['labels']);
        $defaultQuery = $this->vSetts['query'];
        $ret = $this->vSetts['return-list'];
    }

    Log::debug('collectionUserSettings passed in URL and Query and return', ['url' => $url, 'query' => $query, 'return' => $return]);
    // Use provided URL and query, or fall back to defaults
    $finalUrl = $url ?? $defaultUrl;
    $finalQuery = $query ?? $defaultQuery;
    $finalRet = $return ?? $ret;

    Log::debug('collectionUserSettings URL and Query and return', ['url' => $finalUrl, 'query' => $finalQuery, 'return' => $finalRet]);
    

    // Prepare request payload
    $v1 = [
        'url' => $finalUrl,
        'is-post' => '1', // Change this to 0 for getFormSettings
        'return-type' => 'View', // Use 'Doc' for getFormSettings
        'data' => $finalQuery, // Use query string
        'return-list' => $finalRet, // List of fields to return
    ];

    // Fetch data from the external service
    $this->getDataUrl($v1);

    // Structure the data for return
    $structuredData = [
        'columns' => $colLs,
        'data' => $this->vData,
        'menu' => $this->getMenuData(),
        'vsetts' => $this->vSetts,
        'timestamp' => now()->timestamp,
    ];

    Log::debug('Log on StructuredData', ['structuredData' => $structuredData]);

    return $structuredData;
}


    public function updateCandidate($saveUrl, $saveDataChanges){

        $v1=array();
        $v1['url']=$saveUrl;
        $v1['is-post']='1'; // Change this to 0 on getFormSettings
        $v1['return-type']='Text'; // 'Doc' for getFormSettings'
        $v1['data']=$saveDataChanges;
        $this->getDataUrl($v1);
    }



    function parseMenuOptions($menuOptionsString) {
        $categories = explode('$$', $menuOptionsString);
        $result = [];
    
        foreach ($categories as $category) {
            $items = explode(';', $category);
            $mainMenu = '';
            $subMenu = [];
    
            foreach ($items as $index => $item) {
                $parts = explode('~', $item);
    
                if ($index === 0 && strpos($parts[0], '@') !== false) {
                    // This is a main menu item
                    list($mainMenu, $firstSubmenuItem) = explode('@', $parts[0], 2);
                    $parts[0] = $firstSubmenuItem; // Replace with the actual submenu item name
                }
    
                if (count($parts) >= 3) {
                    $subMenu[] = [
                        'index' => (int)$parts[2], // Use the provided index
                        'name' => $parts[0],
                        'call' => $parts[1]
                    ];
                }
            }
    
            if ($mainMenu) {
                $result[] = [
                    'name' => $mainMenu,
                    'submenu' => $subMenu
                ];
            } else {
                // If there's no main menu, add submenu items directly to the result
                $result = array_merge($result, $subMenu);
            }
        }
    
        return $result;
    }
// ExternalAuthService.php
    public function logout()
    {
        try {
            Log::info('External service logout started');
            
            // Clear internal state
            $this->sessionId = null;
            $this->userData = null;
            Session::flush();

            // Create cookie forge responses
            $cookies = [
                Cookie::forget('laravel_session'),
                Cookie::forget('XSRF-TOKEN'),
                Cookie::forget('RW_AuthID'),
                Cookie::forget('RW_UserID'),
                Cookie::forget('RW_Fldr')
            ];

            // Clear cookie jar
            $this->cookieJar = new CookieJar();
            Log::info('CookieJar cleared', ['cookieJar' => $this->cookieJar]);
            
            // If there's a logout endpoint on the external service, call it
            // Example: $this->client->post('external/logout/endpoint');
            
            Log::info('External service logout completed successfully');
            
            return true;
        } catch (\Exception $e) {
            Log::error('External service logout failed', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }




    public function structureFormData()
    {
        $structuredData = [];

        if (!isset($this->vSetts['Tabs'])) {
            return $structuredData;
        }

        $tabs = explode('@@', $this->vSetts['Tabs']);

        foreach ($tabs as $tab) {
            list($tabName, $sectionIds) = explode('~', $tab);
            $tabData = [
                'label' => $tabName,
                'sections' => []
            ];

            $sectionIds = explode(';', $sectionIds);
            foreach ($sectionIds as $sectionId) {
                if (isset($this->vSetts[$sectionId])) {
                    list($sectionLabel, $columns, $fields) = explode('~', $this->vSetts[$sectionId]);
                    $tabData['sections'][$sectionId] = [
                        'label' => $sectionLabel,
                        'columns' => intval($columns),
                        'fields' => explode(';', $fields)
                    ];
                }
            }

            $structuredData[] = $tabData;
        }

        return $structuredData;
    }

    public function structureFormFields(array $formFields)
    {
        $structuredFields = [];

        foreach ($formFields as $fieldName => $fieldInfo) {
            
            // Check if $fieldInfo is an array
            if (is_array($fieldInfo)) {
                // If it's already an array, use it directly
                $structuredFields[$fieldName] = $fieldInfo;
            } else {
                // If it's a string, process it as before
                $parts = explode(';', $fieldInfo);
                $label = $parts[0] ?? $fieldName;
                $type = $parts[1] ?? 'Text';
                $options = [];
                

                if (($type === 'Select'|| $type === 'Checkbox' || $type ==='Lookup')  && isset($parts[2])) {
                    $optionPairs = explode('@@', string: $parts[2]);
                    foreach ($optionPairs as $pair) {
                        $pairParts = explode('|', $pair);
                        if (count($pairParts) === 2) {
                            $options[] = ['label' => $pairParts[0], 'value' => $pairParts[1]];
                        } else {
                            $options[] = ['value' => $pair, 'label' => $pair];
                        }
                    }
                } else if ($type === 'Table'){
                    $optionPairs = explode('$END$', string: $parts[2]);
                    foreach ($optionPairs as $pair) {
                        $pairParts = explode('$@$', $pair);
                        if (count($pairParts) === 2) {
                            $options[] = ['label' => $pairParts[0], 'value' => $pairParts[1]];
                        } else {
                            $options[] = ['value' => $pair, 'label' => $pair];
                        }
                    }
                }
               
                

                $structuredFields[$fieldName] = array_merge([
                    'label' => $label,
                    'type' => $type,
                    'options' => $options,
                ], $type === 'Table' ? ['timestamp' => now()->timestamp] : []);
            }
        }

        return $structuredFields;
    }

    public function getLatestData($call) 
    {
        // Use existing method but add timestamp
        $candidateData = $this->collectionUserSettings($call);
        return [
            'data' => $candidateData,
            'timestamp' => now()->timestamp
        ];
    }
}
