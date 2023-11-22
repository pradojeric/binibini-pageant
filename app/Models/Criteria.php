<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Criteria extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function candidates(): BelongsToMany
    {
        return $this->belongsToMany(Candidate::class)->withPivot(['user_id', 'score'])->withTimestamps();
    }

    public function judges(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'candidate_criteria', 'user_id')->withPivot(['score', 'ranking'])->withTimestamps();
    }
}
