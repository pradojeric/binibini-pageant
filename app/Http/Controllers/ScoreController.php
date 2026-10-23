<?php

namespace App\Http\Controllers;

use App\Events\ScoreSubmitted;
use App\Models\CandidateCriteria;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Services\PageantScoreService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ScoreController extends Controller
{
    private const PAGEANT_ENDED = 'This pageant has ended. Scoring is closed.';

    public $pageantScoreService;

    public function __construct(PageantScoreService $pageantScoreService)
    {
        $this->pageantScoreService = $pageantScoreService;
    }

    public function index()
    {
        // A judge only sees the pageants they are assigned to that are still running.
        $pageants = Pageant::whereHas('judges', fn($query) => $query->whereKey(Auth::id()))
            ->where(fn($query) => $query->whereNull('status')->orWhere('status', '!=', 'finished'))
            ->get();

        return Inertia::render('Scoring/Index', [
            'pageants' => $pageants,
        ]);
    }

    public function showDetails(Pageant $pageant)
    {
        $this->authorizeJudge($pageant);

        $roundNames = $pageant->pageantRounds->pluck('round_name', 'round')->all();

        // A round has one pageant_rounds row per division, so joining on it would list each criteria once per division.
        $criterias = $pageant->criterias()
            ->where('hidden_scoring', false)
            ->whereIn('round', array_keys($roundNames))
            ->get()
            ->each(function ($criteria) use ($roundNames) {
                $criteria->round_name  = $roundNames[$criteria->round];
                $criteria->criteria_id = $criteria->id;
            })
            ->groupBy('round_name') // 1st level: round_name
            ->map(function ($roundItems) {
                // 2nd level: group
                return $roundItems->groupBy('group');
            });

        //$groupCriterias = $pageant->criterias->where('hidden_scoring', false)->groupBy('round')->values()->all();

        // Criteria this judge has already locked, so the page can mark those groups as submitted.
        $submittedCriteriaIds = Auth::user()->candidateCriterias()
            ->whereIn('criteria_id', $pageant->criterias()->select('id'))
            ->distinct()
            ->pluck('criteria_id');

        return Inertia::render('Scoring/Details', [
            'pageant'        => $pageant,
            //'groupCriterias' => $groupCriterias,
            'groupCriterias'              => $criterias,
            'submittedCriteriaIds'        => $submittedCriteriaIds,
        ]);
    }

    /**
     * Older entry point that nothing links to any more; judges pick a group on the details page.
     */
    public function show(Pageant $pageant)
    {
        return redirect()->route('scoring.details', $pageant);
    }

    public function score(Pageant $pageant, Criteria $criteria)
    {
        $this->authorizeJudge($pageant);

        $judge = Auth::user();

        if ((int) $criteria->pageant_id !== $pageant->id) {
            return $this->backToDetails($pageant, 'That criteria is not part of this pageant.');
        }

        if ($pageant->status === 'finished') {
            return $this->backToDetails($pageant, self::PAGEANT_ENDED);
        }

        if ($pageant->current_round == null) {
            return $this->backToDetails($pageant, 'The pageant has not been opened yet. Please wait for the staff to start the event.');
        }

        if ($pageant->current_round != $criteria->round || $pageant->current_group != $criteria->group) {
            return $this->backToDetails($pageant, 'This scoring round is not currently active. Please wait for the staff to open your assigned round.');
        }

        if ($judge->candidateCriterias()->where('criteria_id', $criteria->id)->exists()) {
            return $this->backToDetails($pageant, 'You have already submitted your scores for this round.');
        }

        $candidates = $pageant->roundRows((int) $pageant->current_round)
            ->load('candidates')
            ->flatMap(fn($round) => $round->candidates)
            ->values();

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
        $request->validate([
            'scores'                => ['required', 'array'],
            'scores.*.criteria_id'  => ['required', 'integer'],
            'scores.*.candidate_id' => ['required', 'integer'],
            'scores.*.score'        => ['nullable', 'numeric'],
        ]);

        $judgeId = Auth::id();

        $this->authorizeJudge($pageant);

        if ($pageant->status === 'finished') {
            return $this->backToDetails($pageant, self::PAGEANT_ENDED);
        }

        $scoring = collect($request->scores);

        // Only criteria the staff has currently opened can be scored by judges;
        // hidden criteria are entered by admins through AdminScoringController.
        $criterias = $pageant->criterias()
            ->where('round', $pageant->current_round)
            ->where('group', $pageant->current_group)
            ->where('hidden_scoring', false)
            ->get()
            ->keyBy('id');

        // Judges score only the candidates staff selected into the open round, across every division.
        $candidateIds = $pageant->roundRows((int) $pageant->current_round)
            ->load('candidates')
            ->flatMap(fn($round) => $round->candidates->pluck('id'))
            ->flip();

        $alreadyScored = CandidateCriteria::where('user_id', $judgeId)
            ->whereIn('criteria_id', $criterias->keys())
            ->exists();

        if ($alreadyScored) {
            return $this->alreadySubmitted($pageant);
        }

        $rows = [];
        $now = now();

        foreach ($scoring as $score) {
            $criteria = $criterias->get($score['criteria_id']);

            if (!$criteria || !$candidateIds->has($score['candidate_id'])) {
                throw ValidationException::withMessages([
                    'scores' => 'Some scores are for a criteria or candidate that is not open for scoring.',
                ]);
            }

            $scoreValue = $score['score'];
            $minScore = round($criteria->percentage / 2);

            if ($scoreValue > $criteria->percentage) {
                throw ValidationException::withMessages([
                    'scores' => "Scores for {$criteria->name} cannot exceed {$criteria->percentage}.",
                ]);
            }

            // Auto-correct score if it's below minimum or null
            if ($scoreValue < $minScore || is_null($scoreValue)) {
                $scoreValue = $minScore;
            }

            $rows[] = [
                'user_id'      => $judgeId,
                'criteria_id'  => $criteria->id,
                'candidate_id' => $score['candidate_id'],
                'score'        => $scoreValue,
                'created_at'   => $now,
                'updated_at'   => $now,
            ];
        }

        // Scores are locked once per group, so a partial submission would leave the rest unscorable.
        $pairs = $scoring->map(fn($score) => $score['criteria_id'] . '-' . $score['candidate_id']);

        if ($pairs->unique()->count() !== $pairs->count() || $pairs->count() !== $criterias->count() * $candidateIds->count()) {
            throw ValidationException::withMessages([
                'scores' => 'Score every candidate on every criteria in this group before locking.',
            ]);
        }

        // Insert, never upsert: a submitted score is final. The unique index on
        // (user_id, candidate_id, criteria_id) also rejects a concurrent double-submit.
        try {
            CandidateCriteria::insert($rows);
        } catch (UniqueConstraintViolationException) {
            return $this->alreadySubmitted($pageant);
        }

        broadcast(new ScoreSubmitted($pageant->id))->toOthers();

        return redirect()
            ->route('scoring.details', $pageant)
            ->with('message', 'Scores locked successfully! Please wait for the staff to instruct you before proceeding to the next round of scoring.');
    }

    private function authorizeJudge(Pageant $pageant): void
    {
        abort_unless($pageant->judges()->whereKey(Auth::id())->exists(), 403);
    }

    // A guard that stops a judge must answer with a page: Inertia rejects an empty response.
    private function backToDetails(Pageant $pageant, string $message)
    {
        return redirect()->route('scoring.details', $pageant)->with('message', $message);
    }

    private function alreadySubmitted(Pageant $pageant)
    {
        return redirect()
            ->route('scoring.index', $pageant)
            ->with('message', 'You have already submitted your scores for this round.');
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

        // 5) Split by division & sort, then render
        return Inertia::render('Pageant/PageantScores', [
            'pageant'              => $pageant->load('pageantRounds'),
            'judges'               => $this->judgeProgress($pageant),
            'candidatesByDivision' => $this->rankByDivision($pageant, $candidatesScores),
            // 'criterias'        => $criterias,
            'criterias'            => $pageant->criterias()->where('round', $roundNum)->orderBy('hidden_scoring', 'desc')->get(),
        ]);
    }

    public function forPrinting(Pageant $pageant)
    {
        $candidatesScores = $this->pageantScoreService
            ->getCandidateScores($pageant, null, true);

        return Inertia::render('Pageant/PageantPrinting', [
            'pageant'              => $pageant,
            'candidatesByDivision' => $this->rankByDivision($pageant, $candidatesScores),
            'criterias'            => $this->pageantScoreService->getDetailedCriterias($pageant),
            'judges'               => $pageant->judges,
        ]);
    }

    /**
     * Whether each judge has submitted every score for the currently open group.
     * Hidden criteria are left out: admins enter those, not judges.
     *
     * @return list<array{id: int, name: string, status: string}>
     */
    private function judgeProgress(Pageant $pageant): array
    {
        $groupCriteriaIds = $pageant->criterias()
            ->where('round', $pageant->current_round)
            ->where('group', $pageant->current_group)
            ->where('hidden_scoring', false)
            ->pluck('id');

        // Judges score the candidates selected into the round, across every division's row.
        $candidateCount = $pageant->roundRows((int) $pageant->current_round)
            ->sum(fn($round) => $round->candidates()->count());

        $expectedScores = $candidateCount * $groupCriteriaIds->count();

        $submitted = CandidateCriteria::whereIn('criteria_id', $groupCriteriaIds)
            ->selectRaw('user_id, count(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        return $pageant->judges
            ->map(fn($judge) => [
                'id'     => $judge->id,
                'name'   => $judge->name,
                'status' => $expectedScores > 0 && ($submitted[$judge->id] ?? 0) >= $expectedScores ? 'done' : 'pending',
            ])
            ->values()
            ->all();
    }

    /**
     * Candidates of each of the pageant's divisions, highest total first.
     *
     * @return array<string, list<array<string, mixed>>>
     */
    private function rankByDivision(Pageant $pageant, Collection $candidatesScores): array
    {
        return collect($pageant->divisions)
            ->mapWithKeys(fn(string $division) => [
                $division => $candidatesScores
                    ->where('gender', $division)
                    ->sortByDesc('total')
                    ->values()
                    ->all(),
            ])
            ->all();
    }
}
