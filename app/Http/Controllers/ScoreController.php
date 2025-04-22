<?php
namespace App\Http\Controllers;

use App\Models\CandidateCriteria;
use App\Models\Criteria;
use App\Models\Pageant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScoreController extends Controller
{
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

    public function viewScores(Request $request, Pageant $pageant)
    {

        $criterias  = $pageant->criterias->where('round', $pageant->current_round)->values()->all();
        $round      = $pageant->pageantRounds()->where('round', $pageant->current_round)->first();
        $candidates = $round ? $round->candidates : $pageant->candidates;

        $candidatesScores = $candidates->map(function ($candidate) use ($criterias, $round) {
            $scores = [];
            foreach ($criterias as $criteria) {
                $pivot                 = $criteria->candidates->where('id', $candidate->id)->sum('pivot.score');
                $scores[$criteria->id] = $pivot ?? '';
            }

            $total                  = array_sum($scores);
            $candidate['scores']    = $scores;
            $deduction              = $candidate->candidatesDeduction()->find($round) ? $candidate->candidatesDeduction()->find($round)->pivot->deduction : 0;
            $candidate['deduction'] = $deduction;
            $candidate['total']     = $total - $deduction;

            return $candidate;
        });

        $maleCandidates   = $candidatesScores->where('gender', 'mr')->sortByDesc('total')->values()->all();
        $femaleCandidates = $candidatesScores->where('gender', 'ms')->sortByDesc('total')->values()->all();

        return Inertia::render('Pageant/PageantScores', [
            'pageant'          => $pageant->load('pageantRounds'),
            'maleCandidates'   => $maleCandidates,
            'femaleCandidates' => $femaleCandidates,
            'criterias'        => $criterias,
        ]);
    }

    public function forPrinting(Pageant $pageant)
    {

        $candidates = $pageant->candidates;
        $criterias  = $pageant->criterias;
        $judges     = $pageant->judges;

        $candidatesScores = $candidates->map(function ($candidate) use ($criterias, $judges) {
            $scores = [];

            foreach ($criterias as $criteria) {
                if ($criteria->hidden_scoring) {
                    $pivot = CandidateCriteria::where(function ($query) use ($candidate, $criteria) {
                        $query->where('criteria_id', $criteria->id)->where('candidate_id', $candidate->id);
                    })->sum('score');
                    $scores[$criteria->id][0] = $pivot ?? '';

                } else {

                    foreach ($judges as $judge) {
                        // $pivot = $criteria->candidates()->where('candidates.id', $candidate->id)->wherePivot('user_id', $judge->id)->get()->sum('pivot.score');
                        $pivot = CandidateCriteria::where(function ($query) use ($candidate, $judge, $criteria) {
                            $query->where('criteria_id', $criteria->id)->where('candidate_id', $candidate->id)->where('user_id', $judge->id);
                        })->sum('score');
                        $scores[$criteria->id][$judge->id] = $pivot ?? '';
                    }
                }
                $scores[$criteria->id]['total'] = array_sum($scores[$criteria->id]);
            }

            $total = array_sum(array_column($scores, 'total'));

            $candidate['scores']    = $scores;
            $deduction              = $candidate->candidatesDeduction->sum('pivot.deduction');
            $candidate['deduction'] = $deduction;
            $candidate['total']     = $total - $deduction;

            return $candidate;
        });

        $maleCandidates   = $candidatesScores->where('gender', 'mr')->sortByDesc('total')->values()->all();
        $femaleCandidates = $candidatesScores->where('gender', 'ms')->sortByDesc('total')->values()->all();

        return Inertia::render('Pageant/PageantPrinting', [
            'pageant'          => $pageant,
            'maleCandidates'   => $maleCandidates,
            'femaleCandidates' => $femaleCandidates,
            'criterias'        => $criterias->values()->all(),
            'judges'           => $judges,
        ]);
    }
}
