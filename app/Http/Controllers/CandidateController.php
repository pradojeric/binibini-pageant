<?php
namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Pageant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
            'candidate_number' => ['required', 'integer', 'min:1'],
            'picture'          => ['nullable', 'mimes:jpg,jpeg,png,webp'],
            'last_name'        => ['required'],
            'first_name'       => ['required'],
            'middle_name'      => ['nullable'],
            'name_ext'         => ['nullable'],
            'gender'           => ['required', Rule::in($pageant->divisions)],
            'nickname'         => ['required'],
            'description'      => ['required'],
        ]);

        // A generated name keeps candidates who share a name or number from overwriting each other's picture.
        if ($request->hasFile('picture')) {
            $validatedData['picture'] = $request->file('picture')->store('candidate', 'public');
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
            'candidate_number' => ['required', 'integer', 'min:1'],
            'picture'          => ['nullable', 'mimes:jpg,jpeg,png,webp'],
            'last_name'        => ['required'],
            'first_name'       => ['required'],
            'middle_name'      => ['nullable'],
            'name_ext'         => ['nullable'],
            'gender'           => ['required', Rule::in($candidate->pageant->divisions)],
            'nickname'         => ['required'],
            'description'      => ['required'],
        ]);

        if (! $request->picture) {
            unset($validatedData['picture']);
        } else {
            // Pictures live on the public disk; the default disk is local, so the old file was never found.
            if ($candidate->picture) {
                Storage::disk('public')->delete($candidate->picture);
            }
            $validatedData['picture'] = $request->file('picture')->store('candidate', 'public');
        }

        $candidate->update($validatedData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Candidate $candidate)
    {
        // Scores and round records reference the candidate, so deleting would fail on the foreign keys.
        if ($candidate->criterias()->exists() || $candidate->pageantRounds()->exists() || $candidate->candidatesDeduction()->exists()) {
            return back()->withErrors(['delete' => "{$candidate->full_name} already has scores or round entries, so they can't be deleted."]);
        }

        if ($candidate->picture) {
            Storage::disk('public')->delete($candidate->picture);
        }
        $candidate->delete();
    }
}
