<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Pageant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CandidateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Pageant $pageant)
    {
        return Inertia::render('Pageant/Candidates/Index', [
            'pageant' => $pageant->load(['candidates']),
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
            'candidate_number' => ['required'],
            'picture' => ['nullable', 'image'],
            'last_name' => ['required'],
            'first_name' => ['required'],
            'middle_name' => ['nullable'],
            'name_ext' => ['nullable'],
            'gender' => ['required'],
            'nickname' => ['required'],
            'description' => ['required'],
        ]);

        if (!$request->picture) {
            unset($validatedData['picture']);
        } else {
            $validatedData['picture'] = $request->file('picture')->storePubliclyAs('candidate', $request->candidate_number ,'public');
        }

        $pageant->candidates()->create($validatedData);
    }

    /**
     * Display the specified resource.
     */
    public function show(Candidate $candidate)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Candidate $candidate)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Candidate $candidate)
    {

        $validatedData = $request->validate([
            'candidate_number' => ['required'],
            'picture' => ['nullable', 'image'],
            'last_name' => ['required'],
            'first_name' => ['required'],
            'middle_name' => ['nullable'],
            'name_ext' => ['nullable'],
            'gender' => ['required'],
            'nickname' => ['required'],
            'description' => ['required'],
        ]);

        if (!$request->picture) {
            unset($validatedData['picture']);
        } else {
            if ($candidate->picture && Storage::exists($candidate->picture)) {
                Storage::delete($candidate->picture);
            }
            $validatedData['picture'] = $request->file('picture')->storePubliclyAs('candidate', $request->candidate_number ,'public');
        }

        $candidate->update($validatedData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Candidate $candidate)
    {
        if ($candidate->picture && Storage::exists($candidate->picture)) {
            Storage::delete($candidate->picture);
        }
        $candidate->delete();
    }
}
