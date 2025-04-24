<?php
// in app/Services/PageantScoreService.php
namespace App\Services;

use App\Models\CandidateCriteria;
use App\Models\Pageant;
use Illuminate\Support\Collection;

class PageantScoreService
{
    /**
     * If $roundNumber is an int, behaves exactly like your old getCandidateScores().
     * If $roundNumber is null and $detailed===true, returns the full printing dataset.
     */
    public function getCandidateScores(Pageant $pageant, ?int $roundNumber = null, bool $detailed = false): Collection
    {
        if (is_null($roundNumber) && $detailed) {
            return $this->getDetailedCandidateScores($pageant);
        }

        // roundNumber must not be null here:
        return $this->getRoundCandidateScores($pageant, $roundNumber);
    }

    /**
     * The original “per-round” logic you had.
     */
    protected function getRoundCandidateScores(Pageant $pageant, int $roundNumber): Collection
    {
        // 1) Load the criteria for this round
        $criterias = $pageant->criterias()
            ->where('round', $roundNumber)
            ->get();

        // 2) Try to fetch the PageantRound (may be null)
        $round = $pageant->pageantRounds()
            ->where('round', $roundNumber)
            ->first();

        // 3) Decide which candidates to score
        $candidates = $round && $round->candidates()->exists()
        ? $round->candidates()->with([
            'criterias' => fn($q) => $q->whereIn('criterias.id', $criterias->pluck('id')),
            'candidatesDeduction',
        ])->get()
        : $pageant->candidates()->with([
            'criterias' => fn($q) => $q->whereIn('criterias.id', $criterias->pluck('id')),
            'candidatesDeduction',
        ])->get();

        // 4) Map + compute scores, deductions, totals
        return $candidates->map(function ($candidate) use ($criterias, $round) {
            $base   = $candidate->toArray();
            $scores = $criterias->mapWithKeys(fn($crit) => [
                $crit->id => $candidate
                    ->criterias
                    ->firstWhere('id', $crit->id)?->pivot?->score ?? 0,
            ])->all();

            $total  = array_sum($scores);
            $deduct = $candidate
                ->candidatesDeduction
                ->filter(fn($pivot) => $round && $pivot->pivot->pageant_round_id === $round->id)
                ->sum('pivot.deduction');

            return array_merge($base, [
                'scores'    => $scores,
                'deduction' => $deduct,
                'total'     => $total - $deduct,
            ]);
        });
    }

