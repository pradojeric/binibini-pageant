# Hiyas Division

Add an LGBTQ+ division, **Hiyas**, that can be combined freely with Mr. and Ms. in one pageant. Along the way: fix the per-round lookup that only ever reads one division's row, and fix the Create/Edit audit findings.

## Decisions (confirmed)

- Key `hiyas`, label **Hiyas** ("Hiyas Division", "Hiyas Candidates").
- A pageant has any non-empty combination of `mr`, `ms`, `hiyas`.
- Fix the round-lookup bug in the same change.
- Fix all Create/Edit audit findings (P0 to P2) in the same change.

## Design

### Storage: no migration

`pageants.type` stays a string. Divisions are stored `&`-joined in a canonical order (`mr`, `ms`, `hiyas`), so existing values `mr`, `ms`, `mr&ms` already parse correctly, and new ones look like `ms&hiyas` or `mr&ms&hiyas`. `pageant_rounds.pageant_type` and `candidates.gender` already hold a single division key, and `hiyas` is just a new value for them. Column names stay the same; renaming `gender` to `division` would need a migration and isn't needed.

### One source of truth

- `app/Enums/Division.php`: a backed enum (`Mr = 'mr'`, `Ms = 'ms'`, `Hiyas = 'hiyas'`) with `label()`, `fromType(string): array` and `toType(array): string` (canonical order).
- `Pageant::divisions()` accessor, appended, so the frontend reads `pageant.divisions` (e.g. `["mr","hiyas"]`) instead of parsing `type`.
- `resources/js/Utils/divisions.js`: `DIVISIONS` (key, label, short label "Mr."/"Ms."/"Hiyas", Tailwind classes for chip/bar/badge with dark variants) plus `divisionOf(key)`. Every page that currently checks `'mr'` or `'ms'` reads from this.
- Hiyas accent color: violet (Mr. is blue, Ms. is pink).

### Pageant create/edit

- The form sends `divisions: string[]` instead of `type`. Validation is `divisions: required|array|min:1` and `divisions.*: Rule::enum(Division::class)|distinct`, and the controller stores `type = Division::toType(...)`.
- `pageant_rounds.{division}` is required for each selected division.
- The UI swaps the type `<select>` for a three-option checkbox group (Mr. / Ms. / Hiyas) and shows one rounds card per selected division.
- Create and Edit share the whole form as `Pages/Pageant/Partials/PageantForm.jsx` (basic info + a `DivisionRoundsCard` per division). The pages only pass labels and their submit route.

### Results and printing

`ScoreController::show/forPrinting` return `candidatesByDivision: { [key]: sorted[] }` (only the pageant's divisions) instead of `maleCandidates`/`femaleCandidates`. PageantScores, PageantPrinting, ComponentToPrint and CandidateScoreList loop over `pageant.divisions`.

### Round-lookup bug fix

Today each round number has one `pageant_rounds` row **per division**, but code calls `->where('round', n)->first()` and gets one division's row only. Also, the round dropdowns send a row `id` while `storeDeduction` looks it up by round **number**.

The fix treats a "round" as a round number made of one row per division:

- **SelectRoundCandidate:** the dropdown is by round number. Candidates are grouped per division, each group has its own limit (that division row's `number_of_candidates`), and "Auto Select Top" works per division. `selectStore` validates the count per division and syncs each division row with that division's candidates.
- **Scoring (`ScoreController::create`, `PageantScoreService::getCandidateScores`):** a round's candidates are the union of all its division rows. A deduction belongs to the row matching the candidate's division.
- **Deductions:** the dropdown is by round number; `storeDeduction` resolves rows by `round` and syncs each candidate's deduction onto their division's row.

### Candidates

Candidate create/edit options come from the pageant's divisions only. Validation becomes `gender: required|in:<pageant divisions>`, so the current gap where any value is accepted gets closed. The default division is preselected when the pageant has exactly one. `Pageant::candidates()` ordering stays `gender desc`: it already gives ms, mr, hiyas, so no change was needed.

### Audit fixes (Create/Edit)

- Show `pageant_rounds.{div}.{i}.name` / `.number_of_candidates` errors on each row, and mark them required.
- Labels: `text-gray-400` becomes `text-gray-600 dark:text-gray-300` (passes AA).
- Add `aria-label` to the round-name and candidate-count inputs.
- File upload: visible focus ring, remove "or drag and drop", state the real limit and enforce it (`image|max:10240`).
- Rounds: `max:20` on both client and server.
- Dark variants for the division chips and the "Selected:" filename; drop the inline `PrimaryButton` overrides.
- Inputs get at least 40px height for touch.

## Checklist

- [x] `Division` enum + `Pageant::divisions` accessor (+ `Pageant::roundRows()`, `Candidate::pageant()`)
- [x] `resources/js/Utils/divisions.js` (Tailwind content glob now includes `.js`)
- [x] PageantController store/update: `divisions[]` validation, canonical `type`, round rows per division, `background` max, `rounds` max
- [x] `PageantForm` partial; PageantCreate + PageantEdit use it (+ audit fixes)
- [x] PageantIndex labels from divisions (also PageantShow, Scoring/Index, PageantPrinting)
- [x] CandidateController validation; CandidateCreate/Edit/List use divisions
- [x] Round-lookup fix: AdminScoringController select/selectStore/storeDeduction, ScoreController::create, PageantScoreService
- [x] SelectRoundCandidate + PageantDeduction UI by round number, grouped per division
- [x] Scoring/Show + Admin/PageantScoring loop over divisions
- [x] ScoreController show/forPrinting → `candidatesByDivision`; PageantScores, CandidateScoreList, PageantPrinting, ComponentToPrint
- [x] `Pageant::candidates()` ordering (no change needed)
- [x] Tests (mocked/in-memory per guidelines): `tests/Unit/DivisionTest.php` (passes), `tests/Feature/HiyasDivisionTest.php` (written, not run). ScoringTest needed no changes.
- [x] Impeccable detector on changed pages. `npm run build` fails on an existing problem: `laravel-echo`/`pusher-js` are in package.json but not installed. Changed pages were compile-checked with esbuild instead.
- [ ] **Blocked until you decide:** `php artisan test`. `ScoringTest` uses `RefreshDatabase`, and the in-memory sqlite lines in `phpunit.xml` (24–25) are commented out, so running the suite would wipe whatever database `.env` points to. Tests must not run until those lines are re-enabled.

## Not in scope

- Renaming `candidates.gender` → `division` (needs a migration; can be done later).
- Seeders (left as-is; a Hiyas seeder can be added on request).
