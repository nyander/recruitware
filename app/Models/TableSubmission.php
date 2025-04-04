<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_ref',
        'full_name',
        'email',
        'shift_pattern',
        'location',
        'first_name',
        'last_name',
        'job_type',
        'phone',
        'assessed',
        'date_of_birth',
        'branch',
        'avail_window',
        'classification',
        'county',
    ];

    protected $casts = [
        'assessed' => 'boolean',
        'date_of_birth' => 'date',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'candidate_id');
    }
}