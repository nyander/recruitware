<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TableSubmissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UnderDevelopmentController;
use App\Http\Middleware\DevAuthMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome page - accessible to all
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

Route::middleware(['external.auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/api/dashboard-data', [DashboardController::class, 'getDashboardData']);
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::resource('tablesubmissions', TableSubmissionController::class)->only(['index', 'store', 'create']);
    
    // New routes for bookings and clients
    Route::get('/bookings', [TableSubmissionController::class, 'bookings'])->name('bookings.index');
    Route::get('/clients', [TableSubmissionController::class, 'clients'])->name('clients.index');
    
    // Candidates routes
    Route::prefix('candidates')->name('candidates.')->group(function () {
        Route::get('/live', [CandidateController::class, 'live'])->name('live');
        Route::get('/new', [CandidateController::class, 'new'])->name('new');
        Route::get('/audit', [CandidateController::class, 'audit'])->name('audit');
        Route::get('/pending', [CandidateController::class, 'pending'])->name('pending');
        Route::get('/leavers', [CandidateController::class, 'leavers'])->name('leavers');
        Route::get('/archive', [CandidateController::class, 'archive'])->name('archive');
        Route::get('/no-contact', [CandidateController::class, 'noContactList'])->name('no-contact');
        Route::get('/{id}/edit', [CandidateController::class, 'edit'])->name('edit');
        Route::post('/store', [CandidateController::class, 'store'])->name('store');
        Route::put('/{id}', [CandidateController::class, 'update'])->name('update');
    });
    Route::get('/{name}/{call}', [CandidateController::class, 'getCandidatePage'])->name('candidates.page');
    Route::get('/candidate/form-settings', [CandidateController::class, 'getFormSettings'])->name('candidate.form-settings');

    // Clients routes
    Route::prefix('clients')->name('clients.')->group(function () {
        Route::get('/', [UnderDevelopmentController::class, 'show'])->name('index');
        Route::get('/contacts', [UnderDevelopmentController::class, 'show'])->name('contacts');
        Route::get('/jobs', [UnderDevelopmentController::class, 'show'])->name('jobs');
        Route::get('/contracts', [UnderDevelopmentController::class, 'show'])->name('contracts');
        Route::get('/second-tier-contracts', [UnderDevelopmentController::class, 'show'])->name('second-tier-contracts');
        Route::get('/archive', [UnderDevelopmentController::class, 'show'])->name('archive');
    });
    
    // Human Resources routes
    Route::prefix('hr')->name('hr.')->group(function () {
        Route::get('/staff-details', [UnderDevelopmentController::class, 'show'])->name('staff-details');
        Route::get('/supplier-companies', [UnderDevelopmentController::class, 'show'])->name('supplier-companies');
        Route::get('/training', [UnderDevelopmentController::class, 'show'])->name('training');
        Route::get('/hot-arrivals', [UnderDevelopmentController::class, 'show'])->name('hot-arrivals');
        Route::get('/staff-reporting', [UnderDevelopmentController::class, 'show'])->name('staff-reporting');
        Route::get('/starters', [UnderDevelopmentController::class, 'show'])->name('starters');
        Route::get('/leavers', [UnderDevelopmentController::class, 'show'])->name('leavers');
        Route::get('/audit', [UnderDevelopmentController::class, 'show'])->name('audit');
    });
    
    // Rota routes
    Route::prefix('rota')->name('rota.')->group(function () {
        Route::get('/staff', [UnderDevelopmentController::class, 'show'])->name('staff');
        Route::get('/meetings', [UnderDevelopmentController::class, 'show'])->name('meetings');
        Route::get('/staff-hours', [UnderDevelopmentController::class, 'show'])->name('staff-hours');
    });
    
    // Planning routes
    Route::prefix('planning')->name('planning.')->group(function () {
        Route::get('/ad-hoc', [UnderDevelopmentController::class, 'show'])->name('ad-hoc');
        Route::get('/fte-shifts', [UnderDevelopmentController::class, 'show'])->name('fte-shifts');
        Route::get('/daily-bookings', [UnderDevelopmentController::class, 'show'])->name('daily-bookings');
        Route::get('/unfilled-bookings', [UnderDevelopmentController::class, 'show'])->name('unfilled-bookings');
        Route::get('/unfilled-shifts', [UnderDevelopmentController::class, 'show'])->name('unfilled-shifts');
        Route::get('/cancelled-bookings', [UnderDevelopmentController::class, 'show'])->name('cancelled-bookings');
        Route::get('/timesheets', [UnderDevelopmentController::class, 'show'])->name('timesheets');
        Route::get('/oncall-sheets', [UnderDevelopmentController::class, 'show'])->name('oncall-sheets');
        Route::get('/payroll-issues', [UnderDevelopmentController::class, 'show'])->name('payroll-issues');
    });
    
    // Payroll routes
    Route::prefix('payroll')->name('payroll.')->group(function () {
        Route::get('/client-hours', [UnderDevelopmentController::class, 'show'])->name('client-hours');
        Route::get('/costings', [UnderDevelopmentController::class, 'show'])->name('costings');
        Route::get('/invoicing', [UnderDevelopmentController::class, 'show'])->name('invoicing');
        Route::get('/payroll', [UnderDevelopmentController::class, 'show'])->name('payroll');
        Route::get('/remittances', [UnderDevelopmentController::class, 'show'])->name('remittances');
        Route::get('/reports', [UnderDevelopmentController::class, 'show'])->name('reports');
    });
    
    // Invoicing routes
    Route::prefix('invoicing')->name('invoicing.')->group(function () {
        Route::get('/financial', [UnderDevelopmentController::class, 'show'])->name('financial');
        Route::get('/hr-report', [UnderDevelopmentController::class, 'show'])->name('hr-report');
    });
});

require __DIR__.'/auth.php';