<?php

namespace App\Imports;

use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenSpout\Common\Exception\OpenSpoutException;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;

class SpreadsheetReader
{
    /**
     * Read the first sheet of a .csv/.xlsx upload. The first row is the header.
     *
     * @return array<int, array<string, mixed>> rows keyed by spreadsheet row number
     */
    public function read(UploadedFile $file): array
    {
        $reader = strtolower($file->getClientOriginalExtension()) === 'xlsx' ? new XlsxReader() : new CsvReader();

        try {
            $reader->open($file->getRealPath());

            $rows = [];
            foreach ($reader->getSheetIterator() as $sheet) {
                $headers = null;
                foreach ($sheet->getRowIterator() as $rowNumber => $row) {
                    $values = array_map($this->cellValue(...), $row->toArray());

                    if ($headers === null) {
                        $headers = array_map(self::normalizeHeader(...), $values);
                        continue;
                    }

                    if (collect($values)->every(fn($value) => $value === null || $value === '')) {
                        continue;
                    }

                    $rows[$rowNumber] = collect($headers)
                        ->mapWithKeys(fn($header, $i) => [$header => $values[$i] ?? null])
                        ->except('')
                        ->all();
                }
                break;
            }
        } catch (OpenSpoutException) {
            throw ValidationException::withMessages(['file' => 'The file could not be read. Upload a valid .csv or .xlsx file.']);
        } finally {
            $reader->close();
        }

        return $rows;
    }

    public static function normalizeHeader(mixed $header): string
    {
        return (string) Str::of((string) $header)->trim()->lower()->replaceMatches('/[\s\-]+/', '_');
    }

    private function cellValue(mixed $value): mixed
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        return is_string($value) ? trim($value) : $value;
    }
}
