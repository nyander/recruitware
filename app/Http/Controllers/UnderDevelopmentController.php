<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class UnderDevelopmentController extends Controller
{
    public function show($section)
    {
        $sectionName = str_replace('-', ' ', $section);
        $sectionName = ucwords($sectionName);

        return Inertia::render('UnderDevelopment', [
            'sectionName' => $sectionName
        ]);
    }
}