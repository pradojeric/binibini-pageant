<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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

        // Attempt to create same entry again with different score (should update, not create new)
        $this->post(route('scoring.store', $pageant->id), [
            'scores' => [
                [
                    'candidate_id' => $candidate->id,
                    'criteria_id'  => $criteria->id,
                    'score'        => 30,
                ]
            ]
        ]);

        // Check that we still have only 1 record (updateOrCreate works)
        $this->assertEquals(1, \DB::table('candidate_criteria')
            ->where('user_id', $user->id)
            ->where('candidate_id', $candidate->id)
            ->where('criteria_id', $criteria->id)
            ->count());

        // Check that the value was updated
        $this->assertDatabaseHas('candidate_criteria', [
            'candidate_id' => $candidate->id,
            'criteria_id' => $criteria->id,
            'score' => 30,
        ]);
    }
}
