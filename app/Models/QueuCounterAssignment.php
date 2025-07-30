<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueuCounterAssignment extends Model
{
    protected $table ="queue_counter_user_assignments";
    public $timestamps = false;

    protected $fillable = [
        'counter_id',
        'user_id',
        'assigned_at',
        'unassigned_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function counter()
    {
        return $this->belongsTo(QueuCounters::class, 'counter_id');
    }
}
