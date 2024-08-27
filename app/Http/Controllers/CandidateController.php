<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Services\CandidateService;
use Inertia\Inertia;

class CandidateController extends Controller
{
    protected $candidateService;

    public function __construct(CandidateService $candidateService)
    {
        $this->candidateService = $candidateService;
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

    public function renderCandidateView($status, $viewName)
    {
        
        $viewData = $this->candidateService->getCandidateViewData($status);
        
        return Inertia::render("Candidates/{$viewName}", $viewData);
    }

    public function live()
    {
        
        return $this->renderCandidateView('live', 'Index');
    }

    public function new()
    {
        return $this->renderCandidateView('new', 'Index');
    }

    public function audit()
    {
        return $this->renderCandidateView('audit', 'Index');
    }

    public function pending()
    {
        return $this->renderCandidateView('pending', 'Index');
    }

    public function leavers()
    {
        return $this->renderCandidateView('leaver', 'Index');
    }

    public function archive()
    {
        return $this->renderCandidateView('archived', 'Index');
    }

    public function noContactList()
    {
        return $this->renderCandidateView('no_contact', 'Index');
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
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
}
