<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Candidate extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['full_name', 'full_name_last_name_first'];

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn() => trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name . ' ' . $this->name_ext),
        );
    }

    protected function fullNameLastNameFirst(): Attribute
    {
        return Attribute::make(
            get: fn() => trim($this->last_name . ', ' . $this->first_name . ' ' . $this->middle_name . ' ' . $this->name_ext),
        );
    }

    public function criterias(): BelongsToMany
    {
        return $this->belongsToMany(Criteria::class)->withPivot(['score'])->withTimestamps();
    }
}
