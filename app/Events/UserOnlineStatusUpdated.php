<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class UserOnlineStatusUpdated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $user;
    public $counter_name;

    public function __construct(User $user, $counter_name = null)
    {
        $this->user = $user;
        $this->counter_name = $counter_name;
    }

    public function broadcastOn()
    {
        return new Channel('login-status-updates');
    }

    public function broadcastAs()
    {
        return 'UserOnlineStatusUpdated';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->user->id,
            'branch_id' => $this->user->branch_id,
            'name' => $this->user->name,
            'login_status' => $this->user->login_status,
            'counter_name' => $this->counter_name,
        ];
    }
}

