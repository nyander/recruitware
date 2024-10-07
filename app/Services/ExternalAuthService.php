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

    public function __construct(CandidateService $candidateService)
    {
        $this->candidateService = $candidateService;
        $this->baseUrl = config('services.external_auth.base_url', 'https://www.recruitware.uk');

        $this->cookieJar = new CookieJar();
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            // 'timeout'  => 30.0,
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
            // Session::put('userData', $this->userData);
            
            // Next phase check the last page which user was at.

        

            if ($this->sessionId && $this->userData) {
                $this->setSessionAndCookies($username);
                // Manually add the session cookie to the CookieJar
                $this->cookieJar->setCookie(new \GuzzleHttp\Cookie\SetCookie([
                    'Name' => 'DomAuthSessId',
                    'Value' => $this->sessionId,
                    'Domain' => '.recruitware.uk',
                    'Path' => '/',
                ]));
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
        Session::put('cookieJar', serialize($this->cookieJar));

    }

    public function getUserSettings($Ty)
    {
        
        $applicationFolder = $this->userData['ApplicationFolder'] ?? Session::get('userData')['ApplicationFolder'];
        $userName = $this->userData['UserName'] ?? Session::get('userData')['UserName'];

        $url = $this->baseUrl .'//'.$applicationFolder . '/profiles.nsf/ag.getprsetts?openagent&' . $this->generateRandomString() .  '|' . $userName . '|' . $Ty;
        $args = [
            'url' => $url,
            'data-type' => 'Settings',
            'return-type' => 'Fields',
        ];
        // dd($url);

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
        $url = preg_replace('/\[FLDR\]/', $applicationFolder, $args['url']);
        $url = preg_replace('/\[RND\]/', $this->generateRandomString(), $url);
        $getValue = isset($args['is-post']) ? 'POST' : 'GET';
        $data = isset($args['data']) ? $args['data'] : '';

        
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
        // dd($resp);





        $resp1 = str_replace("\n", '',$resp);
        $resp2 = str_replace("~END~~END~", '~END~',$resp1);
		$arrel = explode('~END~',$resp2);
        
        $i1 = 0;
        $rList = [];

        
        if ($args['return-type'] == 'View') {
            
            $rList = preg_split('/;/', $args['return-list']);
        }

        
        $this->vData = [];

        
        
        foreach ($arrel as $val) {
            if ($i1 > 0) {
                if ($args['return-type'] == 'View') {
                    
                    $a1 = preg_split('/\|/', $val);
                    if (count($a1) > 2) {
                        $docId = $a1[count($a1) - 1];
                        $this->vData[$docId] = array_combine(array_map('trim', $rList), $a1);
                        $this->vData[$docId]['DocID'] = $docId;
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

        

        return $this->vData;
        
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

    public function getMenuData(){
        return $this->parseMenuOptions(session('userData')['menuopts']); 
    }

    public function collectionFormSettings($content, $id){
        // dd("hello world");
        // dd("Hello world");
        // Temporary debug output
        // Log::info('collectionFormSettings called with content: ' . $content);


        $ty=$content;
        $url='https://www.recruitware.uk/[FLDR]/candidates.nsf/ag.searchdata?openagent&[RND]';
        $colLs=preg_split('/\;/','Candidate Ref;Full Name;Email;Shift Pattern;Location;First Name;Last Name;Job Type;Phone;Assessed;Date Of Birth;Branch;Avail Window;Classification;County;ID');
        $qry='(Form="Candidate") & (RegStatus="Completed")|0~FirstName;1~LastName;2~Email;3~Mobile;4~UnitName;5~AvailDays;6~EarliestStart;7~LatestStart;8~ClientName;9~AssessedClients;10~DateOfBirth;11~CandidateRef;12~Classification;13~Town;14~County;15~CandidatePack;16~JobType';
        $ret='First Name;Last Name;Email;Phone;Branch;Shift Pattern;Earliest Start;Latest Start;Location;Assessed;Date Of Birth;Candidate Ref;Classification;Town;County;Pack;Job Type;DocID';
 
        $this->getUserSettings($content);


        if (isset($this->vSetts['url'])){
            $url=$this->vSetts['url'];
            //echo "Settign query to " . $qry;
            }else{
            //echo "****NO SETTS***";
        }
        $v1=array();
        $v1['url']=$url;
        $v1['is-post']='0'; // Change this to 0 on getFormSettings
        $v1['return-type']='Doc'; // 'Doc' for getFormSettings'
        $this->getDataUrl($v1);
        $structuredData = $this->structureFormData();
        
        return $structuredData;
        
        //loadColTemplates($ty);
    }

    public function collectionUserSettings($content){
        //DEFAULT URL
        $ty=$content;
        $url='https://www.recruitware.uk/[FLDR]/candidates.nsf/ag.searchdata?openagent&[RND]';
        $colLs=preg_split('/\;/','Candidate Ref;Full Name;Email;Shift Pattern;Location;First Name;Last Name;Job Type;Phone;Assessed;Date Of Birth;Branch;Avail Window;Classification;County;ID');
        $qry='(Form="Candidate") & (RegStatus="Completed")|0~FirstName;1~LastName;2~Email;3~Mobile;4~UnitName;5~AvailDays;6~EarliestStart;7~LatestStart;8~ClientName;9~AssessedClients;10~DateOfBirth;11~CandidateRef;12~Classification;13~Town;14~County;15~CandidatePack;16~JobType';
        $ret='First Name;Last Name;Email;Phone;Branch;Shift Pattern;Earliest Start;Latest Start;Location;Assessed;Date Of Birth;Candidate Ref;Classification;Town;County;Pack;Job Type;DocID';
 
        $this->getUserSettings($content);


        if (isset($this->vSetts['url'])){
            $url=$this->vSetts['url'];
            $colLs=preg_split('/\;/',$this->vSetts['labels']); // not needed on getFormSettings
            
            $qry=$this->vSetts['query']; // not needed on getFormSettings
            $ret=$this->vSetts['return-list']; // do not need on getFormSettings
            //echo "Settign query to " . $qry;
            }else{
            //echo "****NO SETTS***";
        }
        $v1=array();
        $v1['url']=$url;
        $v1['is-post']='1'; // Change this to 0 on getFormSettings
        $v1['return-type']='View'; // 'Doc' for getFormSettings'
        $v1['data']=$qry; // do not need on getFormSettings
        $v1['return-list']=$ret; // not needed on getFormSettings
        // dd($content, $v1);
        $this->getDataUrl($v1);
        
        $structuredData = [
            'columns' => $colLs,
            'data' => $this->vData,
            'menu' => $this->getMenuData(),
        ];

        //vData is where we contian all the information required on the getFormSettings

        return $structuredData;
        
        //loadColTemplates($ty);
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

    public function logout()
    {
        // Perform any necessary logout actions for the external system
        // This could include making an API call to invalidate the session, etc.
        // For now, we'll just clear the internal state
        $this->sessionId = null;
        $this->userData = null;
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
}
