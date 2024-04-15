<?php

namespace App\Http\Controllers;

use App\Models\Pageant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        // dd($request->all());
        $validatedData = $request->validate([
            'pageant' => ['required'],
            'type' => ['required'],
            'background' => ['nullable', 'image'],
            'rounds' => ['required', 'numeric'],
            'pageant_rounds' => ['required', 'array'],
        ]);

        if (!$request->picture) {
            unset($validatedData['background']);
        } else {
            $validatedData['background'] = $request->file('background')->storePubliclyAs('pageant', $request->pageant, 'public');
        }

        $regexString = '/m[rs]/';
        preg_match($regexString, $request->type, $matches);
        // dd($matches);

        $data = [];
        foreach ($request->pageant_rounds as $type => $pageant_rounds) {

            if (in_array($type, $matches)) {
                foreach ($pageant_rounds as $pageant_round) {
                    $data[] = [
                        'pageant_type' => $type,
                        'round' => $pageant_round['round'],
                        'number_of_candidates' => $pageant_round['number_of_candidates'],
                    ];
                }
            }
        }
        $pageant = Pageant::create(collect($validatedData)->except('pageant_rounds')->toArray());
        $pageant->pageantRounds()->createMany($data);

        return redirect()->route('pageants.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantShow', [
            'pageant' => $pageant->load(['criterias', 'candidates', 'judges']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantEdit', ['pageant' => $pageant]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pageant $pageant)
    {
        $validatedData = $request->validate([
            'pageant' => ['required'],
            'type' => ['required'],
            'background' => ['nullable', 'image'],
            'rounds' => ['required', 'numeric'],
            'separate_scoring' => ['required'],
        ]);

        if (!$request->background) {
            unset($validatedData['background']);
        } else {
            if ($pageant->background && Storage::exists($pageant->background)) {
                Storage::delete($pageant->background);
            }

            $validatedData['background'] = $request->file('background')->storePublicly('pageant', 'public');
        }

        $pageant->update($validatedData);

        return redirect()->route('pageants.index');
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
    }

    public function selectJudges(Pageant $pageant)
    {
        $judges = User::where('role', 'judge')->get();

        return Inertia::render('Pageant/JudgeSelect', [
            'judges' => $judges,
            'pageant' => $pageant->load(['judges']),
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
    }

    public function changeGroup(Request $request, Pageant $pageant)
    {
        $pageant->update(['current_group' => $request->group]);
    }

    public function calculateResult(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantResult', [
            'pageant' => $pageant,
        ]);
    }

    public function resetScores(Pageant $pageant)
    {

        foreach($pageant->criterias as $criteria)
        {
            $criteria->candidates()->detach();
        }
        foreach($pageant->pageantRounds as $round){
            $round->candidatesDeduction()->detach();
            $round->candidates()->detach();
        }

        return back()->with('message', 'Successfully reset score');
    }
}
