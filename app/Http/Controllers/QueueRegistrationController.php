<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Events\QueueRegistration;
use App\Models\QueuCounterAssignment;
use App\Models\QueueIssueDescriptions;
use App\Models\QueueLaneTypes;
use App\Models\QueueModelList;
use App\Models\QueueNumbers;
use App\Models\QueueServiceType;
use App\Models\ReturnsHeader;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QueueRegistrationController extends Controller
{
    public function show()
    {
        $QueueLaneType = QueueLaneTypes::orderBy('id', 'desc')->get();
        $QueueServiceType = QueueServiceType::orderBy('id', 'asc')->get();
        $QueueModelList = QueueModelList::orderBy('id', 'asc')->get();
        $QueueIssueDescriptions = QueueIssueDescriptions::orderBy('id', 'asc')->get();

        return Inertia::render('Dashboard', [
            'QueueLaneType' => $QueueLaneType,
            'QueueServiceType' => $QueueServiceType,
            'QueueModelList' => $QueueModelList,
            'QueueIssueDescriptions' => $QueueIssueDescriptions,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lane_id'     => ['required', 'exists:queue_lane_types,id'],

            'qualification' => [
                Rule::requiredIf($request->lane_id == 1),
                'string',
            ],

            'service_id' => [
                Rule::requiredIf($request->lane_id != 1),
                'exists:queue_service_types,id',
            ],

            'model_ids' => [
                Rule::requiredIf($request->lane_id != 1 && $request->service_id == 1),
                'array',
            ],
            'model_ids.*' => [
                Rule::requiredIf($request->lane_id != 1 && $request->service_id == 1),
                'exists:queue_model_list,id',
            ],

            'issue_ids' => [
                Rule::requiredIf($request->lane_id != 1 && $request->service_id == 1),
                'array',
            ],
            'issue_ids.*' => [
                Rule::requiredIf($request->lane_id != 1 && $request->service_id == 1),
                'exists:queue_issue_desc,id',
            ],
        ]);

        $data = $validator->validate();
        $user = Auth::user();
        $today = Carbon::today();
        $prefix = $data['lane_id'] == 2 ? 'R' : ($data['lane_id'] == 1 ? 'P' : '');

        $queue = DB::transaction(function () use ($data, $user, $today, $prefix) {
            // Locking for simultaneous submit
            $lastQueue = DB::table('queue_numbers')
                ->where('branch_id', $user->branch_id)
                ->whereDate('queue_date', $today)
                ->where('queue_number', 'like', $prefix . '%')
                ->orderByDesc(DB::raw("CAST(SUBSTRING(queue_number, 2) AS UNSIGNED)"))
                ->lockForUpdate()
                ->value('queue_number');

            // Generate Queue Number
            $lastNumber = $lastQueue ? (int)substr($lastQueue, 1) : 0;
            $nextNumber = $lastNumber + 1;
            $nextQueueNumber = $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

            return QueueNumbers::create([
                'branch_id'       => $user->branch_id,
                'counter_id'      => null,
                'user_id'         => $user->id,
                'lane_type_id'    => $data['lane_id'],
                'service_type_id' => $data['service_id'] ?? null,
                'model'           => json_encode($data['model_ids'] ?? []),
                'issue_desc'      => json_encode($data['issue_ids'] ?? []),
                'queue_number'    => $nextQueueNumber,
                'queue_date'      => $today,
                'priority_qualification' => $data['qualification'] ?? null,
            ]);
        });

        $queue->load('laneType');
        $laneName = $queue->laneType->name ?? 'Unknown';

        event(new QueueRegistration($queue, $laneName));

        return redirect()->back()->with([
            'success' => "Registered with queue #{$queue->queue_number}",
            'queue_info' => [
                'number' => $queue->queue_number,
                'lane'   => $queue->laneType->name ?? '',
                'service' => $queue->serviceType->name ?? '',
            ],
        ]);
    }

    public function checkPickup(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'size:10'],
        ]);

        $get_for_pickup_jo = ReturnsHeader::where('reference_no', $validated['code'])->first();

        if (!$get_for_pickup_jo) {
            return back()->with('error', 'No record found with that code.');
        }

        if (!in_array($get_for_pickup_jo->repair_status, [13, 19, 22, 28, 38])) {
            return back()->with('error', 'Your Repair is not yet available for pickup!');
        }

        return back()->with('success', 'Repair is ready for pickup!');
    }
}
