# Scoring Flow

How a score gets from a judge's input box to the printed summary, which pages take part, and what to improve. Sourced from the graphify graph (`graphify-out/graph.json`, communities *Score Controller & Aggregation*, *Admin Scoring & Deductions*, *Realtime Broadcast Events*) and a read of the code on `feature/web-sockets`.

## 1. Actors and state

| Actor | Role | Main pages |
|---|---|---|
| **Staff / admin** (`check.role:admin`) | Sets up the pageant, opens rounds and groups, enters hidden scores and deductions, advances candidates, prints results | `Pageant/PageantShow`, `Pageant/PageantScores`, `Pageant/Admin/*`, `Pageant/PageantPrinting` |
| **Judge** (any authenticated user assigned via `judge_pageant`) | Scores the open group of criteria for the candidates in the current round | `Scoring/Index`, `Scoring/Details`, `Scoring/Show` |

The whole flow is driven by two columns on `pageants`:

- `current_round` — which round is live. `null`/0 means not started.
- `current_group` — which group of criteria inside that round judges may score. Reset to `0` on every round change.

Other data:

- `criterias` — `round`, `group`, `percentage` (max score), `hidden_scoring` (true = staff enters it, judges never see it).
- `pageant_rounds` — **one row per division per round** (`pageant_type` = division). `number_of_candidates` is the slot count. `Pageant::roundRows($round)` returns them keyed by division.
- `candidate_criteria` — one score per `(user_id, candidate_id, criteria_id)`, unique index.
- `candidate_round` (via `PageantRound::candidates`) — who advanced into a round.
- round deduction pivot (via `PageantRound::candidatesDeduction`) — deduction per candidate per round row.

## 2. End-to-end flow

```mermaid
sequenceDiagram
    autonumber
    participant A as Staff (PageantScores)
    participant S as Laravel
    participant WS as Reverb channel pageant.{id}
    participant J as Judge (Scoring/*)

    A->>S: PUT change-round {round}
    S->>S: current_round = n, current_group = 0
    S-->>WS: RoundChanged
    WS-->>J: .round.changed → router.reload()
    A->>S: PUT change-group {group}
    S-->>WS: GroupChanged
    WS-->>J: .group.changed → router.reload()
    J->>S: GET scoring.details → pick the "Active Now" group card
    J->>S: GET scoring.score {criteria}
    S-->>J: Scoring/Show (open criteria × round candidates)
    J->>S: POST scoring.store {scores[]}
    S->>S: validate, clamp to [percentage/2, percentage], insert (never upsert)
    S-->>WS: ScoreSubmitted
    WS-->>A: .score.submitted → router.reload() of PageantScores
    A->>S: GET scoring.admin → POST scoring.admin.store (hidden criteria, upsert)
    A->>S: GET pageant.deduct → POST deduct.store (per round, per division row)
    A->>S: GET candidate-round?round=n+1 → POST select.store
    S->>S: sync advancing candidates per division; current_round = n+1
    A->>S: GET for-printing → PageantPrinting (all rounds, per-judge columns)
    A->>S: POST end-pageant → status = finished → PageantEnded
```

### 2.1 Staff opens a round

`Pageant/PageantScores.jsx` has two selects that fire immediately on change:

- **Round** → `PUT pageant.change-round` → `PageantController::changeRound` (`app/Http/Controllers/PageantController.php:218`) sets `current_round`, resets `current_group` to 0, broadcasts `RoundChanged`.
- **Group** → `PUT pageant.change-group` → `PageantController::changeGroup` (`:226`) sets `current_group`, broadcasts `GroupChanged`.

Round 2+ should first be filled through **Select Candidate** (§2.5); `selectStore` also sets `current_round`.

### 2.2 Judge picks what to score

1. `Scoring/Index.jsx` ← `ScoreController::index` — card grid of the judge's assigned, unfinished pageants.
2. `Scoring/Details.jsx` ← `ScoreController::showDetails` — non-hidden criteria grouped `round_name → group`. The card matching `current_round`/`current_group` is outlined green as "Active Now" and is the only link; groups the judge locked say "Submitted", the rest "Closed". Listens for `.round.changed`, `.group.changed`, `.pageant.ended`.
3. Clicking a card → `ScoreController::score($pageant, $criteria)` (`ScoreController.php:77`). It guards: group not active, round not started, judge already scored that criteria. On pass it renders `Scoring/Show` with the open criteria (round + group + not hidden) and the candidates selected into the current round (`roundRows(current_round)->candidates`).

