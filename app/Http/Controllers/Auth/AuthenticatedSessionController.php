<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Events\UserOnlineStatusUpdated;
use App\Models\QueuCounterAssignment;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        if (!in_array($user->id_cms_privileges, [3, 11, 12])) {
            Auth::logout();
            return redirect()->back()->withErrors([
                'email' => 'You are not authorized to log in.',
            ]);
        }
        
        $user->login_status = 'Online';
        $user->save();

        if ($user->id_cms_privileges == 3) {
            $is_assigned = QueuCounterAssignment::where('user_id', $user->id)->whereNull('unassigned_at')->first();
            if(!$is_assigned){
                return redirect()->route('counters');
            }
            // event(new UserOnlineStatusUpdated($user));
        }

        if($user->id_cms_privileges == 11){
            return redirect()->route('display');
        }

        if($user->id_cms_privileges == 12){
            return redirect()->route('dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            $user->login_status = 'Offline';
            $user->save();

            if ($user->id_cms_privileges == 3) {
                $is_assigned = QueuCounterAssignment::where('user_id', $user->id)
                    ->whereNull('unassigned_at')
                    ->first();

                if ($is_assigned) {
                    $is_assigned->update([
                        'unassigned_at' => now(),
                    ]);
                }

                event(new UserOnlineStatusUpdated($user));
            }
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
