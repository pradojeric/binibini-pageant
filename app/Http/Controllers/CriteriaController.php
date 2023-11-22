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
            'pageant' => $pageant->load('criterias'),
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
        $validatedData = $request->validate([
            'name' => ['required'],
            'round' => ['required', 'numeric'],
            'percentage' => ['required', 'numeric'],
            'groups' => ['required', 'numeric']
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
            'name' => ['required'],
            'round' => ['required', 'numeric'],
            'percentage' => ['required', 'numeric'],
            'groups' => ['required', 'numeric']

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
