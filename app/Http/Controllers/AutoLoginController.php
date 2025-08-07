<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AutoLoginController extends Controller
{
    public function redirectToSite2($id)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->back()->withErrors('User not authenticated');
        }

        $token = Str::random(64);
        $hashed = hash('sha256', $token);

        try {
            DB::table('auto_login_tokens')->insert([
                'user_id' => $user->id,
                'token' => $hashed,
                'expires_at' => now()->addMinutes(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->withErrors('Token generation failed: ' . $th->getMessage());
        }

        $redirectUrl = "/admin/returns_header/add/{$id}";
        $fullUrl = "http://antriku-v2.test/auto-login?token={$token}&redirect=" . urlencode($redirectUrl);

        return redirect($fullUrl);
    }
}
