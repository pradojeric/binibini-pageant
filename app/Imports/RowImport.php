<?php

namespace App\Imports;

use App\Models\Pageant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Validates spreadsheet rows for one pageant and upserts them by a match key.
 */
abstract class RowImport
{
    /** @return list<string> template / accepted columns, in order */
    abstract public function columns(): array;

    abstract protected function rules(Pageant $pageant): array;

    /** Map a raw row onto the model's columns, coercing spreadsheet values. */
    abstract protected function normalize(array $row): array;

    /** The field that the duplicate-in-file error is attached to. */
    abstract protected function keyField(): string;

    abstract protected function matchKey(array $values): string;

    /** @return iterable<Model> existing records of this pageant */
    abstract protected function existing(Pageant $pageant): iterable;

    abstract protected function create(Pageant $pageant, array $values): void;

    /**
     * @param  array<int, array<string, mixed>>  $rows  raw rows keyed by row number
     * @return list<array{row: int, values: array, errors: array<string, string>, action: string}>
     */
    public function preview(Pageant $pageant, array $rows): array
    {
        $existing = collect($this->existing($pageant))->keyBy(fn(Model $model) => $this->matchKey($model->getAttributes()));
        $seen = [];
        $preview = [];

        foreach ($rows as $rowNumber => $row) {
            $values = $this->normalize($row);
            $errors = collect(Validator::make($values, $this->rules($pageant))->errors()->messages())
                ->map(fn(array $messages) => $messages[0])
                ->all();

            $key = $this->matchKey($values);
            if (! isset($errors[$this->keyField()]) && isset($seen[$key])) {
                $errors[$this->keyField()] = "Duplicate of row {$seen[$key]}.";
            }
            $seen[$key] ??= $rowNumber;

            $preview[] = [
                'row'    => (int) $rowNumber,
                'values' => $values,
                'errors' => $errors,
                'action' => $existing->has($key) ? 'update' : 'create',
            ];
        }

        return $preview;
    }

    /**
     * Validate every row again and save them all, or nothing.
     *
     * @return array{created: int, updated: int}
     */
    public function commit(Pageant $pageant, array $rows): array
    {
        $preview = $this->preview($pageant, $rows);

        $messages = [];
        foreach ($preview as $i => $row) {
            foreach ($row['errors'] as $field => $message) {
                $messages["rows.$i.$field"] = "Row {$row['row']}: $message";
            }
        }
        if ($messages) {
            throw ValidationException::withMessages($messages);
        }

        return DB::transaction(function () use ($pageant, $preview) {
            $existing = collect($this->existing($pageant))->keyBy(fn(Model $model) => $this->matchKey($model->getAttributes()));
            $counts = ['created' => 0, 'updated' => 0];

            foreach ($preview as $row) {
                $model = $existing->get($this->matchKey($row['values']));
                if ($model) {
                    $model->update($row['values']);
                    $counts['updated']++;
                } else {
                    $this->create($pageant, $row['values']);
                    $counts['created']++;
                }
            }

            return $counts;
        });
    }

    protected static function blankToNull(mixed $value): mixed
    {
        return $value === '' ? null : $value;
    }

    /** Spreadsheets often store whole numbers as floats (1.0). */
    protected static function wholeNumber(mixed $value): mixed
    {
        if (is_float($value) && floor($value) === $value) {
            return (int) $value;
        }

        return is_string($value) && preg_match('/^\d+(\.0+)?$/', $value) ? (int) $value : $value;
    }
}
