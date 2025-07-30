<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueNumbers extends Model
{
    protected $table = "queue_numbers";
    public $timestamps = false;

    protected $fillable = [
        'branch_id',
        'counter_id',
        'user_id',
        'lane_type_id',
        'service_type_id',
        'model',
        'issue_desc',
        'queue_number',
        'queue_date',
        'priority_qualification',
        'status',
        'created_at',
        'called_at',
        'completed_at',
    ];

    public function laneType()
    {
        return $this->belongsTo(QueueLaneTypes::class, 'lane_type_id');
    }

    public function serviceType()
    {
        return $this->belongsTo(QueueServiceType::class, 'service_type_id');
    }

    public function counter()
    {
        return $this->belongsTo(QueuCounters::class, 'counter_id');
    }
}
