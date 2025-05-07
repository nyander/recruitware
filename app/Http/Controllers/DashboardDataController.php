<?php

namespace App\Http\Controllers;

use App\Services\ExternalAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use GuzzleHttp\Client;

class DashboardDataController extends Controller
{
    /**
     * External auth service
     *
     * @var ExternalAuthService
     */
    protected $externalAuthService;

    /**
     * Create a new controller instance.
     *
     * @param ExternalAuthService $externalAuthService
     * @return void
     */
    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
    }

    /**
     * Make an external API request with appropriate headers
     *
     * @param string $url
     * @param array $headers
     * @return array
     */
    private function makeExternalRequest($url, $headers = [])
    {
        $client = new \GuzzleHttp\Client([
            'timeout' => 10,
            'verify' => false, // Skip SSL verification in dev
        ]);

        // Default headers that help prevent HTML responses
        $defaultHeaders = [
            'Accept' => 'application/json, text/plain',
            'X-Requested-With' => 'XMLHttpRequest',
            'User-Agent' => 'RecruitewareApp/1.0',
        ];

        $mergedHeaders = array_merge($defaultHeaders, $headers);

        try {
            $response = $client->get($url, [
                'headers' => $mergedHeaders
            ]);

            $statusCode = $response->getStatusCode();
            $body = (string) $response->getBody();
            $contentType = $response->getHeaderLine('Content-Type');

            // Log response metadata
            Log::debug('External API response', [
                'url' => $url,
                'status' => $statusCode,
                'content_type' => $contentType,
                'content_length' => strlen($body),
                'content_preview' => substr($body, 0, 100) . (strlen($body) > 100 ? '...' : '')
            ]);

            // Check if response is HTML (by content type or content analysis)
            if (strpos($contentType, 'text/html') !== false || $this->looksLikeHtml($body)) {
                Log::warning('Received HTML response from external API', [
                    'url' => $url,
                    'content_type' => $contentType,
                    'content_preview' => substr($body, 0, 100)
                ]);

                return [
                    'success' => false,
                    'error' => 'Received HTML instead of data',
                    'data' => null
                ];
            }

            return [
                'success' => true,
                'status' => $statusCode,
                'data' => $body
            ];
        } catch (\Exception $e) {
            Log::error('External API request failed', [
                'url' => $url,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Check if content looks like HTML
     *
     * @param string $content
     * @return bool
     */
    private function looksLikeHtml($content)
    {
        if (empty($content)) {
            return false;
        }

        $htmlPatterns = [
            '<!DOCTYPE',
            '<html',
            '<head',
            '<script',
            '<body',
            '<meta'
        ];

        foreach ($htmlPatterns as $pattern) {
            if (stripos($content, $pattern) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get chart data from external service
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getChartData(Request $request)
    {
        // Extract chart type from request
        $chartType = $request->query('type');

        if (!$chartType) {
            Log::warning('Chart type not specified in request');
            return response()->json(['error' => 'Chart type parameter is required'], 400);
        }

        Log::debug('Chart data request received', [
            'chart_type' => $chartType,
            'user_agent' => $request->header('User-Agent'),
            'referer' => $request->header('Referer')
        ]);

        // Get user session data
        $sessionData = Session::all();
        $userId = $sessionData['auth']['user']['id'] ?? null;
        $folder = $sessionData['auth']['user']['application_folder'] ?? env('DEFAULT_APPLICATION_FOLDER', 'tg');

        // Check if we have authentication
        if (!$userId) {
            Log::warning('User not authenticated for chart data request');
            // Return mock data if not authenticated
            return response($this->getMockDataForChart($chartType), 200)
                ->header('Content-Type', 'text/plain');
        }

        try {
            // Base URL from configuration
            $baseUrl = config('services.external.base_url', 'https://api.example.com');

            // Build URL for the chart data
            $url = "{$baseUrl}/{$folder}/bookings.nsf/ag.getdashdata?openagent&{$this->generateRandomString()}&ty={$chartType}";

            // Headers including session cookies if available
            $headers = [];
            if (isset($sessionData['external_cookie'])) {
                $headers['Cookie'] = $sessionData['external_cookie'];
            }

            // Make the request to the external service
            $response = $this->makeExternalRequest($url, $headers);

            if (!$response['success']) {
                Log::warning('Failed to fetch chart data from external service', [
                    'chart_type' => $chartType,
                    'error' => $response['error']
                ]);

                // Fall back to mock data
                return response($this->getMockDataForChart($chartType), 200)
                    ->header('Content-Type', 'text/plain');
            }

            // If we got a successful response, return it
            return response($response['data'], 200)
                ->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            Log::error('Exception while fetching chart data', [
                'chart_type' => $chartType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return mock data in case of exception
            return response($this->getMockDataForChart($chartType), 200)
                ->header('Content-Type', 'text/plain');
        }
    }

    /**
     * Generate random string for request ID
     * 
     * @param int $length
     * @return string
     */
    protected function generateRandomString($length = 10)
    {
        return substr(str_shuffle(md5(microtime())), 0, $length);
    }

    /**
     * Return mock data for development
     * 
     * @param string $chartType
     * @return \Illuminate\Http\Response
     */
    protected function getMockDataForChart($chartType)
    {
        Log::info('Using mock data for chart type: ' . $chartType);

        // Return appropriate mock data based on chart type
        switch ($chartType) {
            case 'day_bookings_difference':
                return "Client A~10~12~2;Client B~12~9~-3;Client C~19~12~-7;Client D~12~12~0;Client E~4~3~1;Client F~2~4~2;Total~24~30~6";

            case 'week_bookings_difference':
                return "Client A~40~45~5;Client B~38~42~4;Client C~55~50~-5;Client D~22~28~6;Client E~15~18~3;Client F~30~25~-5;Total~200~208~8";

            case 'day_bookings_by_client':
                return "Client A~24;Client B~18;Client C~15;Client D~12;Client E~8;Client F~3;Total~80";

            case 'week_bookings_by_client':
                return "Client A~120;Client B~95;Client C~85;Client D~65;Client E~45;Client F~30;Total~440";

            default:
                // Generic data for any other chart type
                return "Item 1~10;Item 2~20;Item 3~15;Item 4~25;Item 5~18";
        }
    }
}
