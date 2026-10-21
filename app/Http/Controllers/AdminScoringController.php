<?php

namespace App\Http\Controllers;

use App\Enums\Division;
use App\Events\ScoreSubmitted;
use App\Models\CandidateCriteria;
use App\Models\Criteria;
use App\Models\Pageant;
use App\Services\PageantScoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AdminScoringController extends Controller
{

    public $pageantScoreService;

    public function __construct(PageantScoreService $pageantScoreService)
    {
        $this->pageantScoreService = $pageantScoreService;
    }

    public function show(Pageant $pageant)
    {
        $round = (int) $pageant->current_round;

        // Hidden scores are entered for the open round only, for the candidates selected into it.
        $candidates = $pageant->roundRows($round)
            ->load('candidates')
            ->flatMap(fn($row) => $row->candidates)
            ->values();

        $hiddenCriteriaIds = $pageant->criterias()
            ->where('hidden_scoring', true)
            ->where('round', $round)
            ->pluck('id');

        // Hidden scores belong to the criteria + candidate pair, whichever admin entered them.
        $existingScores = [];
        $hiddenScores = CandidateCriteria::whereIn('criteria_id', $hiddenCriteriaIds)
            ->get(['candidate_id', 'criteria_id', 'score']);

        foreach ($hiddenScores as $score) {
            $existingScores[$score->candidate_id][$score->criteria_id] = $score->score;
        }

        return Inertia::render('Pageant/Admin/PageantScoring', [
            'pageant'    => $pageant->load(['criterias' => function ($query) use ($round) {
                $query->where('hidden_scoring', true)->where('round', $round);
            }, 'judges']),
            'candidates' => $candidates,
            'existingScores' => $existingScores,
        ]);
    }

    public function store(Request $request, Pageant $pageant)
    {
        $request->validate([
            'scores'                => ['required', 'array'],
            'scores.*.criteria_id'  => ['required', 'integer'],
            'scores.*.candidate_id' => ['required', 'integer'],
            'scores.*.score'        => ['required', 'numeric', 'min:0'],
        ]);

        $scoring = collect($request->scores);
        $round   = (int) $pageant->current_round;

        // Same checks as a judge's submission, but for the hidden criteria only staff can enter.
        // Limited to the open round, so a stale tab cannot overwrite a closed round's scores.
        $criterias = $pageant->criterias()
            ->whereIn('id', $scoring->pluck('criteria_id')->unique())
            ->where('hidden_scoring', true)
            ->where('round', $round)
            ->get()
            ->keyBy('id');

        $candidateIds = $pageant->roundRows($round)
            ->load('candidates')
            ->flatMap(fn($row) => $row->candidates->pluck('id'))
            ->flip();

        foreach ($scoring as $score) {
            $criteria = $criterias->get($score['criteria_id']);

            if (!$criteria || !$candidateIds->has($score['candidate_id'])) {
                throw ValidationException::withMessages([
                    'scores' => 'Some scores are for a criteria or candidate that is not open for hidden scoring in this round.',
                ]);
            }

            if ($score['score'] > $criteria->percentage) {
                throw ValidationException::withMessages([
                    'scores' => "Scores for {$criteria->name} cannot exceed {$criteria->percentage}.",
                ]);
            }
        }

        // One hidden score per criteria + candidate: a later entry from any admin replaces it instead
        // of adding a second row that would be summed. user_id records who entered it first.
        DB::transaction(function () use ($scoring, $criterias) {
            // The unique index includes user_id, so it cannot stop two admins inserting the same pair.
            // Locking the criteria rows makes concurrent saves wait, so the second one finds the first's row.
            Criteria::whereKey($criterias->keys()->sort()->values())->lockForUpdate()->get();

            foreach ($scoring as $score) {
                $row = CandidateCriteria::firstOrNew(['criteria_id' => $score['criteria_id'], 'candidate_id' => $score['candidate_id']]);
                $row->user_id ??= Auth::id();
                $row->score = $score['score'];
                $row->save();
            }
        });

        broadcast(new ScoreSubmitted($pageant->id))->toOthers();

        return redirect()->route('scoring.admin', $pageant);
    }

    public function select(Pageant $pageant, Request $request)
    {
        $roundNumber = $request->integer('round');
        $rounds      = $roundNumber > 0 ? $pageant->roundRows($roundNumber)->load('candidates') : collect();
        $selected    = $rounds->flatMap(fn($round) => $round->candidates->pluck('id'))->values()->all();

        if ($rounds->isNotEmpty() && $roundNumber > 1) {
            $candidates = $this->pageantScoreService
                ->getCandidateScores($pageant, $roundNumber - 1)
                ->sortByDesc('total')
                ->values();
        } else {
            $candidates = $pageant->candidates
                ->sortBy('candidate_number')
                ->map(fn($c) => array_merge($c->toArray(), ['scores' => [], 'deduction' => 0, 'total' => 0]))
                ->values();
        }

        return Inertia::render('Pageant/Admin/SelectRoundCandidate', [
            'pageant'    => $pageant->load('pageantRounds'),
            'candidates' => $candidates->values()->all(),
            'round'      => $rounds->isNotEmpty() ? $roundNumber : null,
            'selected'   => $selected,
        ]);
    }

    public function selectStore(Request $request, Pageant $pageant)
    {
        $request->validate([
            'round'                => ['required', 'integer', 'min:1'],
            'selectedCandidates'   => ['required', 'array'],
            'selectedCandidates.*' => ['integer'],
        ]);

        $rounds = $pageant->roundRows($request->integer('round'));

        if ($rounds->isEmpty()) {
            throw ValidationException::withMessages(['round' => 'That round does not exist for this pageant.']);
        }

        $candidates = $pageant->candidates()
            ->whereIn('candidates.id', $request->selectedCandidates)
            ->get(['candidates.id', 'candidates.gender']);

        if ($candidates->count() !== count(array_unique($request->selectedCandidates))) {
            throw ValidationException::withMessages(['selectedCandidates' => 'Some selected candidates are not in this pageant.']);
        }

        // Each division fills its own slots, so the count is checked per division row.
        $byDivision = $candidates->groupBy('gender');
        $errors     = [];

        foreach ($rounds as $division => $round) {
            $count = $byDivision->get($division, collect())->count();
            if ($count !== $round->number_of_candidates) {
                $label = Division::tryFrom($division)?->label() ?? $division;
                $errors["selectedCandidates.$division"] = "Select exactly {$round->number_of_candidates} {$label} candidates ({$count} selected).";
            }
        }

        foreach ($byDivision->keys()->diff($rounds->keys()) as $division) {
            $errors["selectedCandidates.$division"] = 'These candidates belong to a division that has no slots in this round.';
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        // selectedCandidates arrives in stage order; each division numbers its own candidates from 1.
        $stageOrder = collect($request->selectedCandidates)->unique()->values()->flip();

        DB::transaction(function () use ($rounds, $byDivision, $stageOrder, $pageant, $request) {
            foreach ($rounds as $division => $round) {
                $syncData = $byDivision->get($division, collect())
                    ->pluck('id')
                    ->sortBy(fn($id) => $stageOrder[$id])
                    ->values()
                    ->mapWithKeys(fn($id, $index) => [$id => ['order' => $index + 1]])
                    ->all();

                $round->candidates()->sync($syncData);
            }

            $pageant->current_round = $request->integer('round');
            $pageant->current_group = 0;
            $pageant->save();
        });

        return redirect()->route('pageant.view-scores', $pageant);
    }

    public function deduct(Pageant $pageant)
    {
        $candidates = $pageant->candidates;
        return Inertia::render('Pageant/Admin/PageantDeduction', [
            'pageant'    => $pageant->load('pageantRounds'),
            'candidates' => $candidates->load('candidatesDeduction'),
        ]);
    }

    public function storeDeduction(Request $request, Pageant $pageant)
    {
        $request->validate([
            'round'    => ['required', 'integer', 'min:1'],
            'scores'   => ['required', 'array'],
            'scores.*' => ['nullable', 'numeric', 'min:0'],
        ]);

        $rounds = $pageant->roundRows($request->integer('round'));

        if ($rounds->isEmpty()) {
            throw ValidationException::withMessages(['round' => 'That round does not exist for this pageant.']);
        }

        $scores     = collect($request->scores)->filter(fn($score) => $score && $score != 0);
        $candidates = $pageant->candidates()
            ->whereIn('candidates.id', $scores->keys())
            ->get(['candidates.id', 'candidates.gender'])
            ->groupBy('gender');

        // A deduction is stored on the round row of the candidate's own division.
        DB::transaction(function () use ($rounds, $candidates, $scores) {
            foreach ($rounds as $division => $round) {
                $data = $candidates->get($division, collect())
                    ->mapWithKeys(fn($candidate) => [$candidate->id => ['deduction' => $scores[$candidate->id]]])
                    ->all();

                $round->candidatesDeduction()->sync($data);
            }
        });

        return redirect()->route('pageant.view-scores', $pageant);
    }
}
