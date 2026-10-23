<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Tests\TestCase;

class ImportTest extends TestCase
{
    use RefreshDatabase;

    private const CANDIDATE_HEADER = 'candidate_number,last_name,first_name,middle_name,name_ext,gender,nickname,description';

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function pageant(string $type = 'mr&ms'): Pageant
    {
        return Pageant::create([
            'pageant'       => 'Import Pageant',
            'type'          => $type,
            'rounds'        => 1,
            'current_round' => 1,
            'current_group' => 1,
        ]);
    }

    private function csv(string ...$lines): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('import.csv', implode("\n", $lines));
    }

    private function xlsx(array $rows): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'import-test-') . '.xlsx';
        $writer = new XlsxWriter();
        $writer->openToFile($path);
        foreach ($rows as $row) {
            $writer->addRow(Row::fromValues($row));
        }
        $writer->close();

        return new UploadedFile($path, 'import.xlsx', null, null, true);
    }

    private function preview(Pageant $pageant, string $type, UploadedFile $file)
    {
        return $this->post(route('pageants.import.preview', ['pageant' => $pageant->id, 'type' => $type]), ['file' => $file]);
    }

    private function commit(Pageant $pageant, string $type, array $previewRows)
    {
        $rows = array_map(fn(array $row) => ['row' => $row['row'], 'values' => $row['values']], $previewRows);

        return $this->post(route('pageants.import.store', ['pageant' => $pageant->id, 'type' => $type]), ['rows' => $rows]);
    }

    public function test_candidate_preview_flags_invalid_and_duplicate_rows()
    {
        $this->actingAs($this->admin());
        $pageant = $this->pageant();

        $response = $this->preview($pageant, 'candidates', $this->csv(
            "\u{FEFF}" . self::CANDIDATE_HEADER,
            '1,Doe,John,,,Mr.,Johnny,Bio',
            '2,Roe,Jane,,,hiyas,Janie,Bio',
            '3,,Max,,,ms,Maxi,Bio',
            '1,Poe,Jim,,,mr,Jimmy,Bio',
        ));

        $response->assertOk();
        $rows = $response->json('rows');
        $this->assertSame([2, 3, 4, 5], array_column($rows, 'row'));
        $this->assertSame('mr', $rows[0]['values']['gender']);
        $this->assertSame([], $rows[0]['errors']);
        $this->assertArrayHasKey('gender', $rows[1]['errors']);
        $this->assertArrayHasKey('last_name', $rows[2]['errors']);
        $this->assertSame('Duplicate of row 2.', $rows[3]['errors']['candidate_number']);
    }

    public function test_candidate_commit_upserts_by_number_and_division()
    {
        $this->actingAs($this->admin());
        $pageant = $this->pageant();
        $existing = Candidate::create([
            'pageant_id'       => $pageant->id,
            'candidate_number' => 1,
            'first_name'       => 'Old',
            'last_name'        => 'Name',
            'gender'           => 'mr',
        ]);

        $rows = $this->preview($pageant, 'candidates', $this->csv(
            self::CANDIDATE_HEADER,
            '1,Doe,John,,,mr,Johnny,Bio',
            '1,Roe,Jane,,,ms,Janie,Bio',
        ))->json('rows');

        $this->assertSame(['update', 'create'], array_column($rows, 'action'));

        $this->commit($pageant, 'candidates', $rows)
            ->assertRedirect()
            ->assertSessionHas('message', 'Import complete: 1 created, 1 updated.');

        $this->assertSame(2, $pageant->candidates()->count());
        $this->assertSame('John', $existing->fresh()->first_name);
        $this->assertSame('Jane', $pageant->candidates()->where('gender', 'ms')->value('first_name'));
    }

    public function test_candidate_commit_with_an_invalid_row_saves_nothing()
    {
        $this->actingAs($this->admin());
        $pageant = $this->pageant();

        $response = $this->commit($pageant, 'candidates', [
            ['row' => 2, 'values' => ['candidate_number' => 1, 'last_name' => 'Doe', 'first_name' => 'John', 'gender' => 'mr', 'nickname' => 'J', 'description' => 'Bio']],
            ['row' => 3, 'values' => ['candidate_number' => 2, 'last_name' => 'Roe', 'first_name' => 'Jane', 'gender' => 'hiyas', 'nickname' => 'J', 'description' => 'Bio']],
        ]);

        $response->assertSessionHasErrors('rows.1.gender');
        $this->assertSame(0, $pageant->candidates()->count());
    }

    public function test_criteria_import_upserts_by_name_and_round_from_xlsx()
    {
        $this->actingAs($this->admin());
        $pageant = $this->pageant();
        $existing = Criteria::create([
            'pageant_id' => $pageant->id,
            'name'       => 'Beauty',
            'round'      => 1,
            'group'      => 1,
            'percentage' => 20,
        ]);

        $rows = $this->preview($pageant, 'criterias', $this->xlsx([
            ['Name', 'Round', 'Group', 'Percentage', 'Hidden Scoring'],
            [' beauty ', 1, 2, 50, 'yes'],
            ['Beauty', 2, 1, 40, ''],
            ['Wit', 1, 1, 30, 'maybe'],
        ]))->assertOk()->json('rows');

        $this->assertSame(['update', 'create', 'create'], array_column($rows, 'action'));
        $this->assertTrue($rows[0]['values']['hidden_scoring']);
        $this->assertFalse($rows[1]['values']['hidden_scoring']);
        $this->assertArrayHasKey('hidden_scoring', $rows[2]['errors']);

        $this->commit($pageant, 'criterias', array_slice($rows, 0, 2))->assertSessionHasNoErrors();

        $this->assertSame(2, $pageant->criterias()->count());
        $existing->refresh();
        $this->assertSame(2, (int) $existing->group);
        $this->assertSame(50.0, (float) $existing->percentage);
        $this->assertTrue((bool) $existing->hidden_scoring);
    }

    public function test_criteria_preview_flags_duplicates_within_the_file()
    {
        $this->actingAs($this->admin());
        $pageant = $this->pageant();

        $rows = $this->preview($pageant, 'criterias', $this->csv(
            'name,round,group,percentage,hidden_scoring',
            'Beauty,1,1,50,0',
            'BEAUTY,1,2,50,1',
        ))->json('rows');

        $this->assertSame('Duplicate of row 2.', $rows[1]['errors']['name']);
    }

    public function test_preview_rejects_a_file_without_data_rows()
    {
        $this->actingAs($this->admin());

        $this->preview($this->pageant(), 'candidates', $this->csv(self::CANDIDATE_HEADER))
            ->assertStatus(422)
            ->assertJsonPath('errors.file.0', 'The file has no data rows.');
    }

    public function test_templates_download_with_headers()
    {
        $this->actingAs($this->admin());
        $pageant = $this->pageant();

        $csv = $this->get(route('pageants.import.template', ['pageant' => $pageant->id, 'type' => 'candidates', 'format' => 'csv']));
        $csv->assertOk()->assertDownload('candidates-template.csv');
        // The BOM lets Excel open the file as UTF-8.
        $this->assertSame("\u{FEFF}" . self::CANDIDATE_HEADER, trim(file_get_contents($csv->getFile()->getPathname())));

        $xlsx = $this->get(route('pageants.import.template', ['pageant' => $pageant->id, 'type' => 'criterias', 'format' => 'xlsx']));
        $xlsx->assertOk()->assertDownload('criterias-template.xlsx');

        $reader = new XlsxReader();
        $reader->open($xlsx->getFile()->getPathname());
        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $this->assertSame(['name', 'round', 'group', 'percentage', 'hidden_scoring'], $row->toArray());
                break 2;
            }
        }
        $reader->close();
    }

    public function test_non_admins_cannot_import()
    {
        $pageant = $this->pageant();
        $this->actingAs(User::factory()->create(['role' => 'judge']));

        $this->preview($pageant, 'candidates', $this->csv(self::CANDIDATE_HEADER, '1,Doe,John,,,mr,J,Bio'))->assertForbidden();
        $this->commit($pageant, 'criterias', [['row' => 2, 'values' => ['name' => 'Beauty']]])->assertForbidden();
        $this->get(route('pageants.import.template', ['pageant' => $pageant->id, 'type' => 'candidates', 'format' => 'csv']))->assertForbidden();
    }
}
