<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\ExternalAuthService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    protected $externalAuthService;
    public function getDashboardData(): JsonResponse
    {
        $now = Carbon::now();
        $weekStart = $now->startOfWeek();
        $monthStart = $now->copy()->subDays(29);
        $menu = $this->externalAuthService->getMenuData();


        $weeklyBookings = Booking::whereBetween('start_date', [$weekStart, $now])->count();
        $weeklyBookingsTarget = 50; // Set your target here

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
            'menu' => $menu,
        ]);
    }
}