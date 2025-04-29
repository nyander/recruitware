<?php

namespace App\Http\Controllers;

use App\Services\ExternalAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class DashboardDataController extends Controller
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
    }

    /**
     * Proxy requests for dashboard chart data
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getChartData(Request $request)
    {
        $chartType = $request->query('type');

        if (!$chartType) {
            return response()->json(['error' => 'Chart type is required'], 400);
        }

        Log::info('Dashboard chart data request', [
            'chart_type' => $chartType,
            'query_params' => $request->all()
        ]);

        try {
            // Get session data
            $authID = Session::get('authID');
            $folder = Session::get('fldr', Session::get('userData.ApplicationFolder', 'demo'));
            $baseUrl = config('services.external.base_url', 'http://31.193.136.171');

            Log::debug('Session information for chart request', [
                'auth_id' => $authID ? 'exists' : 'missing',
                'folder' => $folder,
                'base_url' => $baseUrl
            ]);

            // If we're in a development environment and want to use mock data
            if (config('app.env') === 'local' && config('app.use_mock_data', true)) {
                return $this->getMockChartData($chartType);
            }

            if (!$authID) {
                return response()->json(['error' => 'Authentication required'], 401);
            }

            // Generate URL for the external API
            $url = "{$baseUrl}/{$folder}/bookings.nsf/ag.getdashdata";
            $params = [
                'openagent' => '',
                'rnd' => $this->generateRandomString(10),
                'ty' => $chartType
            ];

            Log::info('Making external request for chart data', [
                'url' => $url,
                'params' => $params
            ]);

            // Make the request to the external API
            $response = Http::withHeaders([
                'Cookie' => $authID,
            ])->get($url, $params);

            Log::debug('External chart data response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                return response($response->body());
            } else {
                // If external request fails, return mock data in development
                if (config('app.env') === 'local') {
                    Log::warning('External request failed, using mock data', [
                        'status' => $response->status(),
                        'error' => $response->body()
                    ]);
                    return $this->getMockChartData($chartType);
                }

                return response()->json([
                    'error' => 'External service error',
                    'status' => $response->status()
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error fetching chart data', [
                'chart_type' => $chartType,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return mock data in development environments
            if (config('app.env') === 'local') {
                return $this->getMockChartData($chartType);
            }

            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
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
    protected function getMockChartData($chartType)
    {
        Log::info('Using mock data for chart type: ' . $chartType);

        // Return appropriate mock data based on chart type
        switch ($chartType) {
            case 'day_bookings_difference':
                return response("Client A~10~12~2;Client B~12~9~-3;Client C~19~12~-7;Client D~12~12~0;Client E~4~3~1;Client F~2~4~2;Total~24~30~6");

            case 'week_bookings_difference':
                return response("Client A~40~45~5;Client B~38~42~4;Client C~55~50~-5;Client D~22~28~6;Client E~15~18~3;Client F~30~25~-5;Total~200~208~8");

            case 'day_bookings_by_client':
                return response("Client A~24;Client B~18;Client C~15;Client D~12;Client E~8;Client F~3;Total~80");

            case 'week_bookings_by_client':
                return response("Client A~120;Client B~95;Client C~85;Client D~65;Client E~45;Client F~30;Total~440");

            default:
                // Generic data for any other chart type
                return response("Item 1~10;Item 2~20;Item 3~15;Item 4~25;Item 5~18");
        }
    }
}
