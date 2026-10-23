<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Pageant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Requires the in-memory sqlite lines in phpunit.xml to be enabled before running.
class HiyasDivisionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function roundsFor(array $divisions, int $rounds = 1, int $slots = 1): array
    {
        $rows = [];
        foreach ($divisions as $division) {
            for ($i = 1; $i <= $rounds; $i++) {
                $rows[$division][] = ['round' => $i, 'name' => "Round $i", 'number_of_candidates' => $slots];
            }
        }

        return $rows;
    }

    public function test_pageant_can_be_created_with_hiyas_alongside_other_divisions()
    {
        $this->actingAs($this->admin());

        $response = $this->post(route('pageants.store'), [
            'pageant'        => 'Hiyas 2026',
            'divisions'      => ['hiyas', 'ms'],
            'rounds'         => 2,
            'pageant_rounds' => $this->roundsFor(['ms', 'hiyas'], 2),
        ]);

        $response->assertRedirect(route('pageants.index'));
        $pageant = Pageant::firstWhere('pageant', 'Hiyas 2026');
        $this->assertSame('ms&hiyas', $pageant->type);
        $this->assertSame(['ms', 'hiyas'], $pageant->divisions);
        $this->assertSame(4, $pageant->pageantRounds()->count());
        $this->assertSame(2, $pageant->pageantRounds()->where('pageant_type', 'hiyas')->count());
    }

    public function test_pageant_requires_a_known_division()
    {
        $this->actingAs($this->admin());

        $this->post(route('pageants.store'), [
            'pageant'        => 'Bad',
            'divisions'      => ['queen'],
            'rounds'         => 1,
            'pageant_rounds' => $this->roundsFor(['queen']),
        ])->assertSessionHasErrors('divisions.0');

        $this->post(route('pageants.store'), [
            'pageant'        => 'Empty',
            'divisions'      => [],
            'rounds'         => 1,
            'pageant_rounds' => [],
        ])->assertSessionHasErrors('divisions');
    }

    public function test_each_selected_division_needs_named_rounds()
    {
        $this->actingAs($this->admin());

        $rounds = $this->roundsFor(['mr', 'hiyas']);
        $rounds['hiyas'][0]['name'] = '';

        $this->post(route('pageants.store'), [
            'pageant'        => 'Missing Name',
            'divisions'      => ['mr', 'hiyas'],
            'rounds'         => 1,
            'pageant_rounds' => $rounds,
        ])->assertSessionHasErrors('pageant_rounds.hiyas.0.name');

        $this->post(route('pageants.store'), [
            'pageant'        => 'Missing Division Rows',
            'divisions'      => ['mr', 'hiyas'],
            'rounds'         => 1,
            'pageant_rounds' => $this->roundsFor(['mr']),
        ])->assertSessionHasErrors('pageant_rounds.hiyas');
    }

    public function test_candidate_division_must_belong_to_the_pageant()
    {
        $this->actingAs($this->admin());
        $pageant = Pageant::create(['pageant' => 'P', 'type' => 'mr&hiyas', 'rounds' => 1]);

        $payload = [
            'candidate_number' => 1,
            'last_name'        => 'Cruz',
            'first_name'       => 'Ria',
            'nickname'         => 'Ria',
            'description'      => 'Candidate',
        ];

        $this->post(route('pageants.candidates.store', $pageant), $payload + ['gender' => 'ms'])
            ->assertSessionHasErrors('gender');

        $this->post(route('pageants.candidates.store', $pageant), $payload + ['gender' => 'hiyas'])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('candidates', ['pageant_id' => $pageant->id, 'gender' => 'hiyas']);
    }

    public function test_round_selection_fills_each_division_separately()
    {
        $this->actingAs($this->admin());
        $pageant = Pageant::create(['pageant' => 'P', 'type' => 'mr&hiyas', 'rounds' => 1]);
        $mrRound = $pageant->pageantRounds()->create(['pageant_type' => 'mr', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 1]);
        $hiyasRound = $pageant->pageantRounds()->create(['pageant_type' => 'hiyas', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 2]);

        $mr = $this->candidate($pageant, 1, 'mr');
        $hiyasA = $this->candidate($pageant, 2, 'hiyas');
        $hiyasB = $this->candidate($pageant, 3, 'hiyas');

        // Wrong count for hiyas is rejected per division.
        $this->post(route('select.store', $pageant), [
            'round'              => 1,
            'selectedCandidates' => [$mr->id, $hiyasA->id],
        ])->assertSessionHasErrors('selectedCandidates.hiyas');

        $this->post(route('select.store', $pageant), [
            'round'              => 1,
            'selectedCandidates' => [$mr->id, $hiyasA->id, $hiyasB->id],
        ])->assertSessionHasNoErrors();

        $this->assertEqualsCanonicalizing([$mr->id], $mrRound->candidates()->pluck('candidates.id')->all());
        $this->assertEqualsCanonicalizing([$hiyasA->id, $hiyasB->id], $hiyasRound->candidates()->pluck('candidates.id')->all());
        $this->assertSame(1, $pageant->fresh()->current_round);
    }

    public function test_deductions_are_stored_on_the_candidates_division_row()
    {
        $this->actingAs($this->admin());
        $pageant = Pageant::create(['pageant' => 'P', 'type' => 'mr&hiyas', 'rounds' => 1]);
        $mrRound = $pageant->pageantRounds()->create(['pageant_type' => 'mr', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 1]);
        $hiyasRound = $pageant->pageantRounds()->create(['pageant_type' => 'hiyas', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 1]);

        $mr = $this->candidate($pageant, 1, 'mr');
        $hiyas = $this->candidate($pageant, 2, 'hiyas');

        $this->post(route('pageant.deduct.store', $pageant), [
            'round'  => 1,
            'scores' => [$mr->id => 2, $hiyas->id => 3],
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('round_deductions', ['pageant_round_id' => $mrRound->id, 'candidate_id' => $mr->id, 'deduction' => 2]);
        $this->assertDatabaseHas('round_deductions', ['pageant_round_id' => $hiyasRound->id, 'candidate_id' => $hiyas->id, 'deduction' => 3]);
        $this->assertDatabaseMissing('round_deductions', ['pageant_round_id' => $mrRound->id, 'candidate_id' => $hiyas->id]);
    }

    public function test_round_selection_keeps_the_chosen_stage_order_within_each_division()
    {
        $this->actingAs($this->admin());
        $pageant = Pageant::create(['pageant' => 'P', 'type' => 'mr&hiyas', 'rounds' => 1]);
        $mrRound = $pageant->pageantRounds()->create(['pageant_type' => 'mr', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 1]);
        $hiyasRound = $pageant->pageantRounds()->create(['pageant_type' => 'hiyas', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 2]);

        $mr = $this->candidate($pageant, 1, 'mr');
        $hiyasA = $this->candidate($pageant, 2, 'hiyas');
        $hiyasB = $this->candidate($pageant, 3, 'hiyas');

        $this->post(route('select.store', $pageant), [
            'round'              => 1,
            'selectedCandidates' => [$hiyasB->id, $mr->id, $hiyasA->id],
        ])->assertSessionHasNoErrors();

        $this->assertSame([$hiyasB->id => 1, $hiyasA->id => 2], $hiyasRound->candidates()->pluck('candidate_rounds.order', 'candidates.id')->map(fn($o) => (int) $o)->all());
        $this->assertSame([$mr->id => 1], $mrRound->candidates()->pluck('candidate_rounds.order', 'candidates.id')->map(fn($o) => (int) $o)->all());
    }

    public function test_editing_a_pageant_keeps_round_rows_and_their_selections()
    {
        $this->actingAs($this->admin());
        $pageant = Pageant::create(['pageant' => 'P', 'type' => 'hiyas', 'rounds' => 2]);
        $round1 = $pageant->pageantRounds()->create(['pageant_type' => 'hiyas', 'round' => 1, 'round_name' => 'R1', 'number_of_candidates' => 1]);
        $round2 = $pageant->pageantRounds()->create(['pageant_type' => 'hiyas', 'round' => 2, 'round_name' => 'R2', 'number_of_candidates' => 1]);
        $round1->candidates()->attach($this->candidate($pageant, 1, 'hiyas'), ['order' => 1]);

        $this->post(route('pageants.update', $pageant), [
            'pageant'        => 'P',
            'divisions'      => ['hiyas'],
            'rounds'         => 2,
            'pageant_rounds' => ['hiyas' => [
                ['round' => 1, 'name' => 'Preliminaries', 'number_of_candidates' => 1],
                ['round' => 2, 'name' => 'R2', 'number_of_candidates' => 1],
            ]],
        ])->assertSessionHasNoErrors();

        $this->assertSame('Preliminaries', $round1->fresh()->round_name);
        $this->assertSame(1, $round1->candidates()->count());

        // Dropping round 1 would lose its selection, so it is refused.
        $this->post(route('pageants.update', $pageant), [
            'pageant'        => 'P',
            'divisions'      => ['hiyas'],
            'rounds'         => 1,
            'pageant_rounds' => ['hiyas' => [
                ['round' => 2, 'name' => 'R2', 'number_of_candidates' => 1],
            ]],
        ])->assertSessionHasErrors('rounds');
        $this->assertNotNull($round1->fresh());

        // A round with no data can be dropped.
        $this->post(route('pageants.update', $pageant), [
            'pageant'        => 'P',
            'divisions'      => ['hiyas'],
            'rounds'         => 1,
            'pageant_rounds' => ['hiyas' => [
                ['round' => 1, 'name' => 'Preliminaries', 'number_of_candidates' => 1],
            ]],
        ])->assertSessionHasNoErrors();
        $this->assertNull($round2->fresh());
    }

    private function candidate(Pageant $pageant, int $number, string $division): Candidate
    {
        return Candidate::create([
            'pageant_id'       => $pageant->id,
            'candidate_number' => $number,
            'first_name'       => "First$number",
            'last_name'        => "Last$number",
            'gender'           => $division,
        ]);
    }
}
