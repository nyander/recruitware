<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'location',
        'last_name',
        'first_name',
        'age',
        'avail_window',
        'shift_pattern',
        'classification',
        'email',
        'phone',
        'ref',
        'assessed_pack',
    ];

    protected $casts = [
        'age' => 'integer',
        'assessed_pack' => 'boolean',
    ];
}
