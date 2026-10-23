<?php

namespace App\Imports;

use App\Enums\Division;
use App\Models\Pageant;
use Illuminate\Validation\Rule;

class CandidateImport extends RowImport
{
    public function columns(): array
    {
        return ['candidate_number', 'last_name', 'first_name', 'middle_name', 'name_ext', 'gender', 'nickname', 'description'];
    }

    protected function rules(Pageant $pageant): array
    {
        return [
            'candidate_number' => ['required', 'integer', 'min:1'],
            'last_name'        => ['required', 'string', 'max:255'],
            'first_name'       => ['required', 'string', 'max:255'],
            'middle_name'      => ['nullable', 'string', 'max:255'],
            'name_ext'         => ['nullable', 'string', 'max:255'],
            'gender'           => ['required', Rule::in($pageant->divisions)],
            'nickname'         => ['required', 'string', 'max:255'],
            'description'      => ['required', 'string'],
        ];
    }

    protected function normalize(array $row): array
    {
        $values = [];
        foreach ($this->columns() as $column) {
            $values[$column] = self::blankToNull($row[$column] ?? null);
        }

        $values['candidate_number'] = self::wholeNumber($values['candidate_number']);
        foreach (['last_name', 'first_name', 'middle_name', 'name_ext', 'nickname', 'description'] as $column) {
            if (is_int($values[$column]) || is_float($values[$column])) {
                $values[$column] = (string) $values[$column];
            }
        }

        // Accept the label ("Mr.", "Hiyas") as well as the key ("mr").
        if (is_string($values['gender'])) {
            $key = rtrim(strtolower($values['gender']), '.');
            $values['gender'] = Division::tryFrom($key)?->value ?? $values['gender'];
        }

        return $values;
    }

    protected function keyField(): string
    {
        return 'candidate_number';
    }

    protected function matchKey(array $values): string
    {
        return $values['candidate_number'] . '|' . $values['gender'];
    }

    protected function existing(Pageant $pageant): iterable
    {
        return $pageant->candidates()->get();
    }

    protected function create(Pageant $pageant, array $values): void
    {
        $pageant->candidates()->create($values);
    }
}