> `ScoreController::show` (`/scoring/pageants/{pageant}`) is an older entry point. It loads all of the round's criteria and **all** pageant candidates, and nothing in the UI links to it any more.

### 2.3 Judge enters and locks scores

`Scoring/Show.jsx` → `CandidateBox` → `ScoringInput` per criteria.

- `ScoringInput` keeps its own `value` state. On change it forwards any number > 0. On blur it clamps to `[round(percentage/2), percentage]`; the label shows that range ("15–30 pts").
- The sticky stats bar shows **Scored x / n**, counting candidates with at least one score.
- Submit checks every (candidate × criteria) pair has a value (empty ones are outlined red and the first is focused), then opens a review modal; **Lock Scores** there sends `POST scoring.store`.

`ScoreController::store` (`ScoreController.php:111`):

1. Validates the shape, then `abort_unless` the user is a judge of this pageant (403).
2. Loads only criteria that are in the current round **and** group and not hidden; any other id → validation error.
3. Rejects candidates not in this pageant.
4. If the judge has any score for these criteria → "already submitted".
5. Rejects score > percentage. **Raises null or below-minimum scores to `round(percentage/2)`.**
6. Bulk `insert` (a submitted score is final; the unique index catches double-submits).
7. Broadcasts `ScoreSubmitted`, redirects to `scoring.index` with a flash message.

### 2.4 Staff watches live totals

`Pageant/PageantScores.jsx` ← `ScoreController::viewScores` → `PageantScoreService::getRoundCandidateScores($pageant, current_round)`:

- Criteria: every criteria of the round, hidden first.
- Candidates: those selected into the round. None selected → none listed, and the page shows a "Select candidates for this round" empty state.
- Per criteria: `sum(pivot.score)` **across all judges**. This is the client's rule: a candidate's criteria score is the sum of every judge's score, never an average. Printing applies the same rule (per-judge columns, then their sum).
- Deduction: sum of the candidate's deductions on this round's rows.
- `total = Σ criteria − deduction`; `rankByDivision` splits by division and sorts by total.

The client re-ranks with `rankItems` (ties share an averaged rank, e.g. `2.5`) and can re-sort by a single criteria. In round 1 only, it adds *Deduction* and *Overall* columns. The page reloads on `.score.submitted`, `.scores.reset`, `.round.changed`, `.group.changed`.

Toolbar actions: **Score Hidden**, **Select Candidate**, **Deduct**, **Summary**, **Reset Scores** and **Reset Everything** (modal confirm each), **End** (modal confirm).

### 2.5 Staff-only inputs

