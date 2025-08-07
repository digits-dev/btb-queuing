<?php

namespace App\Http\Controllers;

use App\Models\QueueNumbers;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DisplayController extends Controller
{
    public function show()
    {
        $online_users = User::with(['assigned_counter.counter'])
            ->where('id_cms_privileges', 3)
            ->where('login_status', 'Online')
            ->where('branch_id', Auth::user()->branch_id)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'branch_id' => $user->branch_id,
                    'name' => $user->name,
                    'login_status' => $user->login_status,
                    'counter_name' => $user->assigned_counter->counter->name,
                    'counter_id' => $user->assigned_counter->counter->id,
                ];
            });

        $QueueNumbers = QueueNumbers::with(['laneType', 'counter'])->where('branch_id', Auth::user()->branch_id)->where('status', 'waiting')->limit(16)->get();
        $OnCallQueueNumbers = QueueNumbers::with(['laneType', 'serviceType', 'counter'])->whereIn('status', ['serving', 'For Repair'])->where('branch_id', Auth::user()->branch_id)->get();

        return Inertia::render('Display', [
            'online_users' => $online_users,
            'QueueNumbers' => $QueueNumbers,
            'OnCallQueueNumbers' => $OnCallQueueNumbers,
            'branch_id' => Auth::user()->branch_id,
        ]);
    }
}
