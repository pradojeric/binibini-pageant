<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Pageant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Fills an existing pageant with fake candidates and the preset criteria below.
 *
 * php artisan db:seed --class=PageantDataSeeder
 */
class PageantDataSeeder extends Seeder
{
    /**
     * Criteria per round. Each round's percentages should total 100.
     */
    private const CRITERIA = [
        1 => [
            ['name' => 'Beauty & Poise', 'percentage' => 40, 'group' => 1],
            ['name' => 'Stage Presence', 'percentage' => 30, 'group' => 1],
            ['name' => 'Intelligence', 'percentage' => 30, 'group' => 1],
        ],
        2 => [
            ['name' => 'Final Question', 'percentage' => 60, 'group' => 1],
            ['name' => 'Overall Impact', 'percentage' => 40, 'group' => 1],
        ],
    ];

    public function run(): void
    {
        $pageants = Pageant::orderBy('id')->get(['id', 'pageant', 'type', 'rounds']);

        if ($pageants->isEmpty()) {
            $this->command->error('No pageants found. Create one first.');
            return;
        }

        $this->command->table(
            ['ID', 'Pageant', 'Type', 'Rounds'],
            $pageants->map(fn(Pageant $p) => [$p->id, $p->pageant, $p->type, $p->rounds])->all()
        );

        $pageant = $pageants->firstWhere('id', (int) $this->command->ask('Pageant ID to fill'));

        if (! $pageant) {
            $this->command->error('No pageant with that ID.');
            return;
        }

        if ($pageant->candidates()->exists() || $pageant->criterias()->exists()) {
            $this->command->warn("{$pageant->pageant} already has candidates or criteria. Nothing was changed.");
            return;
        }

        $perDivision = (int) $this->command->ask('Candidates per division', '10');

        if ($perDivision < 1) {
            $this->command->error('Candidates per division must be at least 1.');
            return;
        }

        $picture = $this->placeholderPicture();

        DB::transaction(function () use ($pageant, $perDivision, $picture) {
            foreach ($pageant->divisions as $division) {
                for ($i = 1; $i <= $perDivision; $i++) {
                    Candidate::create([
                        'pageant_id'       => $pageant->id,
                        'candidate_number' => $i,
                        'first_name'       => $this->firstName($division),
                        'last_name'        => fake()->lastName(),
                        'middle_name'      => fake()->lastName(),
                        'gender'           => $division,
                        'nickname'         => fake()->firstName(),
                        'description'      => fake()->sentence(),
                        'picture'          => $picture,
                    ]);
                }
            }

            foreach (self::CRITERIA as $round => $criterias) {
                if ($round > $pageant->rounds) {
                    continue;
                }

                foreach ($criterias as $criteria) {
                    $pageant->criterias()->create($criteria + ['round' => $round, 'hidden_scoring' => false]);
                }
            }
        });

        $divisions = implode(', ', $pageant->divisions);
        $this->command->info("Created {$perDivision} candidates per division ({$divisions}) for {$pageant->pageant}.");

        $missing = array_diff(range(1, $pageant->rounds), array_keys(self::CRITERIA));

        if ($missing) {
            $this->command->warn('No preset criteria for round(s) ' . implode(', ', $missing) . '. Add them in PageantDataSeeder::CRITERIA or through the app.');
        }
    }

    /**
     * Candidate pictures are served from the public disk (/storage/...), but the placeholder ships in public/,
     * so copy it onto the disk once and return the path to store.
     */
    private function placeholderPicture(): string
    {
        $path = 'placeholders/placeholder-image.png';

        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, file_get_contents(public_path($path)));
        }

        return $path;
    }

    private function firstName(string $division): string
    {
        return match ($division) {
            'mr'    => fake()->firstNameMale(),
            'ms'    => fake()->firstNameFemale(),
            default => fake()->firstName(),
        };
    }
}
