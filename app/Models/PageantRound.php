<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PageantRound extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function candidates(): BelongsToMany
    {
        return $this->belongsToMany(Candidate::class, 'candidate_rounds')->withPivot('order')->orderByPivot('order');
    }

    public function candidatesDeduction(): BelongsToMany
    {
        return $this->belongsToMany(Candidate::class, 'round_deductions')->withPivot('deduction');
    }
}
