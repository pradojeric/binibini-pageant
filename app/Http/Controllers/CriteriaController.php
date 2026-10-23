<?php

namespace App\Http\Controllers;

use App\Models\Criteria;
use App\Models\Pageant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CriteriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Pageant $pageant)
    {
        return Inertia::render('Pageant/Criterias/Index', [
            'pageant' => $pageant->load(['criterias' => function ($criteria) {
                $criteria->orderBy('round')->orderBy('hidden_scoring', 'desc')->orderBy('group');
            }]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Pageant $pageant)
    {
        // dd($request->all());
        $validatedData = $request->validate([
            'name'           => ['required'],
            'round'          => ['required', 'integer', 'min:1'],
            'percentage'     => ['required', 'numeric', 'min:1', 'max:100'],
            'group'          => ['required', 'integer', 'min:1'],
            'hidden_scoring' => ['nullable'],
        ]);

        $pageant->criterias()->create($validatedData);
    }

    /**
     * Display the specified resource.
     */
    public function show(Criteria $criteria)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Criteria $criteria)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Criteria $criteria)
    {
        $validatedData = $request->validate([
            'name'           => ['required'],
            'round'          => ['required', 'integer', 'min:1'],
            'percentage'     => ['required', 'numeric', 'min:1', 'max:100'],
            'group'          => ['required', 'integer', 'min:1'],
            'hidden_scoring' => ['nullable'],
        ]);

        $criteria->update($validatedData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Criteria $criteria)
    {
        // Scores reference the criteria, so deleting would fail on the foreign key.
        if ($criteria->candidates()->exists()) {
            return back()->withErrors(['delete' => "{$criteria->name} already has scores, so it can't be deleted."]);
        }

        $criteria->delete();
    }
}
