<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Events\QueueRegistration;
use App\Models\Branch;
use App\Models\CustomerInfo;
use App\Models\QueuCounterAssignment;
use App\Models\QueueIssueDescriptions;
use App\Models\QueueLaneTypes;
use App\Models\QueueModelList;
use App\Models\QueueNumbers;
use App\Models\QueueServiceType;
use App\Models\ReturnsHeader;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QueueRegistrationController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        $QueueLaneType = QueueLaneTypes::orderBy('id', 'desc')->get();
        $QueueServiceType = QueueServiceType::orderBy('id', 'asc')->get();
        $QueueModelList = QueueModelList::orderBy('id', 'asc')->get();
        $QueueIssueDescriptions = QueueIssueDescriptions::orderBy('id', 'asc')->get();
        $branches = Branch::orderBy('id', 'asc')->get();
        $get_my_data = User::with(['other_info'])->where('id', $user->id)->first();
        
        return Inertia::render('Dashboard', [
            'QueueLaneType' => $QueueLaneType,
            'QueueServiceType' => $QueueServiceType,
            'QueueModelList' => $QueueModelList,
            'QueueIssueDescriptions' => $QueueIssueDescriptions,
            'branch_id' => Auth::user()->branch_id,
            'branches' => $branches,
            'get_my_data' => $get_my_data,
            'id_cms_privileges' => $user->id_cms_privileges,
        ]);
    }

    public function selectBranch(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => ['required'],
        ]);

        $is_branch_exist = Branch::where('id', $validated['branch_id'])->first();

        if (!$is_branch_exist) {
            return back()->with('error', 'Branch did not exist.');
        }

        $update_user_branch = User::where('id', Auth::user()->id)->update([
            'branch_id' => $validated['branch_id'],
        ]);

        if ($update_user_branch) {
            return back()->with('success', 'Branch selected successfully.');
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $validator = Validator::make($request->all(), [
            'lane_id' => ['required', 'exists:queue_lane_types,id'],

            'firstName' => [
                Rule::requiredIf($user->id_cms_privileges == 12),
                'string',
            ],

            'lastName' => [
                Rule::requiredIf($user->id_cms_privileges == 12),
                'string',
            ],

            'contactNo' => [
                Rule::requiredIf($user->id_cms_privileges == 12),
            ],

            'birthDate' => [
                Rule::requiredIf($user->id_cms_privileges == 12),
            ],

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
        $today = Carbon::today();
        $prefix = $data['lane_id'] == 2 ? 'R' : ($data['lane_id'] == 1 ? 'P' : '');

        $queue = DB::transaction(function () use ($data, $user, $today, $prefix) {
            $lastQueue = DB::table('queue_numbers')
                ->where('branch_id', $user->branch_id)
                ->whereDate('queue_date', $today)
                ->where('queue_number', 'like', $prefix . '%')
                ->orderByDesc(DB::raw("CAST(SUBSTRING(queue_number, 2) AS UNSIGNED)"))
                ->lockForUpdate()
                ->value('queue_number');

            $lastNumber = $lastQueue ? (int)substr($lastQueue, 1) : 0;
            $nextNumber = $lastNumber + 1;
            $nextQueueNumber = $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

            $queue = QueueNumbers::create([
                'branch_id'       => $user->branch_id,
                'counter_id'      => null,
                'user_id'         => $user->id_cms_privileges == 12 ? null : $user->id,
                'lane_type_id'    => $data['lane_id'],
                'service_type_id' => $data['service_id'] ?? null,
                'model'           => json_encode($data['model_ids'] ?? []),
                'issue_desc'      => json_encode($data['issue_ids'] ?? []),
                'queue_number'    => $nextQueueNumber,
                'queue_date'      => $today,
                'priority_qualification' => $data['qualification'] ?? null,
            ]);

            if ($user->id_cms_privileges == 12) {
                CustomerInfo::insert([
                    'customer_type' => 'Walk-In',
                    'queue_num_id'  => $queue->id,
                    'first_name'    => $data['firstName'],
                    'last_name'     => $data['lastName'],
                    'birthdate'     => $data['birthDate'],
                    'contact_no'    => $data['contactNo'],
                    'created_at'    => now()
                ]);
            }

            return $queue;
        });

        $queue->load(['laneType', 'serviceType']);
        $laneName = $queue->laneType->name ?? 'Unknown';

        event(new QueueRegistration($queue, $laneName));

        return redirect()->back()->with([
            'success' => "Registered with queue #{$queue->queue_number}",
            'queue_info' => [
                'number'  => $queue->queue_number,
                'lane'    => $queue->laneType->name ?? '',
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
