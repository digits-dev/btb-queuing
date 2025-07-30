<?php

use App\Http\Controllers\BranchesController;
use App\Http\Controllers\CounterPickerController;
use App\Http\Controllers\DisplayController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QrLoginController;
use App\Http\Controllers\QueueRegistrationController;
use App\Http\Controllers\ServiceCounterController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // return Inertia::render('Welcome', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);
    return redirect('/login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/counters', [CounterPickerController::class, 'show'])->name('counters');
    Route::get('/dashboard', [QueueRegistrationController::class, 'show'])->name('dashboard');
    Route::get('/display', [DisplayController::class, 'show'])->name('display');
    Route::get('/service-counter', [ServiceCounterController::class, 'show'])->name('service-counter');

    Route::post('/dashboard/queue/register', [QueueRegistrationController::class, 'store'])->name('queue.store');
    Route::post('/dashboard/queue/check-repair-pickup', [QueueRegistrationController::class, 'checkPickup'])->name('queue.check.pickup');
    Route::post('/counters/queue/save-pick', [CounterPickerController::class, 'saveCounterPick'])->name('queue.counter.save-pick');
    Route::post('/service-counter/queue/call-customer', [ServiceCounterController::class, 'callCustomer'])->name('queue.service-counter.call');
    Route::post('/service-counter/queue/complete', [ServiceCounterController::class, 'complete'])->name('queue.service-counter.complete');

});

Route::get('/qr-login/{token}', [QrLoginController::class, 'login'])->name('qr.login');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/generate-qr', [QrLoginController::class, 'generate']);
});

require __DIR__.'/auth.php';
