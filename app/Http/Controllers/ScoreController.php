<?php
namespace App\Http\Controllers;

use App\Models\Criteria;
use App\Models\Pageant;
use App\Services\PageantScoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScoreController extends Controller
{
    public $pageantScoreService;

    public function __construct(PageantScoreService $pageantScoreService)
    {
        $this->pageantScoreService = $pageantScoreService;
    }

    public function index()
    {
        $pageants = Pageant::all();

        return Inertia::render('Scoring/Index', [
            'pageants' => $pageants,
        ]);
    }

    public function showDetails(Pageant $pageant)
    {
        $criterias = $pageant->criterias()->where('hidden_scoring', false)->join('pageant_rounds', function ($join) {
            $join->on('pageant_rounds.pageant_id', 'criterias.pageant_id')->on('pageant_rounds.round', 'criterias.round');
        })->select('criterias.*',
            'pageant_rounds.round_name',
            'criterias.id as criteria_id')->get()->groupBy('round_name') // 1st level: round_name
            ->map(function ($roundItems) {
                // 2nd level: group
                return $roundItems->groupBy('group');
            });

        $groupCriterias = $pageant->criterias->where('hidden_scoring', false)->groupBy('round')->values()->all();

        return Inertia::render('Scoring/Details', [
            'pageant'        => $pageant,
            'groupCriterias' => $groupCriterias,
            'c'              => $criterias,
        ]);
    }

    public function show(Pageant $pageant)
    {
        $judge = Auth::user();

        $alreadyScores = $judge->candidateCritieras->whereIn('criteria_id', $pageant->criterias->where('round', $pageant->current_round)->pluck('id'));

        if ($alreadyScores->count() > 0) {
            session()->flash('message', 'Already scored');
            return;
        }

        if ($pageant->current_round == null) {
            session()->flash('message', 'Round not yet started');
            return;
        }

        return Inertia::render('Scoring/Show', [
            'pageant' => $pageant->load(['criterias' => function ($query) use ($pageant) {
                $query->where('round', $pageant->current_round);
            }, 'candidates', 'judges']),
        ]);
    }

    public function score(Pageant $pageant, Criteria $criteria)
    {

        $judge = Auth::user();

        if ($pageant->current_round != $criteria->round || $pageant->current_group != $criteria->group) {
            session()->flash('message', 'Round not yet started');
            return;
        }

        if ($pageant->current_round == null) {
            session()->flash('message', 'Pageant not opened yet');
            return;
        }

        $alreadyScores = $judge->candidateCritieras->where('criteria_id', $criteria->id);

        if ($alreadyScores->count() > 0) {
            session()->flash('message', 'Already scored');
            return;
        }

        $candidates = $pageant->pageantRounds()->where('round', $pageant->current_round)->first()->candidates;

        return Inertia::render('Scoring/Show', [
            'pageant'    => $pageant->load(['criterias' => function ($query) use ($pageant) {
                $query->where('hidden_scoring', false)
                    ->where('round', $pageant->current_round)
                    ->where('group', $pageant->current_group);
            }, 'judges']),
            'candidates' => $candidates,
        ]);
    }

    public function store(Request $request, Pageant $pageant)
    {
        // dd($request->all());
        $request->validate([
            'scores' => ['required', 'array'],
        ]);

        $scoring = $request->scores;

        // $scoring = $scoring->groupBy('candidate_id');

        // dd($scoring);
        foreach ($scoring as $i => $scores) {
            // $candidate = Candidate::find($i);

            // foreach ($scores as $score) {
            //     $data[$score['criteria_id']] = [
            //         'score' => $score['score'],
            //         'user_id' => Auth::id(),
            //     ];
            // }

            // $candidate->criterias()->attach($data);
            Auth::user()->candidateCritieras()->updateOrCreate(
                ['criteria_id' => $scores['criteria_id'], 'candidate_id' => $scores['candidate_id']],
                ['score' => $scores['score']],
            );

        }

        return redirect()->route('scoring.index', $pageant);
    }

    // public function viewScoresOld(Request $request, Pageant $pageant)
    // {

    //     $criterias  = $pageant->criterias->where('round', $pageant->current_round)->values()->all();
    //     $round      = $pageant->pageantRounds()->where('round', $pageant->current_round)->first();
    //     $candidates = $round ? $round->candidates : $pageant->candidates;

    //     $candidatesScores = $candidates->map(function ($candidate) use ($criterias, $round) {
    //         $scores = [];
    //         foreach ($criterias as $criteria) {
    //             $pivot                 = $criteria->candidates->where('id', $candidate->id)->sum('pivot.score');
    //             $scores[$criteria->id] = $pivot ?? '';
    //         }

    //         $total                  = array_sum($scores);
    //         $candidate['scores']    = $scores;
    //         $deduction              = $candidate->candidatesDeduction()->find($round) ? $candidate->candidatesDeduction()->find($round)->pivot->deduction : 0;
    //         $candidate['deduction'] = $deduction;
    //         $candidate['total']     = $total - $deduction;

    //         return $candidate;
    //     });

    //     $maleCandidates   = $candidatesScores->where('gender', 'mr')->sortByDesc('total')->values()->all();
    //     $femaleCandidates = $candidatesScores->where('gender', 'ms')->sortByDesc('total')->values()->all();

    //     return Inertia::render('Pageant/PageantScores', [
    //         'pageant'          => $pageant->load('pageantRounds'),
    //         'maleCandidates'   => $maleCandidates,
    //         'femaleCandidates' => $femaleCandidates,
    //         'criterias'        => $criterias,
    //     ]);
    // }

    public function viewScores(Request $request, Pageant $pageant)
    {
        // 1) Load the criteria for this round
        // $criterias = $pageant->criterias()
        //     ->where('round', $pageant->current_round)
        //     ->get();

        // // 2) Try to fetch the PageantRound (may be null)
        // $round = $pageant->pageantRounds()
        //     ->where('round', $pageant->current_round)
        //     ->first();

        // // 3) Decide which candidates to score:
        // if ($round) {
        //     // Round exists. If it has no candidates, return an empty collection.
        //     $candidates = $round->candidates()->exists()
        //     ? $round->candidates()->with([
        //         'criterias' => fn($q) => $q->whereIn('criterias.id', $criterias->pluck('id')),
        //         'candidatesDeduction',
        //     ])->get()
        //     : collect(); // empty
        // } else {
        //     // No round at all → fall back to all pageant candidates
        //     $candidates = $pageant->candidates()->with([
        //         'criterias' => fn($q) => $q->whereIn('criterias.id', $criterias->pluck('id')),
        //         'candidatesDeduction',
        //     ])->get();
        // }

        // $candidatesScores = $candidates->map(function ($candidate) use ($criterias, $round) {
        //     // Turn the full Candidate model (with all its attributes) into an array:
        //     $base = $candidate->toArray();

        //     // Build per-criteria scores, defaulting missing to 0
        //     $scores = $criterias->mapWithKeys(function ($crit) use ($candidate) {
        //         $pivot = $candidate
        //             ->criterias
        //             ->firstWhere('id', $crit->id)?->pivot?->score ?? 0;
        //         return [$crit->id => $pivot];
        //     })->all();

        //     // Sum and subtract deductions
        //     $total  = array_sum($scores);
        //     $deduct = $candidate
        //         ->candidatesDeduction// all pivot rows
        //         ->filter(function ($pivot) use ($round) {
        //             // assuming the pivot table has a 'pageant_round_id' FK
        //             return $pivot->pivot->pageant_round_id === $round->id;
        //         })
        //         ->sum('pivot.deduction');

        //     // Merge everything back together
        //     return array_merge($base, [
        //         'scores'    => $scores,
        //         'deduction' => $deduct,
        //         'total'     => $total - $deduct,
        //     ]);
        // });

        $roundNum = $pageant->current_round;

        // grab all scored data…
        $candidatesScores = $this->pageantScoreService->getCandidateScores($pageant, $roundNum);

        // 5) Split & sort
        $male = $candidatesScores
            ->where('gender', 'mr')
            ->sortByDesc('total')
            ->values()
            ->all();

        $female = $candidatesScores
            ->where('gender', 'ms')
            ->sortByDesc('total')
            ->values()
            ->all();

        // 6) Render
        return Inertia::render('Pageant/PageantScores', [
            'pageant'          => $pageant->load('pageantRounds'),
            'maleCandidates'   => $male,
            'femaleCandidates' => $female,
            // 'criterias'        => $criterias,
            'criterias'        => $pageant->criterias()->where('round', $roundNum)->get(),
        ]);
    }

    // public function forPrintingOld(Pageant $pageant)
    // {

    //     $candidates = $pageant->candidates;
    //     $criterias  = $pageant
    //         ->criterias() // start with the Criteria query
    //         ->join('pageant_rounds', function ($join) {
    //             $join->on('pageant_rounds.pageant_id', '=', 'criterias.pageant_id')
    //                 ->on('pageant_rounds.round', '=', 'criterias.round');
    //         })
    //         ->select(
    //             'criterias.*',
    //             'pageant_rounds.round_name as round_name',
    //         )
    //         ->get();
    //     $judges = $pageant->judges;

    //     $candidatesScores = $candidates->map(function ($candidate) use ($criterias, $judges) {
    //         $scores = [];

    //         foreach ($criterias as $criteria) {
    //             if ($criteria->hidden_scoring) {
    //                 $pivot = CandidateCriteria::where(function ($query) use ($candidate, $criteria) {
    //                     $query->where('criteria_id', $criteria->id)->where('candidate_id', $candidate->id);
    //                 })->sum('score');
    //                 $scores[$criteria->id][0] = $pivot ?? '';

    //             } else {

    //                 foreach ($judges as $judge) {
    //                     // $pivot = $criteria->candidates()->where('candidates.id', $candidate->id)->wherePivot('user_id', $judge->id)->get()->sum('pivot.score');
    //                     $pivot = CandidateCriteria::where(function ($query) use ($candidate, $judge, $criteria) {
    //                         $query->where('criteria_id', $criteria->id)->where('candidate_id', $candidate->id)->where('user_id', $judge->id);
    //                     })->sum('score');
    //                     $scores[$criteria->id][$judge->id] = $pivot ?? '';
    //                 }
    //             }
    //             $scores[$criteria->id]['total'] = array_sum($scores[$criteria->id]);
    //         }

    //         $total = array_sum(array_column($scores, 'total'));

    //         $candidate['scores']    = $scores;
    //         $deduction              = $candidate->candidatesDeduction->sum('pivot.deduction');
    //         $candidate['deduction'] = $deduction;
    //         $candidate['total']     = $total - $deduction;

    //         return $candidate;
    //     });

    //     $maleCandidates   = $candidatesScores->where('gender', 'mr')->sortByDesc('total')->values()->all();
    //     $femaleCandidates = $candidatesScores->where('gender', 'ms')->sortByDesc('total')->values()->all();

    //     return Inertia::render('Pageant/PageantPrinting', [
    //         'pageant'          => $pageant,
    //         'maleCandidates'   => $maleCandidates,
    //         'femaleCandidates' => $femaleCandidates,
    //         'criterias'        => $criterias->values()->all(),
    //         'judges'           => $judges,
    //     ]);
    // }

    // public function forPrinting2(Pageant $pageant)
    // {

    //     // 1) Build a round-number → round_name map
    //     $roundNames = $pageant->pageantRounds
    //         ->pluck('round_name', 'round')
    //         ->toArray();

    //     // Group criterias by round and append a Subtotal marker per round
    //     $groupedCriterias  = $criterias->groupBy('round');
    //     $extendedCriterias = collect();
    //     foreach ($groupedCriterias as $roundNumber => $items) {
    //         $extendedCriterias = $extendedCriterias->merge($items);
    //         $extendedCriterias->push((object) [
    //             'id'             => 'subtotal_' . $roundNumber,
    //             'pageant_id'     => $pageant->id,
    //             'round'          => $roundNumber,
    //             'group'          => null,
    //             'hidden_scoring' => false,
    //             'name'           => 'Total',
    //             'percentage'     => 0,
    //             'round_name'     => $roundNames[$roundNumber],
    //             'is_subtotal'    => true,
    //         ]);
    //     }
    //     // Append a Grand Total marker after all rounds
    //     $extendedCriterias->push((object) [
    //         'id'             => 'grand_total',
    //         'pageant_id'     => $pageant->id,
    //         'round'          => null,
    //         'group'          => null,
    //         'hidden_scoring' => false,
    //         'name'           => '',
    //         'percentage'     => 0,
    //         'round_name'     => 'Grand Total',
    //         'is_grand_total' => true,
    //     ]);
    //     // Replace original collection
    //     $criterias = $extendedCriterias;
    //     $judges = $pageant->judges;

    //     $candidatesScores = $candidates->map(function ($candidate) use ($criterias, $judges, $roundNames) {
    //         $base = $candidate->toArray();
    //         // 1) Grab all pivot rows for this candidate and these criteria
    //         $byCrit = CandidateCriteria::where('candidate_id', $candidate->id)
    //             ->whereIn('criteria_id', $criterias->pluck('id'))
    //             ->get()
    //             ->groupBy('criteria_id');

    //         $scores      = [];
    //         $roundTotals = [];

    //         $roundDeductions = $candidate
    //             ->candidatesDeduction->groupBy('round_name')->map(function ($deductions) {
    //             return $deductions->sum(function ($r) {
    //                 return $r->pivot->deduction;
    //             });
    //         });

    //         foreach ($criterias as $crit) {
    //             $critId = $crit->id;
    //             // Handle Subtotal entries
    //             if (! empty($crit->is_subtotal)) {
    //                 $roundName       = $roundNames[$crit->round] ?? "Round {$crit->round}";
    //                 $raw             = $roundTotals[$roundName] ?? 0;
    //                 $ded             = $roundDeductions[$roundName] ?? 0;
    //                 $scores[$critId] = ['total' => $raw - $ded];
    //                 continue;
    //             }
    //             // Handle Grand Total entry
    //             if (! empty($crit->is_grand_total)) {
    //                 // overallTotal is not yet computed; will be after loop, so just set as 0 for now, will fix below
    //                 $scores[$critId] = ['total' => 0];
    //                 continue;
    //             }
    //             // Real criteria scoring
    //             $group = $byCrit->get($critId, collect());
    //             if ($crit->hidden_scoring || $judges->isEmpty()) {
    //                 $scores[$critId][0] = (int) $group->sum('score');
    //             } else {
    //                 foreach ($judges as $judge) {
    //                     $scores[$critId][$judge->id] = (int)
    //                     $group->where('user_id', $judge->id)->sum('score');
    //                 }
    //             }
    //             // per-criteria total
    //             $scores[$critId]['total'] = array_sum($scores[$critId]);

    //             // accumulate per-round total
    //             $roundName               = $roundNames[$crit->round] ?? "Round {$crit->round}";
    //             $roundTotals[$roundName] = ($roundTotals[$roundName] ?? 0)
    //                  + $scores[$critId]['total'];
    //         }

    //         // Compute raw overall total across all rounds
    //         $overallRaw = array_sum($roundTotals);
    //         // Sum all per-round deductions
    //         $totalDeductions = $roundDeductions->sum();
    //         // Set grand_total to raw minus all deductions
    //         // After overallTotal is known, update any grand_total pseudo-criteria
    //         foreach ($criterias as $crit) {
    //             if (! empty($crit->is_grand_total)) {
    //                 $scores[$crit->id] = ['total' => $overallRaw - $totalDeductions];
    //             }
    //         }

    //         return array_merge($base, [
    //             'scores' => $scores,
    //         ]);
    //     });

    //     $candidatesScores = $this->pageantScoreService
    //         ->getCandidateScores($pageant, null, true);

    //     $maleCandidates   = $candidatesScores->where('gender', 'mr')->sortByDesc('total')->values()->all();
    //     $femaleCandidates = $candidatesScores->where('gender', 'ms')->sortByDesc('total')->values()->all();

    //     return Inertia::render('Pageant/PageantPrinting', [
    //         'pageant'          => $pageant,
    //         'maleCandidates'   => $maleCandidates,
    //         'femaleCandidates' => $femaleCandidates,
    //         'criterias'        => $this->pageantScoreService->getDetailedCriterias($pageant),
    //         'judges'           => $pageant->judges,
    //     ]);
    // }

    public function forPrinting(Pageant $pageant)
    {
        $candidatesScores = $this->pageantScoreService
            ->getCandidateScores($pageant, null, true);

        $maleCandidates   = $candidatesScores->where('gender', 'mr')->sortByDesc('total')->values()->all();
        $femaleCandidates = $candidatesScores->where('gender', 'ms')->sortByDesc('total')->values()->all();

        return Inertia::render('Pageant/PageantPrinting', [
            'pageant'          => $pageant,
            'maleCandidates'   => $maleCandidates,
            'femaleCandidates' => $femaleCandidates,
            'criterias'        => $this->pageantScoreService->getDetailedCriterias($pageant),
            'judges'           => $pageant->judges,
        ]);
    }
}
