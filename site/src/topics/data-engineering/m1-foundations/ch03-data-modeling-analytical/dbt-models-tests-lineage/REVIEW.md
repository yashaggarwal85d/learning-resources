# Review — de.dbt-models-tests-lineage

## Content summary

13 steps covering what a dbt model actually is (a select statement dbt wraps in warehouse
DDL/DML), how `ref()` builds the dependency DAG (and how skipping it breaks that silently),
Jinja macros as reusable logic, data tests as a build-time gate rather than a dashboard, unit
tests validated against fabricated inputs in isolation, and generated docs/lineage as that same
proven graph made browsable. dbt Mesh's cross-project refs, model contracts, versions and access
levels are named and sourced directly from dbt's own documentation but deliberately not built
hands-on (per CHAPTER.md's own scope, since that needs a second project and an Enterprise plan).
Three predicts (first at step 3, within the first four), three reveals carrying takeaways, and a
"Prove it" scenario that is itself a genuinely new, independently executed build failure.

This topic has a real hands-on dbt-core project (`lab/shop_dbt/`, `examples.py`), per CHAPTER.md's
own scope line ("built hands-on against a local DuckDB target"), even though CHAPTER.md notes it
hosts no chapter Lab bullet of its own — that bullet belongs to the next topic, which continues
building on this same project. No packaging workaround was needed for `dbt-core`/`dbt-duckdb`,
unlike the previous topic's MetricFlow install.

## Sources

dbt's own documentation (SQL models, Jinja and macros, data tests, unit tests, exposures,
documentation, and four dbt Mesh governance pages) — 11 quotes total, verified word for word
(`node scripts/sources.mjs check`, 0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 5, 7, 9).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, highest overlap 22%, longest line 49 words).
- No literal digits appear in `reel.tsx`'s rendered content; `examples.py`'s lab numbers (row
  counts, dollar totals) are cross-checked against the real dbt build's own output rather than
  merely asserted.

## Fixes made during this build

- `coverage.json`'s `sources` entries initially used the wrong schema (a `title`/`url`/numeric
  `items` count instead of `source`/`items: [{item, at}]`), which crashed the build's coverage
  check ("number is not iterable") — fixed to match the schema other topics in this chapter use.
- The syllabus clause in `coverage.json` initially kept the backticks around `` `ref()` `` from
  the raw syllabus Markdown; the parsed syllabus scope strips backticks before comparison, so the
  clause didn't match until the backticks were removed.
- `reel.tsx`'s step title `"Reveal: the macro, quoted directly; the lab's own macro"` was
  initially written with a single-quoted string and an escaped apostrophe
  (`'...the lab\'s own macro'`); the coverage checker's title-extraction regex is not
  escape-aware and silently truncates at the first unescaped-looking quote, so the title read by
  the checker didn't match `coverage.json`'s reference to it. Fixed by wrapping the string in
  double quotes instead (the same fix pattern used for JSX attribute strings in earlier topics).
- `coverage.json`'s `gapReview` was missing its `date`/`by` fields.
- Narration step 5 had an `answer` field but step 5 is a reveal, not a predict — the build
  rejects an answer with no question. Fixed by folding that sentence into the step's own `lines`
  instead.
- Narration steps 11 and 13 each had one line over the fifty-word limit — fixed by splitting
  each into an additional line within the same step (the established fix pattern for this
  chapter).
- Two `reel.tsx` takeaways exceeded the twenty-word limit — shortened both without changing
  their claim.

## Checks run

- `node scripts/sources.mjs check` — 11/11 quotes verified word for word.
- `python3 examples.py` — pass, "dbt-models-tests-lineage examples: all numbers check out"
  (macro conversion, joined fact table, and aggregated mart all cross-checked against the real
  dbt build's own output; the frozen manifest DAG snapshot verified against the same build).
- `node scripts/check-all.mjs --skip reels,links --topic dbt-models-tests-lineage` — pass
  (locked, docs, sources, build, narration) after the fixes above.
- `node scripts/narration-teaches.mjs .../dbt-models-tests-lineage` — pass, all 13 steps under
  the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic dbt-models-tests-lineage` — pass, Playwright
  desktop and phone.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
