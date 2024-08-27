<?php

namespace App\Services;

use App\Models\Candidate;
use Inertia\Inertia;

class CandidateService
{
    public function getCandidateViewData($status)
    {
        $candidates = Candidate::where('status', $status)->get()->map(function ($candidate) {
            $candidate->full_name = $candidate->first_name . ' ' . $candidate->last_name;
            return $candidate;
        });

        $columns = $this->getColumns($status);

        return [
            'candidates' => $candidates,
            'status' => ucfirst($status),
            'columns' => $columns,
        ];
    }

    public function renderCandidateView($viewName)
    {
        
    }

    private function getColumns($status)
    {
        // Implementation of getColumns method
    }
}