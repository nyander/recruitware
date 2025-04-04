<?php
// app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use App\Services\ExternalAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $externalAuthService;

    public function __construct(ExternalAuthService $externalAuthService)
    {
        $this->externalAuthService = $externalAuthService;
    }


    public function index()
    {
        $menu = $this->externalAuthService->getMenuData();

        return Inertia::render('Dashboard', [
            'menu' => $menu
        ]);
    }

    public function getDashboardData(): JsonResponse
    {
        try {
            // First try to get data from external service if available
            $externalData = $this->getExternalData();

            if ($externalData) {
                return response()->json($externalData);
            }

            // If no external data, return demo data
            return response()->json($this->getDemoData());
        } catch (\Exception $e) {
            Log::error('Dashboard data error: ' . $e->getMessage());

            // On error, still return demo data to keep UI working
            return response()->json($this->getDemoData());
        }
    }

    private function getExternalData()
    {
        try {
            // Add your external service data fetching logic here
            return null; // Return null if no data available
        } catch (\Exception $e) {
            Log::error('External data fetch error: ' . $e->getMessage());
            return null;
        }
    }

    private function getDemoData(): array
    {
        $now = Carbon::now();
        $weeklyBookings = rand(30, 45);
        $weeklyTarget = 50;

        // Generate some realistic-looking daily booking numbers
        $bookingsPerDay = [];
        for ($i = 0; $i < 5; $i++) {
            $bookingsPerDay[] = rand(5, 15);
        }

        // Generate monthly trend data
        $lastMonthDates = [];
        $lastMonthBookings = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $lastMonthDates[] = $date->format('M d');
            $lastMonthBookings[] = rand(3, 20);
        }

        return [
            'weeklyBookings' => $weeklyBookings,
            'weeklyBookingsTarget' => $weeklyTarget,
            'bookingsPerDay' => $bookingsPerDay,
            'lastMonthDates' => $lastMonthDates,
            'lastMonthBookings' => $lastMonthBookings,
            'kpis' => [
                'totalActive' => rand(100, 200),
                'newThisWeek' => rand(10, 30),
                'completionRate' => rand(75, 95) . '%'
            ],
            'recentActivity' => $this->getRecentActivityDemo(),
            'isDemo' => true // Flag to indicate this is demo data
        ];
    }

    private function getRecentActivityDemo(): array
    {
        $activities = [
            'New candidate registration',
            'Booking confirmed',
            'Assessment completed',
            'Document uploaded',
            'Profile updated'
        ];

        $statuses = ['completed', 'pending', 'in-progress'];
        $recent = [];

        for ($i = 0; $i < 5; $i++) {
            $recent[] = [
                'type' => $activities[array_rand($activities)],
                'time' => Carbon::now()->subHours(rand(1, 24))->diffForHumans(),
                'status' => $statuses[array_rand($statuses)]
            ];
        }

        return $recent;
    }
}
