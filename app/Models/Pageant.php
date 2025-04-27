<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pageant extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime:F d, Y h:i A',
        'updated_at' => 'datetime:F d, Y h:i A',
    ];

    public function criterias(): HasMany
    {
        return $this->hasMany(Criteria::class);
    }

    public function judges(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'judge_pageant', 'pageant_id', 'judge_id');
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class)->orderBy('gender', 'desc')->orderBy('candidate_number');
    }

    public function awards(): BelongsToMany
    {
        return $this->belongsToMany(Candidate::class, 'pageant_award')->withPivot(['award', 'ranking'])->withTimestamps();
    }

    public function pageantRounds(): HasMany
    {
        return $this->hasMany(PageantRound::class);
    }

    public function status(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (is_null($value)) {
                    return $this->current_round > 0
                        ? 'Ongoing'
                        : 'Not yet started';
                }

                return $value;
            }
        );
    }
}
