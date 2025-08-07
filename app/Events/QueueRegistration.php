<?php

namespace App\Events;

use App\Models\QueueNumbers;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class QueueRegistration implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $queue;
    public $laneName;

    public function __construct(QueueNumbers $queue, $laneName)
    {
        $this->queue = $queue;
        $this->laneName = $laneName;
    }

    public function broadcastOn()
    {
        return new Channel('queue-registration');
    }

    public function broadcastAs()
    {
        return 'QueueRegistration';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->queue->id,
            'queue_number' => $this->queue->queue_number,
            'lane_name' => $this->laneName,
            'lane_type_id' => $this->queue->lane_type_id,
            'status' => $this->queue->status,
            'branch_id' => $this->queue->branch_id,
        ];
    }
}
