<?php

namespace App\Http\Controllers;

use App\Events\ScoreSubmitted;
use App\Models\Pageant;
use App\Services\PageantScoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $candidates = $pageant->candidates;

        $hiddenCriteriaIds = $pageant->criterias()->where('hidden_scoring', true)->pluck('id');

        $existingScores = [];
        $userScores = Auth::user()->candidateCriterias()
            ->whereIn('criteria_id', $hiddenCriteriaIds)
            ->get(['candidate_id', 'criteria_id', 'score']);

        foreach ($userScores as $score) {
            $existingScores[$score->candidate_id][$score->criteria_id] = $score->score;
        }

        return Inertia::render('Pageant/Admin/PageantScoring', [
            'pageant'    => $pageant->load(['criterias' => function ($query) {
                $query->where('hidden_scoring', true);
            }, 'judges']),
            'candidates' => $candidates,
            'existingScores' => $existingScores,
        ]);
    }

    public function store(Request $request, Pageant $pageant)
    {
        // dd($request->all());
        $request->validate([
            'scores' => ['required', 'array'],
        ]);

        $scoring = $request->scores;

        foreach ($scoring as $i => $scores) {
            Auth::user()->candidateCriterias()->updateOrCreate(
                ['criteria_id' => $scores['criteria_id'], 'candidate_id' => $scores['candidate_id']],
                ['score' => $scores['score']],
            );
        }

        broadcast(new ScoreSubmitted($pageant->id))->toOthers();

        return redirect()->route('scoring.admin', $pageant);
    }

    public function select(Pageant $pageant, Request $request)
    {
        $candidates = collect();
        $selected = [];

        if ($request->has('round')) {
            $round = $pageant->pageantRounds()->where('id', $request->round)->first();
            if ($round) {
                $selected = $round->candidates()->orderByPivot('order')->pluck('candidates.id')->toArray();
                $previousRoundNum = $round->round - 1;
                if ($previousRoundNum >= 1) {
                    $candidates = $this->pageantScoreService
                        ->getCandidateScores($pageant, $previousRoundNum)
                        ->sortByDesc('total')->values();
                } else {
                    $candidates = $pageant->candidates
                        ->sortBy('candidate_number')
                        ->map(fn($c) => array_merge($c->toArray(), ['scores' => [], 'deduction' => 0, 'total' => 0]))
                        ->values();
                }
            }
        }

        if ($candidates->isEmpty() && !$request->has('round')) {
            $candidates = $pageant->candidates
                ->sortBy('candidate_number')
                ->map(fn($c) => array_merge($c->toArray(), ['scores' => [], 'deduction' => 0, 'total' => 0]))
                ->values();
        }

        return Inertia::render('Pageant/Admin/SelectRoundCandidate', [
            'pageant'    => $pageant->load('pageantRounds'),
            'candidates' => $candidates->values()->all(),
            'selected'   => $selected,
        ]);
    }

    public function selectStore(Request $request, Pageant $pageant)
    {
        // dd($request->all());
        $request->validate([
            'round' => ['required'],
        ]);

        $round = $pageant->pageantRounds->where('id', $request->round)->first();

        $request->validate([
            'selectedCandidates' => ['required', 'array', 'size:' . $round->number_of_candidates],
        ]);

        $syncData = collect($request->selectedCandidates)
            ->values()
            ->mapWithKeys(fn($id, $index) => [$id => ['order' => $index + 1]])
            ->all();

        $round->candidates()->sync($syncData);
        $pageant->current_round = $round->round;
        $pageant->save();

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
        // dd($request->all());
        $request->validate([
            'round'  => ['required'],
            'scores' => ['required', 'array'],
        ]);

        $round = $pageant->pageantRounds()->where('round', $request->round)->first();
        $data  = [];
        foreach ($request->scores as $i => $score) {
            if ($score && $score != 0) {
                $data[$i] = ['deduction' => $score];
            }
        }

        $round->candidatesDeduction()->sync($data);

        return redirect()->route('pageant.view-scores', $pageant);
    }
}
