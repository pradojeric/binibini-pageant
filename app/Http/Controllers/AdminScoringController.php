<?php
namespace App\Http\Controllers;

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
        return Inertia::render('Pageant/Admin/PageantScoring', [
            'pageant'    => $pageant->load(['criterias' => function ($query) use ($pageant) {
                $query->where('hidden_scoring', true);
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

        foreach ($scoring as $i => $scores) {
            Auth::user()->candidateCritieras()->updateOrCreate(
                ['criteria_id' => $scores['criteria_id'], 'candidate_id' => $scores['candidate_id']],
                ['score' => $scores['score']],
            );

        }

        return redirect()->route('pageant.view-scores', $pageant);
    }

    public function select(Pageant $pageant)
    {
        // we want to show scores for last round OR all candidates if none
        $roundNum = $pageant->current_round - 1;
        $round    = $pageant->pageantRounds()->where('round', $roundNum)->first();

        if (! $round || $round->candidates->isEmpty()) {
            // just show un-scored candidates list
            $candidates = $pageant->candidates;
        } else {
            // fetch **scored** candidates from service
            $scored = $this->pageantScoreService->getCandidateScores($pageant, $roundNum);

            // (optional) you could still sort / paginate here,
            // or extract only the pieces your Inertia page needs:
            $candidates = $scored->sortByDesc('total')->values()->all();
        }

        return Inertia::render('Pageant/Admin/SelectRoundCandidate', [
            'pageant'    => $pageant->load('pageantRounds'),
            'candidates' => $candidates,
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

        $shuffled = collect($request->selectedCandidates)
            ->when(
                $round->round !== 1,
                fn($c) => $c->shuffle(),
                fn($c) => $c->sort()
            )
            ->values() // re-index
            ->all();

        $round->candidates()->syncWithoutDetaching($shuffled);

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
