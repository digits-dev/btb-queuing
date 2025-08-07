<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerInfo extends Model
{
    protected $table = 'customer_info';

    protected $fillable = [
        'user_id',
        'birthdate',
        'contact_no',
    ];
}
