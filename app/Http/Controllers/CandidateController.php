<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Services\CandidateService;
use App\Services\ExternalAuthService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CandidateController extends Controller
{
    protected $candidateService;
    protected $externalAuthService;

    public function __construct(CandidateService $candidateService, ExternalAuthService $externalAuthService)
    {
        $this->candidateService = $candidateService;
        $this->externalAuthService = $externalAuthService;
    }



    public function renderCandidateView($status, $viewform, $viewName, $candidateData, $structuredFormFields, $disableRowClick)
    {
        $candidates = $candidateData["data"];
        $columns = $candidateData["columns"];
        $menu = $this->externalAuthService->getMenuData();

        // Get session data
        // dd($candidateData);
        $authID = session('authID');
        $userName = session('userName');
        $userData = session('userData');

        // Create a user object from session data
        $user = new \stdClass();
        $user->name = $userData['FullName'] ?? $userName;
        $user->email = $userData['Email'] ?? '';
        $user->role = $userData['DefaultRole'] ?? '';


        return Inertia::render("Candidates/{$viewName}", [
            'auth' => [
                'user' => $user,
            ],
            'candidates' => $candidates,
            'status' => ucfirst($status),
            'columns' => $columns,
            'menu' => $menu, // Pass the menu data to the frontend
            'sessionInfo' => [
                'authID' => $authID,
                'userName' => $userName,
                'applicationFolder' => $userData['ApplicationFolder'] ?? '',
                'clientName' => $userData['clientName'] ?? '',
                'defaultLocation' => $userData['defaultlocation'] ?? '',
            ],
            'viewForm' => $viewform,
            'buttons' => $candidateData['buttons'] ?? null,
            'popups' => $candidateData['popups'] ?? null,
            'structuredFormFields' => $structuredFormFields,
            'disableRowClick' => $disableRowClick,
            'vsetts' => $candidateData['vsetts'],
            'pollingInterval' => config('app.polling_interval', 30000),
        ]);
    }

    public function getCandidatePage(Request $request, $name, $call)
    {
        try {
            Log::info('Starting getCandidatePage', [
                'name' => $name,
                'call' => $call,
                'request_params' => $request->all()
            ]);

            // Special handling for direct Dashboard access
            if ($name === 'Dashboard' && $call === 'Dashboard') {
                Log::info('Direct Dashboard access detected');
            }

            try {
                $candidateData = $this->externalAuthService->collectionUserSettings($call);
            } catch (\Exception $e) {
                Log::error('Error fetching data from external service: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'name' => $name,
                    'call' => $call
                ]);

                // Create a minimal structure for the data
                $candidateData = [
                    'data' => [],
                    'columns' => ['ID', 'Name', 'Status', 'Email', 'Phone'],
                    'vsetts' => []
                ];
            }

            // Add debug logging
            Log::debug('Candidate Data from service:', [
                'data_keys' => is_array($candidateData) ? array_keys($candidateData) : 'not an array',
                'vsetts_keys' => is_array($candidateData) && isset($candidateData['vsetts']) ? array_keys($candidateData['vsetts']) : 'vsetts not found'
            ]);

            // Ensure data is an array
            if (!is_array($candidateData)) {
                Log::error('candidateData is not an array', ['candidateData' => $candidateData]);
                $candidateData = [
                    'data' => [],
                    'columns' => ['ID', 'Name', 'Status', 'Email', 'Phone'],
                    'vsetts' => []
                ];
            }

            // Process data array for runPopButton values - check if data exists first
            if (isset($candidateData['data']) && is_array($candidateData['data'])) {
                foreach ($candidateData['data'] as $key => &$candidate) {
                    if (is_array($candidate)) {
                        foreach ($candidate as $field => &$value) {
                            if (is_string($value) && strpos($value, 'runPopButton') !== false) {
                                $value = str_replace('~', '%7E', $value);
                            }
                        }
                    }
                }
            } else {
                $candidateData['data'] = []; // Ensure data is an array
            }

            // Safely get vsetts values with fallbacks
            $vsetts = $candidateData['vsetts'] ?? [];
            $viewForm = $vsetts['viewform'] ?? $call; // Fallback to $call if viewform not set

            // Special override for direct dashboard access
            if ($name === 'Dashboard' && $call === 'Dashboard') {
                $viewForm = 'Dashboard';
            }

            // Add buttons and popups to the data being passed to the view
            $candidateData['buttons'] = $vsetts['Buttons'] ?? null;
            $candidateData['popups'] = $vsetts['Popups'] ?? null;

            // Check and sanitize disableRowClick
            $disableRowClickRaw = $vsetts['disableRowClick'] ?? false;
            $disableRowClickClean = strip_tags(trim($disableRowClickRaw));
            $disableRowClick = filter_var($disableRowClickClean, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

            // Get form fields and structure them
            $getUserSettingsString = "Fields|" . $viewForm;
            try {
                $formFields = $this->externalAuthService->collectionFormSettings($getUserSettingsString)['sets'] ?? [];
                $structuredFormFields = $this->externalAuthService->structureFormFields($formFields);
            } catch (\Exception $e) {
                Log::error('Error fetching form settings: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
                $structuredFormFields = [];
            }

            // Special handling for dashboard view
            if ($viewForm === 'Dashboard') {
                Log::info('Rendering Dashboard view', ['name' => $name, 'viewForm' => $viewForm]);
                return $this->renderDashboardView(
                    $name,
                    $viewForm,
                    $candidateData,
                    $structuredFormFields,
                    $disableRowClick
                );
            }

            // Log prepared data
            Log::debug('Prepared data for view:', [
                'viewForm' => $viewForm,
                'has_buttons' => isset($candidateData['buttons']),
                'has_popups' => isset($candidateData['popups']),
                'disableRowClick' => $disableRowClick
            ]);

            return $this->renderCandidateView(
                $name,
                $viewForm,
                'Index',
                $candidateData,
                $structuredFormFields,
                $disableRowClick
            );
        } catch (\Exception $e) {
            Log::error('Error in getCandidatePage:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return an error view
            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'An error occurred while loading the page. Please try again later.',
                'exception' => config('app.debug') ? $e->getMessage() : null
            ]);
        }
    }

    /**
     * Render dashboard view with chart visualization
     *
     * @param string $status
     * @param string $viewForm
     * @param array $candidateData
     * @param array $structuredFormFields
     * @param bool $disableRowClick
     * @return \Inertia\Response
     */
    protected function renderDashboardView($status, $viewForm, $candidateData, $structuredFormFields, $disableRowClick = false)
    {
        Log::debug('Rendering dashboard view', [
            'status' => $status,
            'viewForm' => $viewForm
        ]);

        try {
            // Get menu data with error handling
            try {
                $menu = $this->externalAuthService->getMenuData();
                if (!$menu) {
                    Log::warning('Empty menu data returned from getMenuData');
                    $menu = [];
                }
            } catch (\Exception $e) {
                Log::error('Error getting menu data: ' . $e->getMessage());
                $menu = []; // Fallback empty menu
            }

            // Get session data
            $authID = session('authID');
            $userName = session('userName');
            $userData = session('userData', []);

            if (empty($userData)) {
                Log::warning('No userData in session for dashboard view, using defaults');
                // Create minimum user data to prevent errors
                $userData = [
                    'FullName' => $userName ?? 'User',
                    'Email' => '',
                    'DefaultRole' => '',
                    'ApplicationFolder' => '',
                    'clientName' => '',
                    'defaultlocation' => ''
                ];
            }

            // Create a user object from session data
            $user = new \stdClass();
            $user->name = $userData['FullName'] ?? $userName ?? 'User';
            $user->email = $userData['Email'] ?? '';
            $user->role = $userData['DefaultRole'] ?? '';

            // Ensure candidates and columns are arrays to prevent JS errors
            $candidates = [];
            $columns = [];

            if (isset($candidateData["data"]) && is_array($candidateData["data"])) {
                $candidates = $candidateData["data"];
            } else {
                Log::warning('Dashboard data missing data array');
                // Create sample data for testing if needed
                $candidates = [
                    ['ID' => 1, 'Name' => 'Sample', 'Status' => 'Active', 'Date' => date('Y-m-d'), 'Location' => 'Test']
                ];
            }

            if (isset($candidateData["columns"]) && is_array($candidateData["columns"])) {
                $columns = $candidateData["columns"];
            } else {
                Log::warning('Dashboard data missing columns array');
                // Create some default columns if none are provided
                $columns = ["ID", "Name", "Status", "Date", "Location"];
            }

            // Create a chart configuration from the structured form fields
            $chartConfig = null;
            // Ensure structuredFormFields is an array
            if (is_array($structuredFormFields)) {
                // Look for chart field type in structuredFormFields
                foreach ($structuredFormFields as $field) {
                    if (isset($field['type']) && $field['type'] === 'chart') {
                        $chartConfig = $field;
                        break;
                    }
                }
            }

            // If no chart config was found, create a default one
            if (!$chartConfig) {
                // Extract column names for chart if available
                $chartColumns = array_slice($columns, 0, 5); // Use first 5 columns by default

                $chartConfig = [
                    'type' => 'bar',
                    'title' => $status ?: 'Dashboard',
                    'columns' => $chartColumns
                ];
            }

            return Inertia::render('CandidateChart', [
                'auth' => [
                    'user' => $user,
                ],
                'candidates' => $candidates,
                'status' => ucfirst($status ?: 'Dashboard'),
                'columns' => $columns,
                'menu' => $menu,
                'sessionInfo' => [
                    'authID' => $authID ?: '',
                    'userName' => $userName ?: '',
                    'applicationFolder' => $userData['ApplicationFolder'] ?? '',
                    'clientName' => $userData['clientName'] ?? '',
                    'defaultLocation' => $userData['defaultlocation'] ?? '',
                ],
                'viewForm' => $viewForm ?: 'Dashboard',
                'title' => ucfirst($status ?: 'Dashboard'),
                'buttons' => $candidateData['buttons'] ?? null,
                'popups' => $candidateData['popups'] ?? null,
                'structuredFormFields' => $structuredFormFields ?: [],
                'disableRowClick' => $disableRowClick,
                'vsetts' => $candidateData['vsetts'] ?? [],
                'chartConfig' => $chartConfig,
                'candidateData' => [
                    'data' => is_array($candidates) ? $candidates : [],  // Ensure data is always an array
                    'columns' => is_array($columns) ? $columns : [], // Ensure columns is always an array
                    'vsetts' => $candidateData['vsetts'] ?? []
                ],
                'pollingInterval' => config('app.polling_interval', 30000),
            ]);
        } catch (\Exception $e) {
            Log::error('Error rendering dashboard view: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'Error loading dashboard. Please try again later.',
                'exception' => config('app.debug') ? $e->getMessage() : null
            ]);
        }
    }



    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $changes = $request->input('changes');
            $saveUrl = $request->input('saveUrl');
            $saveData = $request->input('saveData');

            // Process the changes to replace $Author with session authID
            $processedChanges = collect($changes)->map(function ($value, $key) {
                if ($value === '$Author$' || $value === '$Author') {
                    return session('userName');
                }
                if ($value === '$AuthorID$' || $value === '$AuthorID') {
                    return session('authID');
                }
                return $value;
            })->all();

            $formattedChanges = $this->formatChangesForUrl($processedChanges);
            $saveDataChanges = $this->appendChangesToUrl($saveData, $formattedChanges);

            // Perform the external update
            $this->externalAuthService->updateCandidate($saveUrl, $saveDataChanges);

            // Return an Inertia response
            if ($request->wantsJson()) {
                return response()->json(['success' => true]);
            }

            return back()->with('success', 'Changes have been submitted successfully!');
        } catch (\Exception $e) {
            Log::error('Error submitting changes: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }

            return back()->with('error', 'Failed to submit changes. Please try again.');
        }
    }


    /**
     * Display the specified resource.
     */
    public function approve(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request,  $viewForm, $id)
    {
        $getUserSettingsString = "Fields|" . $viewForm . "|" . $id;
        $formFields = $this->externalAuthService->collectionFormSettings($getUserSettingsString)['sets'];
        $structuredFormFields = $this->externalAuthService->structureFormFields($formFields);

        $getUserSettingsString = "Form|" . $viewForm . "|" . $id;
        $formSettings = $this->externalAuthService->collectionFormSettings($getUserSettingsString);
        $menu = $this->externalAuthService->getMenuData();

        // dd($formSettings, $formFields); 

        return Inertia::render('Candidates/Edit', [
            'formSettings' => $formSettings,
            'formFields' => $structuredFormFields,
            'menu' => $menu, // Pass the menu data to the frontend
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Format changes array into pipe-separated string
     * @param array $changes
     * @return string
     */
    private function formatChangesForUrl(array $changes): string
    {
        $formattedPairs = [];
        foreach ($changes as $field => $value) {
            $formattedPairs[] = $field . '=' . $value;
        }
        return implode('|', $formattedPairs);
    }

    /**
     * Append formatted changes to the save URL
     * @param string $saveUrl
     * @param string $formattedChanges
     * @return string
     */
    private function appendChangesToUrl(string $saveUrl, string $formattedChanges): string
    {
        // Remove trailing pipe if it exists
        $saveUrl = rtrim($saveUrl, '|');

        // Add the formatted changes
        return $saveUrl . '|' . $formattedChanges;
    }

    public function pollData(Request $request)
    {
        try {
            Log::debug("Hello world - pollData");
            $call = $request->query('call');
            $url = $request->query('url');
            $query = $request->query('query');
            $ret = $request->query('ret');

            Log::debug('pollData received parameters:', [
                'call' => $call,
                'url' => $url,
                'query' => $query,
                'ret' => $ret,
                'raw_request' => $request->all()
            ]);

            $candidateData = $this->externalAuthService->collectionUserSettings(
                $call,
                $url,
                $query,
                $ret
            );

            // Add debug logging for response data
            Log::debug('Candidate data response:', [
                'data_structure' => $candidateData ? array_keys($candidateData) : 'null',
                'data_sample' => $candidateData,
            ]);

            return response()->json([
                'data' => $candidateData['data'] ?? [],
                'timestamp' => now()->timestamp
            ]);
        } catch (\Exception $e) {
            Log::error('pollData error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'parameters' => compact('call', 'url', 'query')
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getTableData(Request $request)
    {
        try {
            Log::debug("Hello World:", ['requests' => $request]);
            Log::debug('Fetching table data');
            $url = $request->input('url');
            $query = $request->input('query');
            $buttons = $request->input('buttons');
            $popups = $request->input('popups');
            $return = $request->input('returnList');

            $viewForm = $request->input('viewForm');
            $getUserSettingsString = "Fields|" . $viewForm;
            $formFields = $this->externalAuthService->collectionFormSettings($getUserSettingsString)['sets'];
            $structuredFormFields = $this->externalAuthService->structureFormFields($formFields);



            $candidateData = $this->externalAuthService->collectionUserSettings($viewForm, $url, $query, $return);

            // Add debug logging to inspect the structure
            Log::debug('Button Raw candidate data', ['data' => $candidateData]);

            $response = [
                'data' => array_values($candidateData['data'] ?? []), // Remove one level of nesting
                'structuredFormFields' => $structuredFormFields,
                'buttons' => $buttons,
                'popups' => $popups
            ];

            Log::debug('Response prepared', ['response' => $response]);

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Table data error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_params' => [
                    'url' => $request->input('url'),
                    'viewForm' => $request->input('viewForm'),
                    'query' => $request->input('query')
                ]
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
