<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerInfo extends Model
{
    protected $table = 'customer_info';

    protected $fillable = [
        'user_id',
        'customer_type',
        'queue_num_id',
        'first_name',
        'last_name',
        'birthdate',
        'contact_no',
    ];
}
