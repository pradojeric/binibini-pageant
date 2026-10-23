<?php

namespace App\Http\Controllers;

use App\Imports\CandidateImport;
use App\Imports\CriteriaImport;
use App\Imports\RowImport;
use App\Imports\SpreadsheetReader;
use App\Imports\SpreadsheetTemplate;
use App\Models\Pageant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ImportController extends Controller
{
    private const MAX_ROWS = 500;

    public function preview(Request $request, Pageant $pageant, string $type, SpreadsheetReader $reader)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx', 'max:2048'],
        ]);

        $rows = $reader->read($request->file('file'));
        if (count($rows) === 0) {
            return response()->json(['errors' => ['file' => ['The file has no data rows.']]], 422);
        }
        if (count($rows) > self::MAX_ROWS) {
            return response()->json(['errors' => ['file' => ['The file has more than ' . self::MAX_ROWS . ' rows.']]], 422);
        }

        $import = $this->import($type);

        return response()->json([
            'columns' => $import->columns(),
            'rows'    => $import->preview($pageant, $rows),
        ]);
    }

    public function store(Request $request, Pageant $pageant, string $type)
    {
        $validated = $request->validate([
            'rows'          => ['required', 'array', 'min:1', 'max:' . self::MAX_ROWS],
            'rows.*.row'    => ['required', 'integer', 'min:1'],
            'rows.*.values' => ['required', 'array'],
        ]);

        $rows = collect($validated['rows'])->mapWithKeys(fn(array $row) => [$row['row'] => $row['values']])->all();
        $counts = $this->import($type)->commit($pageant, $rows);

        return back()->with('message', "Import complete: {$counts['created']} created, {$counts['updated']} updated.");
    }

    public function template(Request $request, Pageant $pageant, string $type, SpreadsheetTemplate $template)
    {
        $validated = $request->validate([
            'format' => ['required', Rule::in(['csv', 'xlsx'])],
        ]);

        return $template->download($this->import($type)->columns(), $type, $validated['format']);
    }

    private function import(string $type): RowImport
    {
        return match ($type) {
            'candidates' => new CandidateImport(),
            'criterias'  => new CriteriaImport(),
        };
    }
}
