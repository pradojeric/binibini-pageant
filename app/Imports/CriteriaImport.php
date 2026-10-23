<?php

namespace App\Imports;

use App\Models\Pageant;

class CriteriaImport extends RowImport
{
    private const TRUE_VALUES = ['1', 'yes', 'y', 'true'];

    private const FALSE_VALUES = ['0', 'no', 'n', 'false'];

    public function columns(): array
    {
        return ['name', 'round', 'group', 'percentage', 'hidden_scoring'];
    }

    protected function rules(Pageant $pageant): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'round'          => ['required', 'integer', 'min:1'],
            'group'          => ['required', 'integer', 'min:1'],
            'percentage'     => ['required', 'numeric', 'min:1', 'max:100'],
            'hidden_scoring' => ['boolean'],
        ];
    }

    protected function normalize(array $row): array
    {
        $values = [];
        foreach ($this->columns() as $column) {
            $values[$column] = self::blankToNull($row[$column] ?? null);
        }

        if (is_int($values['name']) || is_float($values['name'])) {
            $values['name'] = (string) $values['name'];
        }
        $values['round'] = self::wholeNumber($values['round']);
        $values['group'] = self::wholeNumber($values['group']);
        $values['hidden_scoring'] = $this->parseBoolean($values['hidden_scoring']);

        return $values;
    }

    protected function keyField(): string
    {
        return 'name';
    }

    protected function matchKey(array $values): string
    {
        return mb_strtolower(trim((string) $values['name'])) . '|' . $values['round'];
    }

    protected function existing(Pageant $pageant): iterable
    {
        return $pageant->criterias()->get();
    }

    protected function create(Pageant $pageant, array $values): void
    {
        $pageant->criterias()->create($values);
    }

    /** Unrecognized values are returned as-is so the boolean rule reports them. */
    private function parseBoolean(mixed $value): mixed
    {
        if ($value === null || is_bool($value)) {
            return (bool) $value;
        }

        $normalized = strtolower(trim((string) $value));

        return match (true) {
            in_array($normalized, self::TRUE_VALUES, true)  => true,
            in_array($normalized, self::FALSE_VALUES, true) => false,
            default                                         => $value,
        };
    }
}
