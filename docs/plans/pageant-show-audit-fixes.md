# Pageant Show Audit Fixes

Fix every finding from the impeccable audit of the pageant show page (`PageantController@show` → `resources/js/Pages/Pageant/PageantShow.jsx`). The full audit, with line references, is in the side-session notes (`pageant-show-audit.md`). This change is frontend only, with no backend or DB changes.

## Decisions (defaults chosen; change them during review if needed)

- **Judges on the show page are read-only.** `JudgeList` gets a `readOnly` prop. The show page passes it, so the edit and delete buttons and the edit modal aren't rendered there. Judges are managed through "Select" (`pageant.select-judges`) and the Judges page, which keeps today's behavior. On the Judges page the action buttons become always visible instead of hover-only.
- **Candidate rows are not links.** I'll remove the hover arrow and hover recolor rather than add a link, because candidates are edited from the Candidates page, not one at a time.
- **Button styles are shared by exporting class constants** from `Components/styles.js` (`PRIMARY_BUTTON_CLASSES`, `SECONDARY_BUTTON_CLASSES`) next to `INPUT_CLASSES`. `PrimaryButton`/`SecondaryButton` use the constants, so they render the same as today. The show page's `Link`s use them too. I chose this over an `as` prop because it doesn't touch the components' API.
- **`divisionsLabel` changes for every page that uses it:** three divisions read "Mr., Ms. & Hiyas", and one or two stay as today ("Mr. & Ms."). Used by PageantIndex, PageantPrinting, PageantScoring, SelectRoundCandidate, PageantDeduction and Scoring Index/Show.
- **The `TableComponent` `customHeader` fix also affects `CandidateList`**, the other `customHeader` user. It drops the extra empty `<thead>`, with no visual change.

## Design

### Shared components
- `Components/Card.jsx`: add `CardHeader({ icon: Icon, title, action, as = "h2" })` for the repeated header row (icon + title + right-side slot).
- `Components/TableComponent.jsx`: don't render the empty `<thead>` when `customHeader` is set. Add a `bare` prop that drops the wrapper's border, rounding, shadow and background, for tables inside a Card.
- `Components/styles.js`: add the button class constants. Also add `SMALL_LINK_BUTTON_CLASSES` for the card-header actions (Manage, Configure, Select): at least 32px tall, 12px text and a visible focus ring.
- `resources/css/app.css`: move the `custom-scrollbar` rules here, with dark mode via `@media (prefers-color-scheme: dark)`, because Tailwind uses `darkMode: "media"`.
- `Utils/divisions.js`: change the `divisionsLabel` join (see above).

### PageantShow.jsx
- **Heading structure:** the hero name is the page's only `h1`, and the layout header no longer repeats it. The header becomes a back link plus the trophy icon and the word "Pageant". Section titles are `h2` (via CardHeader), and stat values become `p`.
- **Hero:**
  - `min-h-48 md:min-h-64` instead of fixed heights.
  - `p-5 sm:p-8` padding and `text-2xl sm:text-3xl` for the name.
  - The image gets `alt=""` because the name is already in the text.
  - The fallback becomes a flat indigo-700 instead of the indigo/purple gradient.
  - Each division gets its own chip using `divisionOf(k).chip`.
- **Status:** map the three real values `Not yet started` / `Ongoing` / `finished` to Chip `filled` colors with readable contrast, and remove the unreachable `?? "Not started"`. The scores card says "Live Scoring" only while the pageant is ongoing, "Results" when finished, and "Scores" otherwise.
- **Contrast:** stat labels go to gray-500/600 at 12px, and the subtitle opacity becomes full-strength indigo-700/300.
- **Candidates:**
  - Group by division in `DIVISION_KEYS` order, with a small division heading per group. The heading only shows when there's more than one division.
  - Key rows by `candidate.id`.
  - Remove the false hover affordance.
  - Render the nickname only when it's set.
  - Add `loading="lazy"` to avatars.
  - Show an empty state with a link to Manage.
  - The stat tile shows the total, with a per-division breakdown when there's more than one division.
- **Rounds:**
  - Group `pageant_rounds` by `round`: one row per round, with each division's advancing count as a badge.
  - The counter reads "N rounds" using `pageant.rounds`.
  - Rename "Quota" to "Advancing".
  - Show an empty state.
- **Scroll:** apply `max-h` only at `lg:` and above so phones don't get nested scroll areas.
- **Footer:**
  - Edit Settings uses `SECONDARY_BUTTON_CLASSES`, which fixes its dark-mode text, and Print Sheets uses `PRIMARY_BUTTON_CLASSES`.
  - The section title becomes "Settings & printing", because the area holds both.
  - The footer border gets a dark-mode color that stays visible.
- Remove the inline `<style dangerouslySetInnerHTML>`.

### CriteriaList.jsx / JudgeList.jsx
- CriteriaList: pass `bare` to TableComponent so the table doesn't draw a second frame inside the Card.
- JudgeList: add the `readOnly` prop. When it's set, drop the Actions column and the edit modal. When actions are shown, make them always visible. Remove the repeated "Judge Account" line.

## Checklist

- [x] Card: add `CardHeader`
- [x] TableComponent: fix the `customHeader` thead and add `bare`
- [x] styles.js button constants; PrimaryButton/SecondaryButton use them
- [x] app.css scrollbar rules
- [x] `divisionsLabel` list join
- [x] JudgeList `readOnly` and visible actions
- [x] CriteriaList uses `bare`
- [x] PageantShow: header, hero, status, contrast
- [x] PageantShow: candidates grouped, empty state, stat breakdown
- [x] PageantShow: rounds grouped, empty state, copy
- [x] PageantShow: responsive max-h, footer, remove inline style
- [x] `vite build` passes (built to a scratch outDir so public/build was left alone); `impeccable detect` is clean on the changed files
- [ ] Manual check: pageant 8 (Hiyas) and one multi-division pageant, light and dark, at 375px and desktop (not done: no browser in this session)

## Out of scope

- Backend changes (the judge delete endpoint, candidate sort order in `Pageant::candidates()`). The show page groups candidates in JS instead.
- Other pages beyond the shared-component side effects listed above.
