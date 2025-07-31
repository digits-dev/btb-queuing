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
                    'counter_name' => $user->assigned_counter->counter->name ?? null,
                    'counter_id' => $user->assigned_counter->counter->id,
                ];
            });

        // 🔁 Fetch waiting queues and order by creation
        $waitingQueues = QueueNumbers::with(['laneType', 'counter'])
            ->where('branch_id', Auth::user()->branch_id)
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->get();

        // ✅ Split into priority and regular based on prefix (P and R)
        $priority = $waitingQueues->filter(fn($q) => str_starts_with($q->queue_number, 'P'))->values();
        $regular = $waitingQueues->filter(fn($q) => str_starts_with($q->queue_number, 'R'))->values();

        $interleaved = collect();

        // ✅ Interleave or append based on first entry time
        if (
            $priority->isNotEmpty() &&
            $regular->isNotEmpty() &&
            $priority->first()->created_at < $regular->first()->created_at
        ) {
            $interleaved = $priority->concat($regular);
        } else {
            for ($i = 0; $i < max($priority->count(), $regular->count()); $i++) {
                if (isset($priority[$i])) $interleaved->push($priority[$i]);
                if (isset($regular[$i])) $interleaved->push($regular[$i]);
            }
        }

        // 👇 Same for on-call queues (optional)
        $OnCallQueueNumbers = QueueNumbers::with(['laneType', 'serviceType', 'counter'])
            ->where('status', 'serving')
            ->where('branch_id', Auth::user()->branch_id)
            ->get();

        return Inertia::render('Display', [
            'online_users' => $online_users,
            'QueueNumbers' => $interleaved->values(),
            'OnCallQueueNumbers' => $OnCallQueueNumbers,
            'branch_id' => Auth::user()->branch_id,
        ]);
    }
}
