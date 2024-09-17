<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\ExternalAuthService;

class UnderDevelopmentController extends Controller
{
    protected $externalAuthService;
    public function show($section)
    {
        $sectionName = str_replace('-', ' ', $section);
        $sectionName = ucwords($sectionName);
        $menu = $this->externalAuthService->getMenuData();

        return Inertia::render('UnderDevelopment', [
            'sectionName' => $sectionName,
            'menu' => $menu
        ]);
    }
}