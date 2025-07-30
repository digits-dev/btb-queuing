<?php

namespace App\Http\Controllers;

use App\Models\LoginToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrLoginController extends Controller
{
    public function generate(Request $request)
    {
        $user = Auth::user();
        $token = Str::uuid();

        LoginToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addMinutes(10),
        ]);

        $url = URL::signedRoute('qr.login', ['token' => $token]);

        // Force cast to string to avoid [object Object]
        $qrSvg = (string) QrCode::format('svg')->size(300)->generate($url);

        return Inertia::render('Auth/QrCodeLogin', [
            'qr' => $qrSvg,
            'url' => $url,
        ]);
    }

    public function login(Request $request, $token)
    {
        $loginToken = LoginToken::where('token', $token)
            ->where('expires_at', '>', now())
            ->where('used', false)
            ->with('user')
            ->firstOrFail();

        if (!$loginToken->user) {
            abort(403, 'Invalid token user');
        }

        $loginToken->update(['used' => true]);

        Auth::login($loginToken->user);

        return redirect('/display');
    }
}
