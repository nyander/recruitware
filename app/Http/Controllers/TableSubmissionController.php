<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TableSubmission;
use App\Models\Booking;
use App\Models\Client;

class TableSubmissionController extends Controller
{
    public function index()
    {
        $candidates = TableSubmission::all();
        $branches = TableSubmission::distinct('branch')->pluck('branch');
        $jobTypes = TableSubmission::distinct('job_type')->pluck('job_type');
        $shiftPatterns = TableSubmission::distinct('shift_pattern')->pluck('shift_pattern');
        $classifications = TableSubmission::distinct('classification')->pluck('classification');

        return Inertia::render('TableSubmissions/Candidates', [
            'candidates' => $candidates,
            'branches' => $branches,
            'jobTypes' => $jobTypes,
            'shiftPatterns' => $shiftPatterns,
            'classifications' => $classifications,
        ]);
    }

    public function bookings()
    {
        $bookings = Booking::with(['client', 'candidate'])->get();

        return Inertia::render('TableSubmissions/Bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function clients()
    {
        $clients = Client::all();

        return Inertia::render('TableSubmissions/Clients', [
            'clients' => $clients,
        ]);
    }

    // Add other methods as needed (store, show, edit, update, destroy)
}