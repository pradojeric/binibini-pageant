<?php

namespace App\Imports;

use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\CSV\Writer as CsvWriter;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SpreadsheetTemplate
{
    /**
     * @param  list<string>  $columns
     * @param  'csv'|'xlsx'  $format
     */
    public function download(array $columns, string $name, string $format): BinaryFileResponse
    {
        $path = tempnam(sys_get_temp_dir(), 'import-template-');
        $writer = $format === 'xlsx' ? new XlsxWriter() : new CsvWriter();

        $writer->openToFile($path);
        $writer->addRow(Row::fromValues($columns));
        $writer->close();

        return response()->download($path, "$name-template.$format")->deleteFileAfterSend();
    }
}
