<?php

namespace App\Http\Controllers;

use App\Events\QueueCallServing;
use App\Events\QueueCompleteCallServing;
use App\Models\CustomerInfo;
use App\Models\QueuCounterAssignment;
use App\Models\QueueIssueDescriptions;
use App\Models\QueueModelList;
use App\Models\QueueNumbers;
use App\Models\QueueServiceType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        // Split by prefix
        $priority = $waitingQueues->filter(fn($q) => str_starts_with($q->queue_number, 'P'))->values();
        $regular = $waitingQueues->filter(fn($q) => str_starts_with($q->queue_number, 'R'))->values();

        $interleaved = collect();

        // Interleave if priority arrived later
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

        // On-call queues (for this assigned counter only)
        $OnCallQueueNumbers = QueueNumbers::with(['laneType', 'serviceType', 'counter'])
            ->whereIn('status', ['serving', 'For Repair'])
            ->where('counter_id', $assigned_counter->counter_id)
            ->get();

        $QueueServiceType = QueueServiceType::orderBy('id', 'asc')->get();
        $QueueModelList = QueueModelList::orderBy('id', 'asc')->get();
        $QueueIssueDescriptions = QueueIssueDescriptions::orderBy('id', 'asc')->get();
        $QueueTodaysLogs = QueueNumbers::with(['laneType', 'serviceType', 'counter'])
            ->whereIn('status', ['completed', 'cancelled'])
            ->whereDate('queue_date', Carbon::today())
            ->where('counter_id', $assigned_counter->counter_id)
            ->orderBy('completed_at', 'desc')
            ->get();

        $QueueTodaysUnserved = QueueNumbers::with(['laneType', 'serviceType', 'counter'])
            ->where('status', 'unserved')
            ->whereDate('queue_date', Carbon::today())
            ->where('counter_id', $assigned_counter->counter_id)
            ->orderBy('completed_at', 'desc')
            ->get();

        return Inertia::render('ServiceCounter', [
            'QueueNumbers' => $interleaved->values(),
            'OnCallQueueNumbers' => $OnCallQueueNumbers,
            'branch_id' => Auth::user()->branch_id,
            'QueueServiceType' => $QueueServiceType,
            'QueueModelList' => $QueueModelList,
            'QueueIssueDescriptions' => $QueueIssueDescriptions,
            'QueueTodaysLogs' => $QueueTodaysLogs,
            'QueueTodaysUnserved' => $QueueTodaysUnserved,
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
        $queue->is_proceed_repair = $request->decision;
        $queue->status = $request->decision === 'yes' ? 'For Repair' : 'cancelled';
        
        if ($request->decision === 'no') {
            $queue->completed_at = now();
            $queue->cancel_reason = $request->reason;
        }

        $queue->save();

        // event(new QueueCompleteCallServing($queue));

        return back()->with('success', 'Queue is now For Repair.');
    }

    public function unserved(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:queue_numbers,id',
        ]);

        $queue = QueueNumbers::find($request->id);
        $queue->status = 'unserved';
        $queue->cancel_reason = 'no show';
        $queue->completed_at = now();
        $queue->save();

        event(new QueueCompleteCallServing($queue));

        return back()->with('success', 'Queue Unserved.');
    }

    public function completeServingPlane(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:queue_numbers,id',
        ]);

        $queue = QueueNumbers::find($request->id);
        $queue->status = 'completed';
        $queue->completed_at = now();
        $queue->save();

        event(new QueueCompleteCallServing($queue));

        return back()->with('success', 'Queue Unserved.');
    }

    public function updatePriority(Request $request)
    {
        $validated = $request->validate([
            'queue_num_id' => 'required',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'contact' => 'required|string|max:20',
            'service_type_id' => 'required|integer', 
            'model_ids' => 'required_if:service_type_id,1|array',
            'issue_ids' => 'required_if:service_type_id,1|array',
        ]);

        DB::beginTransaction();
        try {
            $queue = QueueNumbers::where('id', $validated['queue_num_id'])
                ->lockForUpdate()
                ->first();

            if (!$queue) {
                throw new \Exception("Queue Number not found.");
            }

            $queue->update([
                'service_type_id' => $validated['service_type_id'],
                'is_proceed_repair' => 'yes',
                'status' => 'For Repair',
                'model' => json_encode(collect($validated['model_ids'])->pluck('value')->toArray()) ?? null,
                'issue_desc' => json_encode(collect($validated['issue_ids'])->pluck('value')->toArray()) ?? null,
            ]);

            CustomerInfo::insert([
                'customer_type' => 'Walk-in',
                'queue_num_id' => $validated['queue_num_id'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'birthdate' => $validated['birth_date'],
                'contact_no' => $validated['contact'],
                'created_at' => now(),
            ]);

            DB::commit();
            return back()->with('success', 'Queue registered successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }
}
