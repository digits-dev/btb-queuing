<?php

namespace App\Http\Controllers;

use App\Events\QueueCallServing;
use App\Events\QueueCompleteCallServing;
use App\Models\QueuCounterAssignment;
use App\Models\QueueNumbers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ServiceCounterController extends Controller
{
    public function show()
    {
        $assigned_counter = QueuCounterAssignment::where('user_id', Auth::user()->id)
            ->whereNull('unassigned_at')
            ->first();

        // 🔁 Fetch waiting queues for this branch
        $waitingQueues = QueueNumbers::with(['laneType', 'serviceType', 'counter'])
            ->where('status', 'waiting')
            ->where('branch_id', Auth::user()->branch_id)
            ->orderBy('created_at')
            ->get();

        // ✅ Split by prefix
        $priority = $waitingQueues->filter(fn($q) => str_starts_with($q->queue_number, 'P'))->values();
        $regular = $waitingQueues->filter(fn($q) => str_starts_with($q->queue_number, 'R'))->values();

        $interleaved = collect();

        // ✅ Interleave if priority arrived later
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

        // 👇 On-call queues (for this assigned counter only)
        $OnCallQueueNumbers = QueueNumbers::with(['laneType', 'serviceType', 'counter'])
            ->where('status', 'serving')
            ->where('counter_id', $assigned_counter->counter_id)
            ->get();

        return Inertia::render('ServiceCounter', [
            'QueueNumbers' => $interleaved->values(),
            'OnCallQueueNumbers' => $OnCallQueueNumbers,
            'branch_id' => Auth::user()->branch_id,
        ]);
    }


    public function callCustomer(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:queue_numbers,id',
        ]);

        $assigned_counter = QueuCounterAssignment::with(['counter'])->where('user_id', Auth::id())
            ->whereNull('unassigned_at')
            ->first();

        if (!$assigned_counter) {
            return back()->with('error', 'No counter assigned.');
        }

        $queue = QueueNumbers::where('id', $request->id)
            ->where('status', 'waiting')
            ->first();

        if (!$queue) {
            return back()->with('error', 'Queue number already called or not in waiting state.');
        }

        $queue->status = 'serving';
        $queue->called_at = now();
        $queue->counter_id = $assigned_counter->counter_id;
        $queue->save();

        event(new QueueCallServing($queue));

        return back()->with('success', 'Customer called.');
    }

    public function complete(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:queue_numbers,id',
            'decision' => 'required|in:yes,no',
            'reason' => 'nullable|string|max:255',
        ]);

        $queue = QueueNumbers::find($request->id);
        $queue->status = 'completed';
        $queue->completed_at = now();
        $queue->is_proceed_repair = $request->decision;
        $queue->status = $request->decision === 'yes' ? 'completed' : 'cancelled';

        if ($request->decision === 'no') {
            $queue->cancel_reason = $request->reason;
        }

        $queue->save();

        event(new QueueCompleteCallServing($queue));

        return back()->with('success', 'Queue completed.');
    }
}
