<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateCriteria extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $table = 'candidate_criteria';

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(Criteria::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
