<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\CandidateCriteria;
use App\Models\Pageant;
use App\Models\User;
use App\Services\PageantScoreService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Fills an existing pageant with fake candidates, the preset criteria below, existing judges and their scores.
 * Each part is optional and only fills what is missing; nothing is deleted or overwritten.
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

    public function run(PageantScoreService $scoreService): void
    {
        $pageant = $this->askPageant();

        if (! $pageant) {
            return;
        }

        if ($this->command->confirm('Fill candidates?', true)) {
            $this->seedCandidates($pageant);
        }

        if ($this->command->confirm('Fill criteria?', true)) {
            $this->seedCriteria($pageant);
        }

        if ($this->command->confirm('Assign judges?', true)) {
            $this->seedJudges($pageant);
        }

        if ($this->command->confirm('Fill scores for every round?', true)) {
            $this->seedScores($pageant, $scoreService);
        }
    }

    private function askPageant(): ?Pageant
    {
        $pageants = Pageant::orderBy('id')->get(['id', 'pageant', 'type', 'rounds']);

        if ($pageants->isEmpty()) {
            $this->command->error('No pageants found. Create one first.');
            return null;
        }

        $this->command->table(
            ['ID', 'Pageant', 'Type', 'Rounds'],
            $pageants->map(fn(Pageant $p) => [$p->id, $p->pageant, $p->type, $p->rounds])->all()
        );

        $pageant = $pageants->firstWhere('id', (int) $this->command->ask('Pageant ID to fill'));

        if (! $pageant) {
            $this->command->error('No pageant with that ID.');
        }

        return $pageant;
    }

    /**
     * Only divisions with no candidates yet are filled.
     */
    private function seedCandidates(Pageant $pageant): void
    {
        $existing = $pageant->candidates()->pluck('gender')->unique();
        $empty    = array_values(array_diff($pageant->divisions, $existing->all()));

        if (! $empty) {
            $this->command->warn('Every division already has candidates. Skipped.');
            return;
        }

        $perDivision = (int) $this->command->ask('Candidates per division', '10');

        if ($perDivision < 1) {
            $this->command->error('Candidates per division must be at least 1. Skipped candidates.');
            return;
        }

        $picture = $this->placeholderPicture();

        DB::transaction(function () use ($pageant, $empty, $perDivision, $picture) {
            foreach ($empty as $division) {
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
        });

        $this->command->info("Created {$perDivision} candidates per division (" . implode(', ', $empty) . ').');
    }

    /**
     * Only rounds with no criteria yet are filled.
     */
    private function seedCriteria(Pageant $pageant): void
    {
        $filled = $pageant->criterias()->distinct()->pluck('round')->all();
        $seeded = [];

        DB::transaction(function () use ($pageant, $filled, &$seeded) {
            foreach (self::CRITERIA as $round => $criterias) {
                if ($round > $pageant->rounds || in_array($round, $filled)) {
                    continue;
                }

                foreach ($criterias as $criteria) {
                    $pageant->criterias()->create($criteria + ['round' => $round, 'hidden_scoring' => false]);
                }

                $seeded[] = $round;
            }
        });

        $this->command->info($seeded ? 'Created criteria for round(s) ' . implode(', ', $seeded) . '.' : 'Every preset round already has criteria. Skipped.');

        $missing = array_diff(range(1, $pageant->rounds), array_keys(self::CRITERIA), $filled);

        if ($missing) {
            $this->command->warn('No preset criteria for round(s) ' . implode(', ', $missing) . '. Add them in PageantDataSeeder::CRITERIA or through the app.');
        }
    }

    private function seedJudges(Pageant $pageant): void
    {
        $judges   = User::where('role', 'judge')->orderBy('id')->get(['id', 'name', 'email']);
        $attached = $pageant->judges()->pluck('users.id');

        if ($judges->isEmpty()) {
            $this->command->error('No judge users found. Create them first.');
            return;
        }

        $this->command->table(
            ['ID', 'Name', 'Email', 'Assigned'],
            $judges->map(fn(User $j) => [$j->id, $j->name, $j->email, $attached->contains($j->id) ? 'yes' : ''])->all()
        );

        $ids = collect(explode(',', (string) $this->command->ask('Judge IDs to assign, comma-separated (blank to skip)', '')))
            ->map(fn($id) => (int) trim($id))
            ->filter()
            ->unique();

        $unknown = $ids->diff($judges->pluck('id'));

        if ($unknown->isNotEmpty()) {
            $this->command->error('Not judge users: ' . $unknown->implode(', ') . '. No judges were assigned.');
            return;
        }

        $pageant->judges()->syncWithoutDetaching($ids->all());

        $this->command->info($ids->isEmpty() ? 'No judges assigned.' : 'Assigned judge(s) ' . $ids->implode(', ') . '.');
    }

    /**
     * Rounds are scored in order because each later round takes the top candidates of the one before.
     */
    private function seedScores(Pageant $pageant, PageantScoreService $scoreService): void
    {
        $judges = $pageant->judges()->pluck('users.id');

        if ($judges->isEmpty()) {
            $this->command->error('The pageant has no judges. Assign judges first. Skipped scores.');
            return;
        }

        // Hidden criteria are entered by staff, so their rows belong to an admin like in AdminScoringController.
        $adminId = User::where('role', 'admin')->orderBy('id')->value('id');

        for ($round = 1; $round <= $pageant->rounds; $round++) {
            $rows = $pageant->roundRows($round)->load('candidates');

            if ($rows->isEmpty()) {
                $this->command->warn("Round {$round} has no round setup. Stopped scoring here.");
                return;
            }

            DB::transaction(fn() => $this->selectCandidates($pageant, $round, $rows, $scoreService));

            $candidateIds = $pageant->roundRows($round)->load('candidates')
                ->flatMap(fn($row) => $row->candidates->pluck('id'));
            $criterias    = $pageant->criterias()->where('round', $round)->get();

            if ($criterias->isEmpty()) {
                $this->command->warn("Round {$round} has no criteria. Stopped scoring here.");
                return;
            }

            $now      = now();
            $inserted = 0;

            DB::transaction(function () use ($criterias, $candidateIds, $judges, $adminId, $now, &$inserted) {
                foreach ($criterias as $criteria) {
                    if ($criteria->hidden_scoring && ! $adminId) {
                        $this->command->warn("No admin user to own hidden scores for {$criteria->name}. Skipped it.");
                        continue;
                    }

                    // A hidden score is one row per criteria + candidate, whoever entered it.
                    $existing = $criteria->hidden_scoring
                        ? CandidateCriteria::where('criteria_id', $criteria->id)->pluck('candidate_id')->flip()
                        : collect();
                    $scorers  = $criteria->hidden_scoring ? collect([$adminId]) : $judges;
                    $rows     = [];

                    foreach ($candidateIds as $candidateId) {
                        if ($existing->has($candidateId)) {
                            continue;
                        }

                        foreach ($scorers as $userId) {
                            $rows[] = [
                                'user_id'      => $userId,
                                'criteria_id'  => $criteria->id,
                                'candidate_id' => $candidateId,
                                // Same range a judge can submit: half the percentage up to the full percentage.
                                'score'        => random_int((int) round($criteria->percentage / 2), (int) $criteria->percentage),
                                'created_at'   => $now,
                                'updated_at'   => $now,
                            ];
                        }
                    }

                    // The unique index on (user_id, candidate_id, criteria_id) skips scores that already exist.
                    $inserted += CandidateCriteria::insertOrIgnore($rows);
                }
            });

            $this->command->info("Round {$round}: {$candidateIds->count()} candidates, {$inserted} new scores.");
        }
    }

    /**
     * Fills only division rows that have no candidates yet: round 1 takes the lowest candidate numbers,
     * later rounds take the highest totals from the round before, as staff would on Select Candidate.
     */
    private function selectCandidates(Pageant $pageant, int $round, $rows, PageantScoreService $scoreService): void
    {
        $previous = $round > 1
            ? $scoreService->getCandidateScores($pageant, $round - 1)->sortByDesc('total')
            : $pageant->candidates()->get()->sortBy('candidate_number');

        foreach ($rows as $division => $row) {
            if ($row->candidates->isNotEmpty()) {
                continue;
            }

            $ids = $previous
                ->filter(fn($c) => $c['gender'] === $division)
                ->take($row->number_of_candidates)
                ->pluck('id')
                ->values();

            $row->candidates()->attach($ids->mapWithKeys(fn($id, $index) => [$id => ['order' => $index + 1]])->all());
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
