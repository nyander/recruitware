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

    private function getColumns($status)
{
    $commonColumns = [
        ['Header' => 'Name', 'accessor' => 'full_name'], // Change this line
        ['Header' => 'Email', 'accessor' => 'email'],
        ['Header' => 'Location', 'accessor' => 'location'],
    ];

    $statusSpecificColumns = [
        'live' => [
            ['Header' => 'Classification', 'accessor' => 'classification'],
            ['Header' => 'Shift Pattern', 'accessor' => 'shift_pattern'],
            ['Header' => 'Available From', 'accessor' => 'avail_window'],
        ],
        'new' => [
            ['Header' => 'Age', 'accessor' => 'age'],
            ['Header' => 'Phone', 'accessor' => 'phone'],
            ['Header' => 'Reference', 'accessor' => 'ref'],
        ],
        'audit' => [
            ['Header' => 'Classification', 'accessor' => 'classification'],
            ['Header' => 'Assessed Pack', 'accessor' => 'assessed_pack'],
        ],
        'pending' => [
            ['Header' => 'Classification', 'accessor' => 'classification'],
            ['Header' => 'Shift Pattern', 'accessor' => 'shift_pattern'],
        ],
        'leaver' => [
            ['Header' => 'Classification', 'accessor' => 'classification'],
            ['Header' => 'Last Working Day', 'accessor' => 'avail_window'],
        ],
        'archived' => [
            ['Header' => 'Classification', 'accessor' => 'classification'],
            ['Header' => 'Reference', 'accessor' => 'ref'],
        ],
        'no_contact' => [
            ['Header' => 'Last Contact Attempt', 'accessor' => 'updated_at'],
            ['Header' => 'Phone', 'accessor' => 'phone'],
        ],
    ];

    return array_merge($commonColumns, $statusSpecificColumns[$status] ?? []);
}

public function renderCandidateView($status,$viewform, $viewName, $candidateData)
{
    $candidates = $candidateData["data"];
    $columns = $candidateData["columns"];
    $menu = $this->externalAuthService->getMenuData();


    // Get session data
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
    ]);
}

    public function getCandidatePage(Request $request, $name, $call)
    {
        $candidateData = $this->externalAuthService->collectionUserSettings($call);
        $viewform = $candidateData['vsetts']['viewform']; 
        return $this->renderCandidateView($name, $viewform,'Index', $candidateData);
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
        $changes = $request->input('changes');
        $saveUrl = $request->input('saveUrl');
        $saveData = $request->input('saveData');

        // dd($changes);
        
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

        // dd($saveUrl, $saveDataChanges);

        $this->externalAuthService->updateCandidate($saveUrl, $saveDataChanges);
        
        return redirect()->back()
                ->with('success', 'Form submitted successfully!');
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
    public function edit(Request $request,  $viewForm,$id)
    {
        $getUserSettingsString = "Fields|".$viewForm;
        $formFields = $this->externalAuthService->collectionFormSettings($getUserSettingsString)['sets'];
        $structuredFormFields = $this->externalAuthService->structureFormFields($formFields);

        $getUserSettingsString = "Form|".$viewForm."|". $id;
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
}