    /**
     * The “forPrinting” logic, pulled straight from your controller.
     * Returns a Collection of candidates, each with ['scores'=>…,'gender',…],
     * and also pushes subtotals/grand-total into the criteria list.
     */
    protected function getDetailedCandidateScores(Pageant $pageant): Collection
    {
        // load all criteria joined to pageant_rounds (so we get round_name)
        $criterias = $pageant
            ->criterias()
            ->join('pageant_rounds', function ($join) {
                $join->on('pageant_rounds.pageant_id', '=', 'criterias.pageant_id')
                    ->on('pageant_rounds.round', '=', 'criterias.round');
            })
            ->select('criterias.*', 'pageant_rounds.round_name as round_name')
            ->get();

        // build map round→round_name
        $roundNames = $pageant->pageantRounds
            ->pluck('round_name', 'round')
            ->toArray();

        // insert Subtotal markers per round
        $grouped  = $criterias->groupBy('round');
        $extended = collect();
        foreach ($grouped as $roundNum => $items) {
            $extended = $extended->merge($items);
            $extended->push((object) [
                'id'             => "subtotal_{$roundNum}",
                'pageant_id'     => $pageant->id,
                'round'          => $roundNum,
                'group'          => null,
                'hidden_scoring' => false,
                'name'           => 'Total',
                'percentage'     => 0,
                'round_name'     => $roundNames[$roundNum] ?? "Round {$roundNum}",
                'is_subtotal'    => true,
            ]);
        }
        // append Grand Total
        $extended->push((object) [
            'id'             => 'grand_total',
            'pageant_id'     => $pageant->id,
            'round'          => null,
            'group'          => null,
            'hidden_scoring' => false,
            'name'           => '',
            'percentage'     => 0,
            'round_name'     => 'Grand Total',
            'is_grand_total' => true,
        ]);

        // load judges and candidates
        $judges     = $pageant->judges;
        $candidates = $pageant->candidates;
        $criterias  = $extended; // replace original

        return $candidates->map(function ($candidate) use ($criterias, $judges, $roundNames) {
            $base = $candidate->toArray();

            // load all criterion pivots for this candidate
            $byCrit = CandidateCriteria::where('candidate_id', $candidate->id)
                ->whereIn('criteria_id', $criterias->pluck('id'))
                ->get()
                ->groupBy('criteria_id');

            // sum deductions per round_name
            $roundDeds = $candidate
                ->candidatesDeduction
                ->groupBy('round_name')
                ->map(fn($ds) => $ds->sum(fn($r) => $r->pivot->deduction));

            $scores      = [];
            $roundTotals = [];

            foreach ($criterias as $crit) {
                $id = $crit->id;

                // Subtotal row
                if (! empty($crit->is_subtotal)) {
                    $rn          = $roundNames[$crit->round] ?? "Round {$crit->round}";
                    $raw         = $roundTotals[$rn] ?? 0;
                    $ded         = $roundDeds[$rn] ?? 0;
                    $scores[$id] = ['total' => $raw - $ded];
                    continue;
                }

                // Grand total row (defer until after loop)
                if (! empty($crit->is_grand_total)) {
                    $scores[$id] = ['total' => 0];
                    continue;
                }

                // real criteria: sum by judge or hidden
                $group = $byCrit->get($id, collect());
                if ($crit->hidden_scoring || $judges->isEmpty()) {
                    $scores[$id][0] = $group->sum('score');
                } else {
                    foreach ($judges as $judge) {
                        $scores[$id][$judge->id] = $group
                            ->where('user_id', $judge->id)
                            ->sum('score');
                    }
                }

                $scores[$id]['total'] = array_sum($scores[$id]);

                // accumulate for the subtotal
                $rn               = $roundNames[$crit->round] ?? "Round {$crit->round}";
                $roundTotals[$rn] = ($roundTotals[$rn] ?? 0) + $scores[$id]['total'];
            }

            // finish off grand total
            $overall = array_sum($roundTotals);
            $dedAll  = $roundDeds->sum();
            foreach ($criterias as $crit) {
                if (! empty($crit->is_grand_total)) {
                    $scores[$crit->id] = ['total' => $overall - $dedAll];
                }
            }

            return array_merge($base, [
                'scores' => $scores,
                'gender' => $candidate->gender, // so you can sortByDesc('total')
            ]);
        });
    }

    public function getDetailedCriterias(Pageant $pageant): Collection
    {
        $criterias = $pageant
            ->criterias()
            ->join('pageant_rounds', function ($join) {
                $join->on('pageant_rounds.pageant_id', '=', 'criterias.pageant_id')
                    ->on('pageant_rounds.round', '=', 'criterias.round');
            })
            ->select('criterias.*', 'pageant_rounds.round_name as round_name')
            ->get();

        $roundNames = $pageant->pageantRounds
            ->pluck('round_name', 'round')
            ->toArray();

        // insert Subtotal markers per round
        $grouped  = $criterias->groupBy('round');
        $extended = collect();
        foreach ($grouped as $roundNum => $items) {
            $extended = $extended->merge($items);
            $extended->push((object) [
                'id'             => "subtotal_{$roundNum}",
                'pageant_id'     => $pageant->id,
                'round'          => $roundNum,
                'group'          => null,
                'hidden_scoring' => false,
                'name'           => 'Total',
                'percentage'     => 0,
                'round_name'     => $roundNames[$roundNum] ?? "Round {$roundNum}",
                'is_subtotal'    => true,
            ]);
        }
        // append Grand Total
        $extended->push((object) [
            'id'             => 'grand_total',
            'pageant_id'     => $pageant->id,
            'round'          => null,
            'group'          => null,
            'hidden_scoring' => false,
            'name'           => '',
            'percentage'     => 0,
            'round_name'     => 'Grand Total',
            'is_grand_total' => true,
        ]);

        return $extended;
    }
}
