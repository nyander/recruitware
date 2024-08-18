<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CandidateController extends Controller
{
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

    public function live()
    {
        $candidates = Candidate::where('status', 'live')->get();
        return Inertia::render('Candidates/Live', ['candidates' => $candidates]);
    }

    public function new()
    {
        $candidates = Candidate::where('status', 'new')->get();
        return Inertia::render('Candidates/New', ['candidates' => $candidates]);
    }

    public function audit()
    {
        $candidates = Candidate::where('status', 'audit')->get();
        return Inertia::render('Candidates/Audit', ['candidates' => $candidates]);
    }

    public function pending()
    {
        $candidates = Candidate::where('status', 'pending')->get();
        return Inertia::render('Candidates/Pending', ['candidates' => $candidates]);
    }

    public function leavers()
    {
        $candidates = Candidate::where('status', 'leaver')->get();
        return Inertia::render('Candidates/Leavers', ['candidates' => $candidates]);
    }

    public function archive()
    {
        $candidates = Candidate::where('status', 'archived')->get();
        return Inertia::render('Candidates/Archive', ['candidates' => $candidates]);
    }

    public function noContactList()
    {
        $candidates = Candidate::where('status', 'no_contact')->get();
        return Inertia::render('Candidates/NoContactList', ['candidates' => $candidates]);
    }
}
