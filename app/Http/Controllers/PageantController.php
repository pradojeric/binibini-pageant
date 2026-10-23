<?php

namespace App\Http\Controllers;

use App\Enums\Division;
use App\Events\GroupChanged;
use App\Events\PageantEnded;
use App\Events\RoundChanged;
use App\Events\ScoresReset;
use App\Models\Pageant;
use App\Models\PageantRound;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PageantController extends Controller
{
    private const MAX_ROUNDS = 20;

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
        [$validated, $roundRows] = $this->validatePageant($request);

        if ($request->hasFile('background')) {
            $validated['background'] = $request->file('background')
                ->storePubliclyAs(
                    'pageant',
                    Str::slug($request->pageant) . '.' . $request->file('background')->extension(),
                    'public'
                );
        }

        // Persist
        DB::transaction(function () use ($validated, $roundRows) {
            $pageant = Pageant::create($validated);
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
            'pageant' => $pageant->load(['pageantRounds' => function ($query) {
                $query->withCount(['candidates', 'candidatesDeduction']);
            }])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pageant $pageant)
    {
        [$validated, $roundRows] = $this->validatePageant($request);

        // Handle background file
        if ($request->hasFile('background')) {
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
            unset($validated['background']);
        }

        // Rows are matched by (division, round) and updated in place, so a round keeps its
        // advanced candidates and deductions when only its name or slot count changes.
        $existing = $pageant->pageantRounds()
            ->withCount(['candidates', 'candidatesDeduction'])
            ->get()
            ->keyBy(fn(PageantRound $row) => $row->pageant_type . ':' . $row->round);

        $submitted = collect($roundRows)->keyBy(fn(array $row) => $row['pageant_type'] . ':' . $row['round']);
        $removed   = $existing->diffKeys($submitted);

        $withData = $removed->filter(fn(PageantRound $row) => $row->candidates_count > 0 || $row->candidates_deduction_count > 0);
        if ($withData->isNotEmpty()) {
            $names = $withData->map(fn(PageantRound $row) => $row->round_name . ' (' . (Division::tryFrom($row->pageant_type)?->label() ?? $row->pageant_type) . ')')->join(', ');
            throw ValidationException::withMessages([
                'rounds' => "These rounds already have selected candidates or deductions and can't be removed: {$names}.",
            ]);
        }

        DB::transaction(function () use ($pageant, $validated, $existing, $submitted, $removed) {
            $pageant->update($validated);

            foreach ($submitted as $key => $row) {
                $existing->has($key)
                    ? $existing[$key]->update($row)
                    : $pageant->pageantRounds()->create($row);
            }

            PageantRound::whereKey($removed->modelKeys())->delete();
        });

        return redirect()->route('pageants.index')->with('success', 'Pageant updated successfully.');
    }

    /**
     * Validate the create/update payload and build one round row per division per round.
     *
     * @return array{0: array<string, mixed>, 1: list<array<string, mixed>>}
     */
    private function validatePageant(Request $request): array
    {
        // Only the divisions actually chosen need round rows, so build those rules from the input.
        $divisions = array_values(array_intersect(Division::values(), (array) $request->input('divisions', [])));

        $rules = [
            'pageant'        => ['required', 'string', 'max:255'],
            'divisions'      => ['required', 'array', 'min:1'],
            'divisions.*'    => [Rule::enum(Division::class), 'distinct'],
            'background'     => ['nullable', 'image', 'max:10240'],
            'rounds'         => ['required', 'integer', 'min:1', 'max:' . self::MAX_ROUNDS],
            'pageant_rounds' => ['required', 'array'],
        ];

        foreach ($divisions as $division) {
            $rules["pageant_rounds.$division"]                        = ['required', 'array', 'size:' . (int) $request->input('rounds')];
            $rules["pageant_rounds.$division.*.round"]                = ['required', 'integer', 'min:1'];
            $rules["pageant_rounds.$division.*.name"]                 = ['required', 'string', 'max:255'];
            $rules["pageant_rounds.$division.*.number_of_candidates"] = ['required', 'integer', 'min:1'];
        }

        $validated = $request->validate($rules, [], [
            'pageant_rounds.*.*.name'                 => 'round name',
            'pageant_rounds.*.*.number_of_candidates' => 'number of candidates',
        ]);

        $roundRows = [];
        foreach ($divisions as $division) {
            foreach ($validated['pageant_rounds'][$division] as $row) {
                $roundRows[] = [
                    'pageant_type'         => $division,
                    'round'                => (int) $row['round'],
                    'round_name'           => $row['name'],
                    'number_of_candidates' => (int) $row['number_of_candidates'],
                ];
            }
        }

        $validated['type'] = Division::toType($validated['divisions']);
        unset($validated['divisions'], $validated['pageant_rounds']);

        return [$validated, $roundRows];
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pageant $pageant)
    {
        //
    }

    public function deleteRound(Request $request, PageantRound $pageantRound)
    {
        $hasData = $pageantRound->candidates()->exists() || $pageantRound->candidatesDeduction()->exists();

        if ($hasData && !$request->boolean('confirmed')) {
            return response()->json([
                'requires_confirmation' => true,
                'message' => 'This round has scoring data. Deleting it will remove all associated scores and deductions.',
            ], 422);
        }

        DB::transaction(function () use ($pageantRound) {
            $pageantRound->candidates()->detach();
            $pageantRound->candidatesDeduction()->detach();
            $pageantRound->delete();
        });

        return response()->json(['message' => 'Round deleted successfully.']);
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
        // 0 is "not started"; anything else must be a round this pageant has.
        $validated = $request->validate([
            'round' => ['required', 'integer', Rule::in([0, ...$pageant->pageantRounds()->distinct()->pluck('round')])],
        ]);

        $pageant->update([
            'current_round' => $validated['round'],
            'current_group' => 0,
        ]);

        broadcast(new RoundChanged($pageant->id, (int) $validated['round'], 0))->toOthers();

        return back();
    }

    public function changeGroup(Request $request, Pageant $pageant)
    {
        // 0 closes judging; anything else must be a group of the current round's criteria.
        $validated = $request->validate([
            'group' => ['required', 'integer', Rule::in([0, ...$pageant->criterias()->where('round', $pageant->current_round)->distinct()->pluck('group')])],
        ]);

        $pageant->update(['current_group' => $validated['group']]);

        // Group 0 is broadcast too, so judges' pages drop the closed group's "Active" state.
        broadcast(new GroupChanged($pageant->id, (int) $pageant->current_round, (int) $validated['group']))->toOthers();

        return back();
    }

    public function calculateResult(Pageant $pageant)
    {
        return Inertia::render('Pageant/PageantResult', [
            'pageant' => $pageant,
        ]);
    }

    /**
     * Erases all judge and hidden scores; deductions and each round's selections are kept.
     */
    public function resetScores(Pageant $pageant)
    {
        $this->eraseScoring($pageant, everything: false);

        return back()->with('message', 'Scores were reset. Deductions and round selections were kept.');
    }

    /**
     * Erases all scores, deductions and every round's selected candidates.
     */
    public function resetEverything(Pageant $pageant)
    {
        $this->eraseScoring($pageant, everything: true);

        return back()->with('message', 'Scores, deductions and round selections were reset.');
    }

    private function eraseScoring(Pageant $pageant, bool $everything): void
    {
        DB::transaction(function () use ($pageant, $everything) {
            foreach ($pageant->criterias as $criteria) {
                $criteria->candidates()->detach();
            }
            if ($everything) {
                foreach ($pageant->pageantRounds as $round) {
                    $round->candidatesDeduction()->detach();
                    $round->candidates()->detach();
                }
            }

            $pageant->current_round = 0;
            $pageant->current_group = 0;
            $pageant->save();
        });

        broadcast(new ScoresReset($pageant->id))->toOthers();
    }
}
