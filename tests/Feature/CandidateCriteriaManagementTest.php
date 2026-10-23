<?php

namespace Tests\Feature;

use App\Models\Candidate;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CandidateCriteriaManagementTest extends TestCase
{
    use RefreshDatabase;

    private function pageant(): Pageant
    {
        return Pageant::create([
            'pageant'       => 'Management Pageant',
            'type'          => 'mr&ms',
            'rounds'        => 1,
            'current_round' => 1,
            'current_group' => 1,
        ]);
    }

    private function criteria(Pageant $pageant): Criteria
    {
        return Criteria::create([
            'pageant_id' => $pageant->id,
            'name'       => 'Poise',
            'percentage' => 50,
            'round'      => 1,
            'group'      => 1,
        ]);
    }

    private function candidate(Pageant $pageant): Candidate
    {
        return Candidate::create([
            'pageant_id'       => $pageant->id,
            'candidate_number' => 1,
            'first_name'       => 'John',
            'last_name'        => 'Doe',
            'gender'           => 'mr',
        ]);
    }

    public function test_scored_candidate_and_criteria_cannot_be_deleted(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $pageant = $this->pageant();
        $criteria = $this->criteria($pageant);
        $candidate = $this->candidate($pageant);
        $criteria->candidates()->attach($candidate, ['user_id' => User::factory()->create()->id, 'score' => 40]);

        $this->delete(route('candidates.destroy', $candidate))->assertSessionHasErrors('delete');
        $this->delete(route('criterias.destroy', $criteria))->assertSessionHasErrors('delete');

        $this->assertModelExists($candidate);
        $this->assertModelExists($criteria);
    }

    public function test_unscored_candidate_and_criteria_can_be_deleted(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $pageant = $this->pageant();
        $criteria = $this->criteria($pageant);
        $candidate = $this->candidate($pageant);

        $this->delete(route('candidates.destroy', $candidate))->assertSessionHasNoErrors();
        $this->delete(route('criterias.destroy', $criteria))->assertSessionHasNoErrors();

        $this->assertModelMissing($candidate);
        $this->assertModelMissing($criteria);
    }

    public function test_criteria_numbers_must_be_in_range(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $pageant = $this->pageant();

        $this->post(route('pageants.criterias.store', $pageant), [
            'name'       => 'Poise',
            'round'      => 0,
            'group'      => 1.5,
            'percentage' => 150,
        ])->assertSessionHasErrors(['round', 'group', 'percentage']);
    }
}
