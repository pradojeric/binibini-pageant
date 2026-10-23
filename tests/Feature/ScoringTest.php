<?php

namespace Tests\Feature;

use App\Events\RoundChanged;
use App\Events\ScoresReset;
use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ScoringTest extends TestCase
{
    use RefreshDatabase;

    public function test_scoring_stores_valid_data()
    {
        $user = User::factory()->create();
        $pageant = Pageant::create([
            'pageant' => 'Test Pageant',
            'type' => 'mr&ms',
            'rounds' => 1,
            'current_round' => 1,
            'current_group' => 1,
        ]);
        $criteria = Criteria::create([
            'pageant_id' => $pageant->id,
            'name' => 'Test Criteria',
            'percentage' => 40,
            'round' => 1,
            'group' => 1,
        ]);
        $candidate = Candidate::create([
            'pageant_id' => $pageant->id,
            'candidate_number' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'mr',
        ]);

        $pageant->judges()->attach($user);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->actingAs($user);

        $response = $this->post(route('scoring.store', $pageant->id), [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => 30,
                ]
            ]
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('candidate_criteria', [
            'user_id' => $user->id,
            'candidate_id' => $candidate->id,
            'criteria_id' => $criteria->id,
            'score' => 30,
        ]);
    }

    public function test_scoring_auto_corrects_low_scores()
    {
        $user = User::factory()->create();
        $pageant = Pageant::create([
            'pageant' => 'Test Pageant',
            'type' => 'mr&ms',
            'current_round' => 1,
            'current_group' => 1,
        ]);
        // 40% criteria -> min score 20
        $criteria = Criteria::create([
            'pageant_id' => $pageant->id,
            'name' => 'Test Criteria',
            'percentage' => 40,
            'round' => 1,
            'group' => 1,
        ]);
        $candidate = Candidate::create([
            'pageant_id' => $pageant->id,
            'candidate_number' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'mr',
        ]);

        $pageant->judges()->attach($user);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->actingAs($user);

        // Send score 5 (below min 20)
        $response = $this->post(route('scoring.store', $pageant->id), [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => 5,
                ]
            ]
        ]);

        $response->assertRedirect();
        // Expect score to be auto-corrected to 20
        $this->assertDatabaseHas('candidate_criteria', [
            'candidate_id' => $candidate->id,
            'criteria_id' => $criteria->id,
            'score' => 20,
        ]);
    }

    public function test_scoring_auto_corrects_null_scores()
    {
        $user = User::factory()->create();
        $pageant = Pageant::create([
            'pageant' => 'Test Pageant',
            'type' => 'mr&ms',
            'current_round' => 1,
            'current_group' => 1,
        ]);
        $criteria = Criteria::create([
            'pageant_id' => $pageant->id,
            'name' => 'Test Criteria',
            'percentage' => 40,
            'round' => 1,
            'group' => 1,
        ]);
        $candidate = Candidate::create([
            'pageant_id' => $pageant->id,
            'candidate_number' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'mr',
        ]);

        $pageant->judges()->attach($user);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->actingAs($user);

        // Send score null
        $response = $this->post(route('scoring.store', $pageant->id), [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => null,
                ]
            ]
        ]);

        $response->assertRedirect();
        // Expect score to be auto-corrected to 20
        $this->assertDatabaseHas('candidate_criteria', [
            'candidate_id' => $candidate->id,
            'criteria_id' => $criteria->id,
            'score' => 20,
        ]);
    }

    public function test_unique_constraint_prevents_duplicate_entries()
    {
        $user = User::factory()->create();
        $pageant = Pageant::create([
            'pageant' => 'Test Pageant',
            'type' => 'mr&ms',
            'current_round' => 1,
            'current_group' => 1,
        ]);
        $criteria = Criteria::create([
            'pageant_id' => $pageant->id,
            'name' => 'Test Criteria',
            'percentage' => 40,
            'round' => 1,
            'group' => 1,
        ]);
        $candidate = Candidate::create([
            'pageant_id' => $pageant->id,
            'candidate_number' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'mr',
        ]);

        $pageant->judges()->attach($user);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->actingAs($user);

        // Create first entry
        $this->post(route('scoring.store', $pageant->id), [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => 25,
                ]
            ]
        ]);

        // Attempt to submit the same entry again with a different score (should be rejected)
        $this->post(route('scoring.store', $pageant->id), [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => 30,
                ]
            ]
        ])->assertSessionHas('message', 'You have already submitted your scores for this round.');

        // Check that we still have only 1 record
        $this->assertEquals(1, \DB::table('candidate_criteria')
            ->where('user_id', $user->id)
            ->where('candidate_id', $candidate->id)
            ->where('criteria_id', $criteria->id)
            ->count());

        // Check that the original score was kept
        $this->assertDatabaseHas('candidate_criteria', [
            'candidate_id' => $candidate->id,
            'criteria_id' => $criteria->id,
            'score' => 25,
        ]);
    }

    public function test_scoring_rejects_judge_not_assigned_to_pageant()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $pageant->judges()->detach($judge);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 30))
            ->assertForbidden();

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_criteria_from_another_pageant()
    {
        [$judge, $pageant, , $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        [, , $otherCriteria] = $this->scoringSetup();

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $otherCriteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_candidate_from_another_pageant()
    {
        [$judge, $pageant, $criteria] = $this->scoringSetup();
        [, , , $otherCandidate] = $this->scoringSetup();

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($otherCandidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_criteria_not_currently_open()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $pageant->update(['current_group' => 2]);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_hidden_criteria()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $criteria->update(['hidden_scoring' => true]);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_score_above_criteria_percentage()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 41))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_opening_a_group_that_is_not_active_redirects_to_details_with_message()
    {
        [$judge, $pageant, $criteria] = $this->scoringSetup();
        $pageant->update(['current_group' => 2]);

        $this->actingAs($judge)
            ->get(route('scoring.score', ['pageant' => $pageant->id, 'criteria' => $criteria->id]))
            ->assertRedirect(route('scoring.details', $pageant))
            ->assertSessionHas('message');
    }

    public function test_opening_a_group_already_scored_redirects_to_details_with_message()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 30]);

        $this->actingAs($judge)
            ->get(route('scoring.score', ['pageant' => $pageant->id, 'criteria' => $criteria->id]))
            ->assertRedirect(route('scoring.details', $pageant))
            ->assertSessionHas('message', 'You have already submitted your scores for this round.');
    }

    public function test_opening_a_criteria_from_another_pageant_redirects_to_details()
    {
        [$judge, $pageant] = $this->scoringSetup();
        [, , $otherCriteria] = $this->scoringSetup();

        $this->actingAs($judge)
            ->get(route('scoring.score', ['pageant' => $pageant->id, 'criteria' => $otherCriteria->id]))
            ->assertRedirect(route('scoring.details', $pageant));
    }

    public function test_old_scoring_show_route_redirects_to_details()
    {
        [$judge, $pageant] = $this->scoringSetup();

        $this->actingAs($judge)
            ->get(route('scoring.show', $pageant->id))
            ->assertRedirect(route('scoring.details', $pageant));
    }

    public function test_changing_round_resets_group_and_redirects()
    {
        Event::fake();
        [, $pageant] = $this->scoringSetup();
        $pageant->pageantRounds()->create(['pageant_type' => 'mr', 'round' => 2, 'round_name' => 'Finals', 'number_of_candidates' => 1]);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->from(route('pageant.view-scores', $pageant))
            ->put(route('pageant.change-round', ['pageant' => $pageant->id, 'round' => 2]))
            ->assertRedirect(route('pageant.view-scores', $pageant));

        $pageant->refresh();
        $this->assertSame(2, (int) $pageant->current_round);
        $this->assertSame(0, (int) $pageant->current_group);
        Event::assertDispatched(RoundChanged::class);
    }

    public function test_changing_to_a_round_the_pageant_does_not_have_is_rejected()
    {
        Event::fake();
        [, $pageant] = $this->scoringSetup();

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->put(route('pageant.change-round', ['pageant' => $pageant->id, 'round' => 9]))
            ->assertSessionHasErrors('round');

        $this->assertSame(1, (int) $pageant->refresh()->current_round);
        Event::assertNotDispatched(RoundChanged::class);
    }

    public function test_changing_group_redirects_and_rejects_unknown_groups()
    {
        Event::fake();
        [, $pageant] = $this->scoringSetup();
        $pageant->update(['current_group' => 0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->from(route('pageant.view-scores', $pageant))
            ->put(route('pageant.change-group', ['pageant' => $pageant->id, 'group' => 1]))
            ->assertRedirect(route('pageant.view-scores', $pageant));
        $this->assertSame(1, (int) $pageant->refresh()->current_group);

        $this->actingAs($admin)
            ->put(route('pageant.change-group', ['pageant' => $pageant->id, 'group' => 5]))
            ->assertSessionHasErrors('group');
        $this->assertSame(1, (int) $pageant->refresh()->current_group);
    }

    public function test_scoring_index_lists_only_the_judges_unfinished_pageants()
    {
        [$judge, $pageant] = $this->scoringSetup();
        $this->scoringSetup(); // a pageant this judge is not assigned to
        [, $finished] = $this->scoringSetup();
        $finished->judges()->attach($judge);
        $finished->update(['status' => 'finished']);

        $this->actingAs($judge)
            ->get(route('scoring.index'))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Scoring/Index')
                ->has('pageants', 1)
                ->where('pageants.0.id', $pageant->id));
    }

    public function test_judge_not_assigned_to_pageant_cannot_open_its_scoring_pages()
    {
        [$judge, $pageant, $criteria] = $this->scoringSetup();
        $pageant->judges()->detach($judge);

        $this->actingAs($judge)->get(route('scoring.details', $pageant))->assertForbidden();
        $this->actingAs($judge)
            ->get(route('scoring.score', ['pageant' => $pageant->id, 'criteria' => $criteria->id]))
            ->assertForbidden();
    }

    public function test_details_lists_the_criteria_the_judge_already_submitted()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 30]);

        $this->actingAs($judge)
            ->get(route('scoring.details', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Scoring/Details')
                ->where('submittedCriteriaIds', fn($ids) => $ids->map(fn($id) => (int) $id)->all() === [$criteria->id]));
    }

    public function test_details_lists_each_criteria_once_when_the_round_has_several_divisions()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $ms = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 1, 'first_name' => 'Jane', 'last_name' => 'Doe', 'gender' => 'ms']);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->selectIntoRound($pageant, $ms, 1);

        $this->actingAs($judge)
            ->get(route('scoring.details', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Scoring/Details')
                ->has('groupCriterias.Round 1.1', 1)
                ->where('groupCriterias.Round 1.1.0.criteria_id', $criteria->id));
    }

    public function test_hidden_scoring_stores_valid_scores_and_updates_them()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $criteria->update(['hidden_scoring' => true]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 0))
            ->assertSessionHasNoErrors();
        $this->actingAs($admin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 40))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('candidate_criteria', 1);
        $this->assertDatabaseHas('candidate_criteria', [
            'user_id'      => $admin->id,
            'candidate_id' => $candidate->id,
            'criteria_id'  => $criteria->id,
            'score'        => 40,
        ]);
    }

    public function test_hidden_scoring_rejects_criteria_judges_score()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_hidden_scoring_rejects_criteria_or_candidate_from_another_pageant()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        [, , $otherCriteria, $otherCandidate] = $this->scoringSetup();
        $criteria->update(['hidden_scoring' => true]);
        $otherCriteria->update(['hidden_scoring' => true]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $otherCriteria, 30))
            ->assertSessionHasErrors('scores');
        $this->actingAs($admin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($otherCandidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_hidden_scoring_rejects_scores_outside_zero_to_percentage()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $criteria->update(['hidden_scoring' => true]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 41))
            ->assertSessionHasErrors('scores');
        $this->actingAs($admin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, -1))
            ->assertSessionHasErrors('scores.0.score');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_hidden_scoring_page_shows_only_the_current_rounds_hidden_criteria_and_candidates()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $criteria->update(['hidden_scoring' => true]);
        Criteria::create(['pageant_id' => $pageant->id, 'name' => 'Final Q&A', 'percentage' => 50, 'round' => 2, 'group' => 1, 'hidden_scoring' => true]);
        Criteria::create(['pageant_id' => $pageant->id, 'name' => 'Talent', 'percentage' => 30, 'round' => 1, 'group' => 1]);
        $this->selectIntoRound($pageant, $candidate, 1);
        Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 2, 'first_name' => 'Not', 'last_name' => 'Selected', 'gender' => 'mr']);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('scoring.admin', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->component('Pageant/Admin/PageantScoring')
                ->has('pageant.criterias', 1)
                ->where('pageant.criterias.0.id', $criteria->id)
                ->has('candidates', 1)
                ->where('candidates.0.id', $candidate->id));
    }

    public function test_live_scores_list_no_candidates_until_some_are_selected_into_the_round()
    {
        [, $pageant, , $candidate] = $this->scoringSetup();
        $pageant->pageantRounds()->create(['pageant_type' => 'mr', 'round' => 1, 'round_name' => 'Preliminary', 'number_of_candidates' => 1]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route('pageant.view-scores', $pageant))
            ->assertInertia(fn(Assert $page) => $page->has('candidatesByDivision.mr', 0));

        $this->selectIntoRound($pageant, $candidate, 1);

        $this->actingAs($admin)
            ->get(route('pageant.view-scores', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->has('candidatesByDivision.mr', 1)
                ->where('candidatesByDivision.mr.0.id', $candidate->id));
    }

    public function test_printing_tells_which_rounds_each_candidate_was_selected_into()
    {
        [, $pageant, , $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $eliminated = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 2, 'first_name' => 'Not', 'last_name' => 'Advancing', 'gender' => 'mr']);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('pageant.for-printing', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->where('candidatesByDivision.mr', fn($candidates) => collect($candidates)
                    ->mapWithKeys(fn($c) => [$c['id'] => collect($c['pageant_rounds'])->pluck('round')->all()])
                    ->all() == [$candidate->id => [1], $eliminated->id => []]));
    }

    public function test_printing_counts_each_criteria_once_when_the_round_has_several_divisions()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $ms = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 1, 'first_name' => 'Jane', 'last_name' => 'Doe', 'gender' => 'ms']);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->selectIntoRound($pageant, $ms, 1);
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 30]);
        $pageant->pageantRounds()->where('pageant_type', 'mr')->first()->candidatesDeduction()->attach($candidate, ['deduction' => 2]);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('pageant.for-printing', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->where('criterias', fn($criterias) => collect($criterias)->where('id', $criteria->id)->count() === 1)
                ->where('candidatesByDivision.mr.0.scores.subtotal_1.total', 28)
                ->where('candidatesByDivision.mr.0.scores.grand_total.total', 28));
    }

    public function test_printing_loads_every_judges_scores_in_one_query()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $secondJudge = User::factory()->create();
        $pageant->judges()->attach($secondJudge);
        $other = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 2, 'first_name' => 'Jane', 'last_name' => 'Roe', 'gender' => 'mr']);
        $this->selectIntoRound($pageant, $candidate, 1);
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 30]);
        $secondJudge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 25]);
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $other->id, 'score' => 20]);
        $admin = User::factory()->create(['role' => 'admin']);

        $scoreQueries = 0;
        DB::listen(function ($query) use (&$scoreQueries) {
            if (preg_match('/from [`"]candidate_criteria[`"]/', $query->sql)) {
                $scoreQueries++;
            }
        });

        $this->actingAs($admin)
            ->get(route('pageant.for-printing', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->where('candidatesByDivision.mr', fn($candidates) => collect($candidates)
                    ->mapWithKeys(fn($c) => [$c['id'] => $c['scores'][$criteria->id]])
                    ->all() == [
                        $candidate->id => [$judge->id => 30, $secondJudge->id => 25, 'total' => 55],
                        $other->id     => [$judge->id => 20, $secondJudge->id => 0, 'total' => 20],
                    ]));

        $this->assertSame(1, $scoreQueries);
    }

    public function test_pageant_channel_admits_the_pageants_judges_and_admins_only()
    {
        $this->usePusherBroadcaster();
        [$judge, $pageant] = $this->scoringSetup();
        [$otherJudge] = $this->scoringSetup();
        $admin = User::factory()->create(['role' => 'admin']);
        $auth = ['socket_id' => '1234.5678', 'channel_name' => "private-pageant.{$pageant->id}"];

        $this->actingAs($judge)->post('/broadcasting/auth', $auth)->assertOk();
        $this->actingAs($admin)->post('/broadcasting/auth', $auth)->assertOk();
        $this->actingAs($otherJudge)->post('/broadcasting/auth', $auth)->assertForbidden();
    }

    public function test_a_second_admins_hidden_score_replaces_the_first_instead_of_adding_to_it()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $criteria->update(['hidden_scoring' => true]);
        $firstAdmin = User::factory()->create(['role' => 'admin']);
        $secondAdmin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($firstAdmin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasNoErrors();
        $this->actingAs($secondAdmin)
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 35))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('candidate_criteria', 1);
        $this->assertDatabaseHas('candidate_criteria', [
            'candidate_id' => $candidate->id,
            'criteria_id'  => $criteria->id,
            'score'        => 35,
        ]);

        // The second admin sees the current score, whoever entered it.
        $this->actingAs($secondAdmin)
            ->get(route('scoring.admin', $pageant))
            ->assertInertia(fn(Assert $page) => $page
                ->where("existingScores.{$candidate->id}.{$criteria->id}", fn($score) => (float) $score === 35.0));
    }

    public function test_reset_scores_keeps_deductions_and_round_selections()
    {
        Event::fake();
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 30]);
        $pageant->pageantRounds()->first()->candidatesDeduction()->attach($candidate, ['deduction' => 2]);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post(route('pageant.reset-scores', $pageant))
            ->assertRedirect();

        $this->assertDatabaseCount('candidate_criteria', 0);
        $this->assertDatabaseCount('round_deductions', 1);
        $this->assertDatabaseCount('candidate_rounds', 1);
        $pageant->refresh();
        $this->assertSame(0, (int) $pageant->current_round);
        $this->assertSame(0, (int) $pageant->current_group);
        Event::assertDispatched(ScoresReset::class);
    }

    public function test_reset_everything_also_erases_deductions_and_round_selections()
    {
        Event::fake();
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $judge->candidateCriterias()->create(['criteria_id' => $criteria->id, 'candidate_id' => $candidate->id, 'score' => 30]);
        $pageant->pageantRounds()->first()->candidatesDeduction()->attach($candidate, ['deduction' => 2]);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post(route('pageant.reset-everything', $pageant))
            ->assertRedirect();

        $this->assertDatabaseCount('candidate_criteria', 0);
        $this->assertDatabaseCount('round_deductions', 0);
        $this->assertDatabaseCount('candidate_rounds', 0);
        $pageant->refresh();
        $this->assertSame(0, (int) $pageant->current_round);
        $this->assertSame(0, (int) $pageant->current_group);
        Event::assertDispatched(ScoresReset::class);
    }

    public function test_scoring_rejects_a_candidate_not_selected_into_the_round()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $eliminated = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 2, 'first_name' => 'Elim', 'last_name' => 'Inated', 'gender' => 'mr']);
        $this->selectIntoRound($pageant, $candidate, 1);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($eliminated, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_scores_before_any_candidate_is_selected()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_scoring_rejects_a_partial_submission_so_the_judge_can_still_finish_the_group()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $ms = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 1, 'first_name' => 'Jane', 'last_name' => 'Doe', 'gender' => 'ms']);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->selectIntoRound($pageant, $ms, 1);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasErrors('scores');
        $this->assertDatabaseCount('candidate_criteria', 0);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), ['scores' => [
                ['candidate_id' => $candidate->id, 'criteria_id' => $criteria->id, 'score' => 30],
                ['candidate_id' => $ms->id, 'criteria_id' => $criteria->id, 'score' => 35],
            ]])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseCount('candidate_criteria', 2);
    }

    public function test_scoring_rejects_the_same_pair_sent_twice_in_place_of_a_missing_one()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $other = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 2, 'first_name' => 'Jim', 'last_name' => 'Roe', 'gender' => 'mr']);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->selectIntoRound($pageant, $other, 1);

        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), ['scores' => [
                ['candidate_id' => $candidate->id, 'criteria_id' => $criteria->id, 'score' => 30],
                ['candidate_id' => $candidate->id, 'criteria_id' => $criteria->id, 'score' => 31],
            ]])
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_judge_cannot_open_or_submit_scores_after_the_pageant_ends()
    {
        [$judge, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $this->selectIntoRound($pageant, $candidate, 1);
        $pageant->update(['status' => 'finished']);

        $this->actingAs($judge)
            ->get(route('scoring.score', ['pageant' => $pageant->id, 'criteria' => $criteria->id]))
            ->assertRedirect(route('scoring.details', $pageant))
            ->assertSessionHas('message', 'This pageant has ended. Scoring is closed.');
        $this->actingAs($judge)
            ->post(route('scoring.store', $pageant->id), $this->payload($candidate, $criteria, 30))
            ->assertRedirect(route('scoring.details', $pageant))
            ->assertSessionHas('message', 'This pageant has ended. Scoring is closed.');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_hidden_scoring_rejects_a_closed_rounds_criteria()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $criteria->update(['hidden_scoring' => true]);
        $this->selectIntoRound($pageant, $candidate, 1);
        $this->selectIntoRound($pageant, $candidate, 2);
        $pageant->update(['current_round' => 2]);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post(route('scoring.admin.store', $pageant), $this->payload($candidate, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    public function test_hidden_scoring_rejects_a_candidate_not_selected_into_the_round()
    {
        [, $pageant, $criteria, $candidate] = $this->scoringSetup();
        $criteria->update(['hidden_scoring' => true]);
        $eliminated = Candidate::create(['pageant_id' => $pageant->id, 'candidate_number' => 2, 'first_name' => 'Elim', 'last_name' => 'Inated', 'gender' => 'mr']);
        $this->selectIntoRound($pageant, $candidate, 1);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post(route('scoring.admin.store', $pageant), $this->payload($eliminated, $criteria, 30))
            ->assertSessionHasErrors('scores');

        $this->assertDatabaseCount('candidate_criteria', 0);
    }

    private function scoringSetup(): array
    {
        $judge = User::factory()->create();
        $pageant = Pageant::create([
            'pageant' => 'Test Pageant',
            'type' => 'mr&ms',
            'current_round' => 1,
            'current_group' => 1,
        ]);
        $criteria = Criteria::create([
            'pageant_id' => $pageant->id,
            'name' => 'Test Criteria',
            'percentage' => 40,
            'round' => 1,
            'group' => 1,
        ]);
        $candidate = Candidate::create([
            'pageant_id' => $pageant->id,
            'candidate_number' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'mr',
        ]);
        $pageant->judges()->attach($judge);

        return [$judge, $pageant, $criteria, $candidate];
    }

    // The null/log broadcasters authorize everyone, so run the real channel callbacks through Pusher's.
    private function usePusherBroadcaster(): void
    {
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'test-key',
            'broadcasting.connections.reverb.secret' => 'test-secret',
            'broadcasting.connections.reverb.app_id' => 'test-app',
        ]);
        Broadcast::forgetDrivers();
        require base_path('routes/channels.php');
    }

    private function selectIntoRound(Pageant $pageant, Candidate $candidate, int $round): void
    {
        $row = $pageant->pageantRounds()->firstOrCreate(
            ['pageant_type' => $candidate->gender, 'round' => $round],
            ['round_name' => "Round {$round}", 'number_of_candidates' => 1],
        );
        $row->candidates()->attach($candidate, ['order' => 1]);
    }

    private function payload(Candidate $candidate, Criteria $criteria, $score): array
    {
        return [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => $score,
                ]
            ]
        ];
    }
}
