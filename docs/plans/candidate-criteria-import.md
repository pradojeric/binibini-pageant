# Candidate & Criteria Import

Let admins bulk-import a pageant's candidates and criteria from a `.csv` or `.xlsx` file. The admin uploads a file, checks a preview with errors for each row, and then confirms. Matching records are updated and new ones are created. Nothing is deleted.

## Decisions (confirmed)

- Formats: `.csv` and `.xlsx`, read with **openspout/openspout** (new Composer dependency).
- Duplicates are **upserted**:
  - Candidate key: `(pageant_id, candidate_number, gender)`, so Mr. #1 and Ms. #1 are different candidates.
  - Criteria key: `(pageant_id, name, round)`, with the name compared case-insensitively after trimming.
- **Preview first**: parse, validate and show a table. Saving happens only on confirm, all-or-nothing in one transaction.
- **Separate imports**: an Import button on the Candidates page and another on the Criteria page.
- **Downloadable templates** for each import, in both CSV and XLSX.
- Pictures are not imported. They are still added one at a time in the edit form.
- Validation matches the current forms, so `nickname` and `description` stay required.

## File format

The first row is the header. Header matching ignores case and surrounding spaces. Unknown columns are ignored and empty rows are skipped. Only the first sheet of an XLSX file is read.

**Candidates**: `candidate_number`, `last_name`, `first_name`, `middle_name`, `name_ext`, `gender`, `nickname`, `description`
- `gender` accepts the division key (`mr`, `ms`, `hiyas`) or its label (`Mr.`, `Ms.`, `Hiyas`), case-insensitive, and must be one of the pageant's `divisions`.

**Criteria**: `name`, `round`, `group`, `percentage`, `hidden_scoring`
- `hidden_scoring` accepts `1/0`, `yes/no`, `true/false`, and an empty cell means false.

## Design

### Backend

- `app/Imports/SpreadsheetReader.php`: opens an uploaded `.csv`/`.xlsx` with openspout and returns `[rowNumber => [header => value]]`, with headers normalized. Together with `app/Imports/SpreadsheetTemplate.php`, which writes the header-only template downloads, it is the only code that uses openspout.
- `app/Imports/RowImport.php`: the shared preview/commit loop. `CandidateImport` and `CriteriaImport` extend it and supply columns, rules, normalization and the match key.
- `app/Imports/CandidateImport.php` and `app/Imports/CriteriaImport.php`: each has
  - `rules(Pageant)`, the same rules as the matching controller's `store`;
  - `normalize(array $row)`, which maps the gender label to its key, parses booleans and trims values;
  - `preview(Pageant, rows)`, which returns rows with `errors` and an `action` (`create` / `update`) found by looking up the match key. It also flags duplicate keys within the file;
  - `commit(Pageant, rows)`, which validates everything again and upserts inside `DB::transaction`.
- `app/Http/Controllers/ImportController.php` (an entry point only, which validates and delegates):
  - `POST pageants/{pageant}/candidates/import/preview` and `.../criterias/import/preview`: take the file (`required|file|mimes:csv,txt,xlsx|max:2048`) and return the preview as JSON.
  - `POST pageants/{pageant}/candidates/import` and `.../criterias/import`: take the previewed `rows` array (not the file again), validate on the server again, commit, then redirect back with a flash message.
  - `GET pageants/{pageant}/candidates/import/template?format=csv|xlsx` and the criteria equivalent: stream a file that has only the header row.
- One `{type}` route set (`candidates|criterias`), named `pageants.import.preview|store|template`. Uploads are capped at 500 rows.
- Routes go in the existing admin group in `routes/web.php`, next to the `pageants.candidates` and `pageants.criterias` resources.

### Frontend

- `resources/js/Pages/Pageant/Partials/ImportModal.jsx`: one modal that both pages share. It has a file input, a preview table (with a create/update badge and row errors highlighted), Confirm (disabled while there are errors) and Cancel. It reuses the existing `Modal`, `PrimaryButton`, `SecondaryButton` and `InputError`.
- `Pages/Pageant/Candidates/Index.jsx` and `Pages/Pageant/Criterias/Index.jsx`: an "Import" button and "Download template (CSV / XLSX)" links, which open `ImportModal` with the columns and routes for that page.

### Tests (feature, using the existing test setup, which must not touch real data)

- The candidate preview flags bad gender, missing required fields, and duplicate keys within the file.
- The candidate commit creates new candidates and updates matching ones by (number, division), and it leaves Mr. #1 and Ms. #1 as separate candidates.
- A candidate commit with one invalid row saves nothing.
- The criteria preview and commit cover the same cases, using the (name, round) key.
- CSV and XLSX fixture files both parse.
- Templates download with the right headers.
- Non-admins get 403 on every import route.

## Checklist

- [x] Ask the user, then `composer require openspout/openspout`
- [x] `SpreadsheetReader`
- [x] `CandidateImport` (normalize, preview, commit)
- [x] `CriteriaImport` (normalize, preview, commit)
- [x] `ImportController` + routes + template downloads
- [x] `ImportModal.jsx`
- [x] Wire up Candidates and Criteria index pages
- [x] Feature tests + fixtures
- [x] Run tests and build (Pint not applied: the repo isn't Pint-formatted)
