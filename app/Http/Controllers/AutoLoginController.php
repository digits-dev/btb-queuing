<?php

namespace App\Http\Controllers;

use App\Models\CustomerInfo;
use App\Models\QueueNumbers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;

class AutoLoginController extends Controller
{

    public function redirectToSite2($id)
    {
        $user = Auth::user();
        $get_queue = QueueNumbers::where('id', $id)->first();

        if (!$user) {
            return redirect()->back()->withErrors('User not authenticated');
        }

        if ($get_queue->user_id !== null) {
            $queryData = User::with(['other_info'])->where('id', $get_queue->user_id)->first();
        } else {
            $queryData = CustomerInfo::where('queue_num_id', $get_queue->id)->first();
        }

        if (!$queryData) {
            return redirect()->back()->withErrors('No customer info found.');
        }

        $dataToSend = [
            'first_name' => $queryData->first_name ?? '',
            'last_name' => $queryData->last_name ?? '',
            'email' => $queryData->email ?? '',
            'contact' => $queryData->contact_no ?? '',
            'birthdate' => $queryData->birthdate     ?? '',
        ];

        $encrypted = Crypt::encrypt($dataToSend);

        $redirectUrl = '/admin/returns_header/add';
        $fullRedirectUrl = $redirectUrl . '?' . http_build_query(['data' => $encrypted]);

        $token = Str::random(64);
        $hashed = hash('sha256', $token);

        DB::table('auto_login_tokens')->insert([
            'user_id' => $user->id,
            'token' => $hashed,
            'expires_at' => now()->addMinutes(30),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $fullUrl = "https://tickets1.beyondthebox.ph/auto-login?" . http_build_query([
            'token' => $token,
            'redirect' => $fullRedirectUrl
        ]);

        return redirect($fullUrl);
    }
}
