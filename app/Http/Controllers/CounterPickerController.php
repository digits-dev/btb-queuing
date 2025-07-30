<?php

namespace App\Http\Controllers;

use App\Events\UserOnlineStatusUpdated;
use App\Models\QueuCounterAssignment;
use App\Models\QueuCounters;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CounterPickerController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        $branch_counters = QueuCounters::where('branch_id', $user->branch_id)
            ->where('is_active', 1)
            ->with(['currentAssignment.user'])
            ->get();

        return Inertia::render('CounterPicker', [
            'branch_counters' => $branch_counters
        ]);
    }

    public function saveCounterPick(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'counter_id' => 'required|exists:queue_counters,id',
        ]);

        $alreadyAssigned = QueuCounterAssignment::where('user_id', $user->id)->whereNull('unassigned_at')->first();
        if ($alreadyAssigned) {
            return back()->withErrors([
                'counter_id' => 'You already have an assigned counter.',
            ]);
        }

        QueuCounterAssignment::insert([
            'counter_id' => $data['counter_id'],
            'user_id' => $user->id,
            'assigned_at' => now(),
        ]);
        
        $counter_name = QueuCounters::where('id', $data['counter_id'])->pluck('name')->first();

        event(new UserOnlineStatusUpdated($user, $counter_name));
        
        return redirect()->route('service-counter')->with('success', 'Counter assigned successfully.');
    }
}
