<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueuCounters extends Model
{
    protected $table="queue_counters";

    public function currentAssignment()
    {
        return $this->hasOne(QueuCounterAssignment::class, 'counter_id')
            ->whereNull('unassigned_at')
            ->latest('assigned_at');
    }
}
