# Pageant Scores Page Redesign

Rework the layout and UX of the admin view-scores page (`ScoreController@viewScores` → `resources/js/Pages/Pageant/PageantScores.jsx` + `Partials/CandidateScoreList.jsx`), and fix the findings from the impeccable audit (11/20). This change is frontend only: no backend, route or DB changes.

## Context

- Used only on the admin/tabulator laptop during the live show. It isn't projected, so it's tuned for close-range scanning and safe control, not for reading from a distance.
- The page has two jobs that the current layout mixes together:
  1. **Run the show:** set the live round and group, and watch the judges' progress.
  2. **Read the results:** score tables per division.

## Decisions (agreed in review)

- **Round and group changes need confirmation.** Picking a value in the dropdown no longer saves it. A confirm modal says what will happen, then sends the existing `pageant.change-round` / `pageant.change-group` PUT. The round confirmation also says the open group closes, because `changeRound` resets `current_group` to 0. Cancelling puts the dropdown back to the live value.
- **Destructive actions go into a "More" menu.** Reset Scores, Reset Everything and End Pageant move into an overflow menu, below a divider in a red "Danger" section. Each still opens its existing confirm modal, unchanged. Summary, Score Hidden, Deduct and Select Candidates stay visible as normal buttons.
- **Logic fixes are included:**
  - **Sort survives live updates.** Sort By becomes a controlled `sortBy` state. Ranked rows are derived with `useMemo` from `candidatesByDivision` and `sortBy`, so a realtime `router.reload` re-sorts by the current choice instead of falling back to "order".
  - **Rank always means overall score rank** (by `total`, keeping today's fractional tie rule, e.g. 1.5). Sorting only changes row order; it no longer changes the rank number.

## Design

### Layout (top to bottom)

1. **Header:** pageant name and a status chip (Not started / Ongoing / Finished). The tab title becomes `"{pageant} · Scores"`.
2. **Live control panel**, a single Card:
   - Left side: what's live now, shown as text with names. For example, "Round: *Swimsuit* · Group 2 open", or "Judging closed".
   - Next to it: the Round and Group selects. Each is properly labeled (`htmlFor`/`id`) and has a confirmation step.
   - Right side: judge progress ("3 / 5 submitted") with the per-judge chips. Done/pending keep both text and an icon, and the pulse respects `motion-reduce`.
   - This panel replaces the three stat cards. "Total Rounds" is dropped, and "Current Round" now shows the round's name instead of a number.
3. **Results toolbar:**
   - Sort By on the left, using a real `<label>` (this is a view setting, not a live control).
   - Action links on the right: Select Candidates, Score Hidden, Deduct, Summary, and the "More" menu.
   - The links use `PRIMARY_BUTTON_CLASSES` / `SECONDARY_BUTTON_CLASSES` directly on the `<Link>`, which removes the `<a><button>` nesting. Only one action is primary: Summary. Deduct is no longer red, because it isn't destructive.
4. **Division tables:**
   - One section per division, with an `h3` heading that keeps the division color bar.
   - Each heading shows a candidate count.
   - Sections are spaced consistently (`space-y-8`). The stray `<hr>` and the card-inside-card nesting are removed.

### Table (CandidateScoreList)

- The name column is sticky (`sticky left-0`, with a solid background), so it stays visible when there are many criteria.
- Headers:
  - Each criterion header shows the name on one line and the weight as a muted `30%` below it.
  - Hidden (staff-scored) criteria get a small "Staff" tag.
  - Header cells get `scope="col"`. This is done inside the page's own header row, so `TableComponent` doesn't change for other pages.
- Score cells use `tabular-nums` and are right-aligned so columns line up. Total and Overall are bold.
- Rank:
  - The badge keeps gold/silver/bronze for 1 to 3, plus an `aria-label`.
  - The top row's background tint stays, but it's based on the real rank 1, not on the current sort.
- Hover zoom on avatars is removed. The decorative SVGs get `aria-hidden`.

### Overflow menu

- Built on `@headlessui/react` `Menu`, which is already a dependency. The existing `Dropdown` has a click-only `div` trigger and supports links only, and it's used by the nav, so I'm not changing it.
- The menu lives in a new `Partials/ScoreActionsMenu.jsx`. It handles keyboard use, focus and Escape on its own.

## Files

- `resources/js/Pages/Pageant/PageantScores.jsx`: restructure the page; add the controlled sort, the derived ranking and the round/group confirm modals.
- `resources/js/Pages/Pageant/Partials/CandidateScoreList.jsx`: table changes as described above.
- `resources/js/Pages/Pageant/Partials/ScoreActionsMenu.jsx` (new): the More menu.
- `resources/js/Pages/Pageant/Partials/LiveControlPanel.jsx` (new): the round/group selects, confirmations and judge progress. This keeps `PageantScores.jsx` focused on layout and results.

## Checklist

- [x] Ranking: move `rankItems` into a derived `useMemo`, add the controlled `sortBy`, and make rank always come from `total`
- [x] `LiveControlPanel`: live summary, labeled selects, confirm modals for round and group, judge progress
- [x] `ScoreActionsMenu`: headless UI Menu with the danger section wired to the existing reset/end modals
- [x] Page layout: header with status chip, results toolbar, Link-styled actions, division sections, tab title
- [x] `CandidateScoreList`: sticky name column, header weight/Staff tag, `scope`, `tabular-nums`, rank aria, remove hover zoom
- [x] Run the impeccable detector on the changed files and `npm run build`
- [x] Check in the browser at 1280 wide, in light and dark mode (1440 and 768 not checked)
