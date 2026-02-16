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
            'round'          => ['required', 'numeric'],
            'percentage'     => ['required', 'numeric'],
            'group'          => ['required', 'numeric'],
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
            'round'          => ['required', 'numeric'],
            'percentage'     => ['required', 'numeric'],
            'group'          => ['required', 'numeric'],
            'hidden_scoring' => ['nullable'],
        ]);

        $criteria->update($validatedData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Criteria $criteria)
    {
        // dd($criteria);
        $criteria->delete();
    }
}