| Page | Controller | What it writes |
|---|---|---|
| `Admin/PageantScoring.jsx` (**Score Hidden**) | `AdminScoringController::show/store` | One `candidate_criteria` row per criteria + candidate (a later admin's entry replaces it) for the current round's hidden criteria and the candidates selected into it. Validates hidden criteria of this pageant, candidate of this pageant, `0 ≤ score ≤ percentage`. Redirects back to the hidden-scoring page. |
| `Admin/PageantDeduction.jsx` (**Deduct**) | `deduct/storeDeduction` | Picks a round, then `sync`s each division row's deductions (0 or blank removes the row). Wrapped in a transaction. |
| `Admin/SelectRoundCandidate.jsx` (**Select Candidate**) | `select/selectStore` | For round n > 1, lists candidates ranked by round n−1 totals. Validates exact slot count per division, `sync`s the round rows (round 1 sorted by id, later rounds **shuffled** for stage order), sets `current_round = n`. Transaction. |

### 2.6 Printing and closing

- `Pageant/PageantPrinting.jsx` + `Partials/ComponentToPrint.jsx` ← `ScoreController::forPrinting` → `PageantScoreService::getDetailedCandidateScores`. One table per criteria with a column per judge, then a "Total" subtotal per round (raw − that round's deductions), then a Grand Total. Each round's tables list only the candidates selected into that round; the Grand Total lists everyone. Printed via `react-to-print`.
- **Reset Scores** → `PageantController::resetScores` detaches all judge and hidden scores and keeps deductions and round selections. **Reset Everything** → `resetEverything` also detaches deductions and round selections. Both broadcast `ScoresReset`.
- **End** → `endPageant` sets `status = finished`, broadcasts `PageantEnded`.

### 2.7 Realtime

All five events (`ScoreSubmitted`, `RoundChanged`, `GroupChanged`, `ScoresReset`, `PageantEnded`) are `ShouldBroadcastNow` on the public channel `pageant.{id}` and carry only ids. `resources/js/hooks/usePageantChannel.js` responds to every event by calling `router.reload({ preserveScroll: true })`.

| Page | Listens for |
|---|---|
| `Scoring/Details` | round, group, ended |
| `Scoring/Show` | round, group, reset, ended |
| `Pageant/PageantScores` | score, reset, round, group |

## 3. Page map

```mermaid
flowchart LR
    subgraph Judge
        I[Scoring/Index] --> D[Scoring/Details] --> SH[Scoring/Show] -->|store| I
    end
    subgraph Staff
        PS[Pageant/PageantShow] -->|View scores| PSC[Pageant/PageantScores]
        PSC --> HID[Admin/PageantScoring]
        PSC --> SEL[Admin/SelectRoundCandidate]
        PSC --> DED[Admin/PageantDeduction]
        PSC --> PR[Pageant/PageantPrinting]
        PS --> PR
        HID & SEL & DED -->|redirect| PSC
    end
    PSC -. round/group .-> D
    SH -. score.submitted .-> PSC
```

## 4. Flow issues and recommendations

Ordered by how much they can hurt on event night.

### P0: can break scoring live

1. ✅ **Fixed — guard branches in `score()` and `show()` returned nothing.** They flashed a message and `return;`ed, which gave Inertia an empty 200 and showed judges the "invalid response" modal. Every guard in `score()` now redirects to `scoring.details` with its message, and it also rejects a criteria from another pageant. `show()` now just redirects to the details page; it was unused and rendered `Scoring/Show` without `candidates`.
2. ✅ **Fixed — `changeRound`/`changeGroup` returned nothing and took any value.** Both now validate (round: 0 or one of the pageant's rounds; group: 0 or a group of the current round's criteria) and `return back()`.
3. ✅ **Decided — score weighting.** The client's rule is to **sum all the judges' scores**, which the service already does. With 5 judges, a 30-point criteria can total up to 150. Hidden scores used to be stored per admin account, so two staff entering the same hidden criteria were summed; they are now one row per criteria + candidate (see P1 #7).

### P1: wrong data or unsafe operations

4. ✅ **Fixed — judges can't see that a group is closed.** Only the active group the judge hasn't locked yet is a link on `Scoring/Details`. Every other card is an inert, dimmed `div` labelled **Closed**, and groups the judge already locked are labelled **Submitted** (`showDetails` now passes `submittedCriteriaIds`).
5. ✅ **Fixed (UI) / decided (server) — silent score changes.** `ScoringInput` shows the range ("15–30 pts", "pts" instead of `%`) and uses it as the placeholder, and the review step (#6) shows the exact values before they're locked. **Decided by the client:** the server keeps raising null or below-minimum scores to `round(percentage/2)` (asserted by `test_scoring_auto_corrects_low_scores` / `_null_scores`).
6. ✅ **Fixed — no confirmation before an irreversible lock.** "Review & Lock Scores" opens a `Modal` with a table of every candidate's scores; only **Lock Scores** in that modal posts. `alert()` is gone: empty fields are outlined red with an inline message, the first one gets focus, and a counter by the button says how many are missing. Server validation errors show in a banner above the form.
7. ✅ **Fixed — hidden scoring has no validation and no round scope.** `AdminScoringController::store` now validates like `ScoreController::store`: hidden criteria of this pageant only, candidate of this pageant, `0 ≤ score ≤ percentage`, saved in one transaction. `show()` lists only the current round's hidden criteria and the candidates selected into that round. `Admin/PageantScoring` requires a score for every candidate × hidden criteria, shows typed values when switching criteria, and reports missing/server errors inline. Hidden scores are now one row per criteria + candidate: a later entry from any admin replaces the score instead of adding a second row (`user_id` keeps whoever entered it first), and the page pre-fills from that row whoever saved it. Existing rows weren't migrated; the local database had no duplicate pairs.
8. ✅ **Fixed — reset wipes round selections too.** Split into two actions, each with a confirm modal listing exactly what it erases. **Reset Scores** (`PageantController::resetScores`) erases all judge and hidden scores only; deductions and each round's selected candidates and stage order are kept. **Reset Everything** (`resetEverything`, `pageant.reset-everything`) erases scores, deductions and round selections. Both run in a transaction, set round/group back to 0 and broadcast `ScoresReset`.
9. ✅ **Fixed — judge pages aren't scoped to the judge.** `Scoring/Index` lists only the judge's assigned pageants that aren't finished. `showDetails`, `score` and `store` share an `authorizeJudge` check (403 for a non-member).
10. ✅ **Fixed — the live scores fall back to all candidates.** `getRoundCandidateScores` returns only candidates selected into the round, round 1 included: judges can only score selected candidates in every round (`score()` uses `roundRows()->candidates`, and Select Candidate handles round 1 too), so the fallback only ever showed unscoreable rows. `PageantScores` shows an empty state with a **Select candidates for this round** link.
11. ✅ **Fixed — printing includes non-advancing candidates.** `PageantPrinting`'s filter already dropped them from round 2+, but let everyone into round 1. Each round's tables (criteria and round Total) now list only the candidates selected into that round; the Grand Total still covers everyone.

### P2: flow polish

12. ✅ **Done upstream — judge-progress view.** `PageantScores` now shows each judge as done or pending for the open group (`ScoreController::judgeProgress`, counted across every division's round row).
13. ✅ **Done upstream — judges are routed to the active group.** On `.group.changed`, `Scoring/Details` navigates straight to the newly opened group.
14. ✅ **`ScoreController::show` now redirects to the details page.** The route can be deleted once nothing bookmarks it.
15. ✅ **Fixed — Group select offered "Group 0".** Group 0 is now labelled **Closed (no group open)**, so staff can see it pauses judging. The Round select also listed each round once per division (it mapped `pageant_rounds`, one row per division); it now lists each round number once.
16. ✅ **Fixed — Deduction column only appeared in round 1.** `PageantScores` shows the Deduction and Overall columns whenever any candidate in the current round has a non-zero deduction, and passes the same flag to `CandidateScoreList` so headings and cells stay aligned.
17. ✅ **Fixed — the `pageant.{id}` channel was public.** Every event in `app/Events` now broadcasts on `PrivateChannel('pageant.{id}')`. `routes/channels.php` admits admins and the pageant's own judges only, `usePageantChannel` joins with `Echo.private`, and `echo.js` authorizes through axios (the page has no `csrf-token` meta tag, and axios always sends the current XSRF cookie). `/broadcasting/auth` was already registered by `BroadcastServiceProvider`. Covered by `test_pageant_channel_admits_the_pageants_judges_and_admins_only`. Open pages need a hard refresh after deploying to pick up the new JS.
18. ✅ **Fixed — `getDetailedCandidateScores` ran one query per candidate.** It now loads every `candidate_criteria` row for the pageant's candidates and criteria in one `whereIn` query and groups it in memory; the output is unchanged (`test_printing_loads_every_judges_scores_in_one_query`).
19. ✅ **Deferred (2 copies).** `rankItems` is still only in `PageantScores.jsx` and `ComponentToPrint.jsx`. If a third copy appears, move it to `resources/js/Utils/`.

## 5. Impeccable audit (scoring pages)

Mode: **Operate** (judging is a timed task on tablets/phones, often in a dim venue). The audit covered `Scoring/*`, `Pageant/PageantShow`, `PageantScores`, `Admin/*`, `PageantPrinting`/`ComponentToPrint`. It was **code-level only**: the app wasn't run, so contrast and touch targets are estimated from the Tailwind classes, not measured. No PRODUCT.md/DESIGN.md exists; `/impeccable init` would capture them.

### Health score

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | `<Link><PrimaryButton>` nests a button in an anchor (PageantScores toolbar, Scoring/Index); several low-contrast labels (`text-[10px] text-gray-400`) |
| 2 | Performance | 3 | Fine at event scale. `hover:scale` on large image cards and `bg-fixed` backgrounds are janky on mobile Safari |
| 3 | Theming | 2 | No tokens; raw Tailwind hues everywhere (blue/purple/green/amber/indigo per page), with dark variants added ad hoc |
| 4 | Responsive | 2 | Score inputs work, but candidate cards are `lg:grid-cols-4` with `hover:` effects, which don't exist on the tablets judges use; the toolbar wraps into 7 mixed-color buttons |
| 5 | Implementation integrity | 2 | Detector: 10 × `ai-color-palette` (purple accents, indigo gradient); copy-pasted "stats cards" with `hover:scale-105` on 5 pages; three components all named `ScoringShow` |
| | **Total** | **11/20** | **Acceptable — significant work needed** |

**Integrity verdict: fail (mild).** The judge pages have a point of view: dark venue background, a large candidate number badge, a sticky progress bar. The admin pages, though, are interchangeable "stat card + colored button" templates, and the same purple/indigo accents carry no meaning. Most visual noise sits exactly where staff need to scan fast.

### Findings

- **[P1] Button inside link** — `PageantScores.jsx` toolbar (`<Link><PrimaryButton>` ×4), `Scoring/Index.jsx:75`. Invalid interactive nesting: two tab stops, and screen readers announce it ambiguously. Use `Link` with `PRIMARY_BUTTON_CLASSES` (already done in `PageantShow`). *→ `$impeccable harden`*
- **[P1] Primary action hidden until hover** — `Scoring/Index.jsx:75` "View Scoring" is `opacity-0 group-hover:opacity-100`, so it never appears on touch. *→ `$impeccable adapt`*
- **[P1] Status dot never pulses** — `Scoring/Index.jsx:72` compares `pageant.status === 'ongoing'`, but the model returns `'Ongoing'`. *→ `$impeccable harden`*
- **[P1] Low-contrast micro labels** — criteria labels `text-[10px] text-gray-500` on `bg-gray-50/50`, "Max: 30" in `text-gray-400`, Details card tags `text-[10px]`. These are the labels judges read most, under venue lighting. Use ≥12px at ≥4.5:1. *→ `$impeccable typeset`*
- **[P1] Range not shown, `%` suffix misleads** — `ScoringInput` shows "Max: 30" and a `%` adornment, but the value is points, and the minimum (15) is enforced silently. Show "15–30 pts". *→ `$impeccable clarify`*
- **[P1] Destructive and routine actions look alike** — the toolbar puts **Deduct** (a routine entry page) in the same red `DangerButton` as **Reset** and **End**. Separate them: navigation links, then the dangerous actions behind a menu. *→ `$impeccable distill`*
- **[P2] Judge progress counter is misleading** — "Scored 3/12" counts candidates with *any* score, so it hits 12/12 while criteria are still empty. Count completed (candidate × criteria) cells. *→ `$impeccable clarify`*
- **[P2] Motion without a reduced-motion path** — `animate-ping`, `animate-pulse`, `hover:scale-[1.03]` on cards, a rotating badge, `animate-in slide-in` on Details. None of it is gated by `motion-reduce:`. *→ `$impeccable quieter`*
- **[P2] Color without meaning** — detector: purple "Current Group"/"Pageant Type" (`Show.jsx:109`, `PageantScores.jsx:170`, `Admin/*`:104–141), indigo gradient (`PageantPrinting.jsx:122`). Pick one accent plus the semantic colors (success, danger), and make "current" one consistent treatment. *→ `$impeccable colorize`*
- **[P2] Generic headings and titles** — `<Head title="Pageant">` on both Index and PageantScores; admin pages are titled after the pageant only. Name the task ("Score Group 2 — Talent"). *→ `$impeccable clarify`*
- **[P3] Stats cards everywhere** — "Current Round / Pageant Type" cards with `hover:scale-105` sit on top of 5 pages and add nothing interactive. Fold them into one compact status line. *→ `$impeccable distill`*

### What works

- `PageantShow.jsx` is the cleanest page: shared `PRIMARY_/SECONDARY_BUTTON_CLASSES`, `aria-hidden` on icons, labelled `section`s, real empty states. Use it as the pattern for the rest.
- The judge page's sticky progress bar and big candidate-number badge suit the job.
- `ScoringInput` labels are wired to inputs (`htmlFor`/`id`), and inputs use `type="number"` with `min`/`max`, so mobile keyboards open the numpad.
- Reset/End already use a confirmation `Modal`.

### Recommended commands

1. **[P1] `$impeccable harden`** — fix the button-in-link nesting, the status casing, and the inert Details cards.
2. **[P1] `$impeccable adapt`** — make Scoring/Index and the candidate cards touch-first: no hover-only affordances, and bigger targets.
3. **[P1] `$impeccable clarify`** — score range copy, progress counter, page titles, the "Group 0" label, the reset warning.
4. **[P1] `$impeccable typeset`** — readable criteria labels and max/range text.
5. **[P2] `$impeccable distill`** — PageantScores toolbar and the repeated stat cards.
6. **[P2] `$impeccable colorize`** then **`$impeccable quieter`** — one accent, a meaningful "current" color, reduced-motion fallbacks.
7. **`$impeccable polish`** — final pass.

Run `$impeccable audit` again after fixes to see the score move.
