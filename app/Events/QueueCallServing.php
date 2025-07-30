<?php

namespace App\Events;

use App\Models\QueueNumbers;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class QueueCallServing implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $queue;

    public function __construct(QueueNumbers $queue)
    {
        $this->queue = $queue;
    }

    public function broadcastOn()
    {
        return new Channel('queue-call-serving');
    }

    public function broadcastAs()
    {
        return 'QueueCallServing';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->queue->id,
            'queue_number' => $this->queue->queue_number,
            'counter_id' => $this->queue->counter_id,
            'branch_id' => $this->queue->branch_id,
        ];
    }
}
