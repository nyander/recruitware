<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TableSubmissionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/api/dashboard-data', [DashboardController::class, 'getDashboardData']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('tablesubmissions', TableSubmissionController::class)->only(['index', 'store', 'create']);

    // New routes for bookings and clients
    Route::get('/bookings', [TableSubmissionController::class, 'bookings'])->name('bookings.index');
    Route::get('/clients', [TableSubmissionController::class, 'clients'])->name('clients.index');
});

require __DIR__.'/auth.php';