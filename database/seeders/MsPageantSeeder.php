<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Models\PageantRound;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MsPageantSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            // 1. Create Pageant
            $pageant = Pageant::create([
                'pageant'       => 'Ms. Universe 2026',
                'type'          => 'ms',
                'rounds'        => 2,
                'current_round' => 1,
                'status'        => 'open',
                'background'    => 'pageants/default-bg.jpg', // Placeholder
            ]);

            $this->command->info("Created Pageant: {$pageant->pageant}");

            // 2. Create Rounds
            $round1 = PageantRound::create([
                'pageant_id'           => $pageant->id,
                'pageant_type'         => 'ms',
                'round'                => 1,
                'round_name'           => 'Preliminary Round',
                'number_of_candidates' => 6,
            ]);

            $round2 = PageantRound::create([
                'pageant_id'           => $pageant->id,
                'pageant_type'         => 'ms',
                'round'                => 2,
                'round_name'           => 'Final Round',
                'number_of_candidates' => 3,
            ]);

            $this->command->info("Created Rounds: {$round1->round_name}, {$round2->round_name}");

            // 3. Create Criterias for Round 1
            $c1 = Criteria::create([
                'pageant_id'     => $pageant->id,
                'round'          => 1,
                'group'          => 1,
                'name'           => 'Beauty & poise',
                'percentage'     => 50,
                'hidden_scoring' => false,
            ]);
            $c2 = Criteria::create([
                'pageant_id'     => $pageant->id,
                'round'          => 1,
                'group'          => 1,
                'name'           => 'Intelligence',
                'percentage'     => 50,
                'hidden_scoring' => false,
            ]);
            $this->command->info("Created Criterias for Round 1");


            // 4. Create Candidates
            // We need 6 candidates total.
            // All 6 in Round 1.
            // Only 3 in Round 2.

            $candidates = [];
            for ($i = 1; $i <= 6; $i++) {
                $candidate = Candidate::create([
                    'pageant_id'       => $pageant->id,
                    'candidate_number' => $i,
                    'first_name'       => fake()->firstNameFemale(),
                    'last_name'        => fake()->lastName(),
                    'middle_name'      => fake()->lastName(),
                    'gender'           => 'ms',
                    'nickname'         => fake()->firstName(),
                    'description'      => fake()->sentence(),
                    'picture'          => 'placeholders/placeholder-image.jpg', // Placeholder image
                ]);
                $candidates[] = $candidate;
            }
            $this->command->info("Created 6 Candidates");

            // 5. Assign Candidates to Rounds
            // Round 1: All 6 candidates
            $round1->candidates()->attach(collect($candidates)->pluck('id'));
            $this->command->info("Assigned 6 Candidates to Round 1");


            // Round 2: Top 3 candidates (just picking first 3 for seeding)
            $top3 = array_slice($candidates, 0, 3);
            $round2->candidates()->attach(collect($top3)->pluck('id'));
            $this->command->info("Assigned 3 Candidates to Round 2");

            // Create Criteria for Round 2
            Criteria::create([
                'pageant_id'     => $pageant->id,
                'round'          => 2,
                'group'          => 1,
                'name'           => 'Final Question',
                'percentage'     => 100,
                'hidden_scoring' => false,
            ]);
            $this->command->info("Created Criteria for Round 2");
        });
    }
}
