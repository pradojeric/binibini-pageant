<?php

namespace App\Http\Controllers;

use App\Events\ScoreSubmitted;
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
        })->select(
            'criterias.*',
            'pageant_rounds.round_name',
            'criterias.id as criteria_id'
        )->get()->groupBy('round_name') // 1st level: round_name
            ->map(function ($roundItems) {
                // 2nd level: group
                return $roundItems->groupBy('group');
            });

        //$groupCriterias = $pageant->criterias->where('hidden_scoring', false)->groupBy('round')->values()->all();

        return Inertia::render('Scoring/Details', [
            'pageant'        => $pageant,
            //'groupCriterias' => $groupCriterias,
            'groupCriterias'              => $criterias,
        ]);
    }

    public function show(Pageant $pageant)
    {
        $judge = Auth::user();

        $alreadyScores = $judge->candidateCriterias->whereIn('criteria_id', $pageant->criterias->where('round', $pageant->current_round)->pluck('id'));

        if ($alreadyScores->count() > 0) {
            session()->flash('message', 'You have already submitted your scores for this round.');
            return;
        }

        if ($pageant->current_round == null) {
            session()->flash('message', 'The scoring round has not been started yet. Please wait for the staff to begin.');
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
            session()->flash('message', 'This scoring round is not currently active. Please wait for the staff to open your assigned round.');
            return;
        }

        if ($pageant->current_round == null) {
            session()->flash('message', 'The pageant has not been opened yet. Please wait for the staff to start the event.');
            return;
        }

        $alreadyScores = $judge->candidateCriterias->where('criteria_id', $criteria->id);

        if ($alreadyScores->count() > 0) {
            session()->flash('message', 'You have already submitted your scores for this round.');
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
        $judgeId = Auth::id();

        // 1. Collect all criteria IDs from the request
        $criteriaIds = collect($scoring)->pluck('criteria_id')->unique();

        // 2. Fetch all criteria in one query and key by ID for fast lookup
        $criterias = Criteria::findMany($criteriaIds)->keyBy('id');

        // 3. Prepare data for batch insert/upsert
        $upsertData = [];
        $now = now();

        foreach ($scoring as $score) {
            $criteriaId = $score['criteria_id'];

            // Skip if criteria not found (safety check)
            if (!isset($criterias[$criteriaId])) {
                continue;
            }

            $criteria = $criterias[$criteriaId];
            $scoreValue = $score['score'];
            $minScore = round($criteria->percentage / 2);

            // Auto-correct score if it's below minimum or null
            // Note: If you want to allow 0 or null as "no score", handling might differ,
            // but preserving original logic here:
            if ($scoreValue < $minScore || is_null($scoreValue)) {
                $scoreValue = $minScore;
            }

            $upsertData[] = [
                'user_id'      => $judgeId, // Assuming relation uses user_id or judge_id. User model will confirm.
                'criteria_id'  => $criteriaId,
                'candidate_id' => $score['candidate_id'],
                'score'        => $scoreValue,
                // 'created_at'   => $now, // upsert usually handles timestamps if supported or manually
                // 'updated_at'   => $now,
            ];
        }

        // 4. Perform batch upsert
        // We need to know the table name and the unique constraints.
        // Assuming 'candidate_criterias' table and unique index on [user_id, criteria_id, candidate_id]
        // If Model is CandidateCriteria, we can use that.
        // Let's use the Model to specific.

        \App\Models\CandidateCriteria::upsert(
            $upsertData,
            ['user_id', 'candidate_id', 'criteria_id'], // Unique keys
            ['score'] // Columns to update if exists
        );

        broadcast(new ScoreSubmitted($pageant->id))->toOthers();

        return redirect()
            ->route('scoring.details', $pageant)
            ->with('message', 'Scores locked successfully! Please wait for the staff to instruct you before proceeding to the next round of scoring.');
    }

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
            'criterias'        => $pageant->criterias()->where('round', $roundNum)->orderBy('hidden_scoring', 'desc')->get(),
        ]);
    }

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
