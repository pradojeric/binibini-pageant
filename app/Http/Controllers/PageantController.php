<?php

namespace App\Http\Controllers;

use App\Events\GroupChanged;
use App\Events\PageantEnded;
use App\Events\RoundChanged;
use App\Events\ScoresReset;
use App\Models\Pageant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pageants = Pageant::all();
        return Inertia::render('Pageant/PageantIndex', [
            'pageants' => $pageants,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pageant/PageantCreate');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pageant'                                 => 'required|string',
            'type'                                    => 'required|in:mr,ms,mr&ms',
            'background'                              => 'nullable|image',
            'rounds'                                  => 'required|integer|min:1',
            'pageant_rounds'                          => 'required|array',
            'pageant_rounds.*.*.round'                => 'required|integer|min:1',
            'pageant_rounds.*.*.name'                 => 'required|string|max:255',
            'pageant_rounds.*.*.number_of_candidates' => 'required|integer|min:1',
        ]);



        // Handle background file
        if ($request->hasFile('background')) {
            $validated['background'] = $request->file('background')
                ->storePubliclyAs(
                    'pageant',
                    Str::slug($request->pageant) . '.' . $request->file('background')->extension(),
                    'public'
                );
        }

        // Build the child rows
        $selectedSexes = $request->type === 'mr&ms'
            ? ['mr', 'ms']
            : [$request->type];

        $roundRows = [];
        foreach ($selectedSexes as $sex) {
            foreach ($request->pageant_rounds[$sex] as $row) {
                $roundRows[] = [
                    'pageant_type'         => $sex,
                    'round'                => (int) $row['round'],
                    'round_name'         => $row['name'],
                    'number_of_candidates' => (int) $row['number_of_candidates'],
                ];
            }
        }

        // Persist
        DB::transaction(function () use ($validated, $roundRows) {
            $pageant = Pageant::create(collect($validated)->except('pageant_rounds')->toArray());
            $pageant->pageantRounds()->createMany($roundRows);
        });

        return redirect()->route('pageants.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantShow', [
            'pageant' => $pageant->load([
                'criterias' => function ($query) {
                    return $query->orderBy('round')->orderBy('hidden_scoring', 'desc')->orderBy('group');
                },
                'candidates',
                'judges',
                'pageantRounds',
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantEdit', [
            'pageant' => $pageant->load('pageantRounds')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pageant $pageant)
    {
        $validated = $request->validate([
            'pageant'                                 => 'required|string',
            'type'                                    => 'required|in:mr,ms,mr&ms',
            'background'                              => 'nullable|image',
            'rounds'                                  => 'required|integer|min:1',
            'pageant_rounds'                          => 'required|array',
            'pageant_rounds.*.*.round'                => 'required|integer|min:1',
            'pageant_rounds.*.*.name'                 => 'required|string|max:255',
            'pageant_rounds.*.*.number_of_candidates' => 'required|integer|min:1',
        ]);

        // Handle background file
        if ($request->hasFile('background')) {
            // Delete old one
            if ($pageant->background && Storage::disk('public')->exists($pageant->background)) {
                Storage::disk('public')->delete($pageant->background);
            }

            $validated['background'] = $request->file('background')
                ->storePubliclyAs(
                    'pageant',
                    Str::slug($request->pageant) . '-' . time() . '.' . $request->file('background')->extension(),
                    'public'
                );
        } else {
            // Keep old if no new one provided
            unset($validated['background']);
        }

        // Build the child rows
        $selectedSexes = $request->type === 'mr&ms'
            ? ['mr', 'ms']
            : [$request->type];

        $roundRows = [];
        foreach ($selectedSexes as $sex) {
            foreach ($request->pageant_rounds[$sex] as $row) {
                $roundRows[] = [
                    'pageant_type'         => $sex,
                    'round'                => (int) $row['round'],
                    'round_name'           => $row['name'],
                    'number_of_candidates' => (int) $row['number_of_candidates'],
                ];
            }
        }

        // Persist
        DB::transaction(function () use ($pageant, $validated, $roundRows) {
            $pageant->update(collect($validated)->except('pageant_rounds')->toArray());

            // For updates, we'll delete old rounds and recreate them to keep it simple and consistent with the store logic
            // Alternatively, you could do an upsert but sync/recreate is safer for this schema
            $pageant->pageantRounds()->delete();
            $pageant->pageantRounds()->createMany($roundRows);
        });

        return redirect()->route('pageants.index')->with('success', 'Pageant updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pageant $pageant)
    {
        //
    }

    public function endPageant(Pageant $pageant)
    {
        $pageant->update([
            'status' => 'finished',
        ]);

        broadcast(new PageantEnded($pageant->id))->toOthers();

        return back();
    }

    public function selectJudges(Pageant $pageant)
    {
        $judges = User::where('role', 'judge')->get();

        return Inertia::render('Pageant/JudgeSelect', [
            'judges'        => $judges,
            'pageant'       => $pageant->load(['judges']),
            'pageantJudges' => $pageant->judges->pluck('id'),
        ]);
    }

    public function storeJudges(Request $request, Pageant $pageant)
    {
        $pageant->judges()->sync($request->selectedJudges);

        return to_route('pageants.show', $pageant);
    }

    public function changeRound(Request $request, Pageant $pageant)
    {
        $pageant->update(['current_round' => $request->round]);
        $pageant->update(['current_group' => 0]);

        broadcast(new RoundChanged($pageant->id, (int) $request->round, 0))->toOthers();
    }

    public function changeGroup(Request $request, Pageant $pageant)
    {
        $pageant->update(['current_group' => $request->group]);

        broadcast(new GroupChanged($pageant->id, (int) $request->group))->toOthers();
    }

    public function calculateResult(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantResult', [
            'pageant' => $pageant,
        ]);
    }

    public function resetScores(Pageant $pageant)
    {
        foreach ($pageant->criterias as $criteria) {
            $criteria->candidates()->detach();
        }
        foreach ($pageant->pageantRounds as $round) {
            $round->candidatesDeduction()->detach();
            $round->candidates()->detach();
        }

        broadcast(new ScoresReset($pageant->id))->toOthers();

        return back()->with('message', 'Successfully reset score');
    }
}
