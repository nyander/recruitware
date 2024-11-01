<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\ExternalAuthService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
    }

    public function index(): Response
    {
        $menu = $this->externalAuthService->getMenuData();
        
        return Inertia::render('Dashboard', [
            'menu' => $menu
        ]);
    }

    public function getDashboardData(): JsonResponse
    {
        $now = Carbon::now();
        $weekStart = $now->startOfWeek();
        $monthStart = $now->copy()->subDays(29);

        $weeklyBookings = Booking::whereBetween('start_date', [$weekStart, $now])->count();
        $weeklyBookingsTarget = 50;

        $bookingsPerDay = Booking::whereBetween('start_date', [$weekStart, $now])
            ->groupBy('start_date')
            ->selectRaw('DATE(start_date) as date, COUNT(*) as count')
            ->pluck('count', 'date')
            ->toArray();

        $lastMonthBookings = Booking::whereBetween('start_date', [$monthStart, $now])
            ->groupBy('start_date')
            ->selectRaw('DATE(start_date) as date, COUNT(*) as count')
            ->pluck('count', 'date')
            ->toArray();

        $lastMonthDates = array_map(function ($date) {
            return Carbon::parse($date)->format('M d');
        }, array_keys($lastMonthBookings));

        return response()->json([
            'weeklyBookings' => $weeklyBookings,
            'weeklyBookingsTarget' => $weeklyBookingsTarget,
            'bookingsPerDay' => array_values($bookingsPerDay),
            'lastMonthDates' => $lastMonthDates,
            'lastMonthBookings' => array_values($lastMonthBookings),
        ]);
    }
}