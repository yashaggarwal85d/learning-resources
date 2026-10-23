# Review — de.incremental-models-snapshots-dbt

## Content summary

13 steps covering what makes a dbt run incremental (`is_incremental()`), four real incremental
strategies run against the same fact table (append, delete+insert, merge, microbatch) plus a
fifth (`insert_overwrite`) this project's own DuckDB adapter cannot run at all, a real missed
late-arriving correction that no lookback window could have caught, a real three-stage
schema-change demonstration (ignore → silent drop; append_new_columns → NULL backfill;
full-refresh → real backfill), and snapshots as dbt's own automatic SCD2, with a real divergence
between the timestamp and check strategies' own `dbt_valid_from` values, tied back to topic 13's
own hand-built SCD2 mechanism. Three predicts (first at step 3), three reveals carrying
takeaways, and a closing "Prove it" scenario combining this topic's own two real findings
(append's limits, the missed-correction result) into a genuinely new case.

This topic extends topic 24's own real hands-on dbt-core project (`lab/shop_dbt/`, `examples.py`)
rather than starting fresh, per CHAPTER.md's own scope line. Every strategy, the schema-change
demonstration, and both snapshot strategies were actually built and run against a local DuckDB
target, not merely described from the docs.

## Sources

dbt's own current documentation (configure incremental models, about incremental strategy, about
microbatch incremental models, add snapshots to your DAG) — 15 quotes total, verified word for
word (`node scripts/sources.mjs check`, 0 problems). Plus a disclosure section noting
`insert_overwrite`'s unsupported status on this adapter, confirmed by reading the installed
`dbt-adapters` package's own source rather than assumed from the docs.

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 5, 6, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps under the flag threshold after two steps were rewritten; highest overlap 21%, longest
  line 46 words).
- No literal digits appear in `reel.tsx`'s rendered content (only `duration` float fields).
  `examples.py`'s findings (the missed correction, the three schema-change stages, the diverging
  snapshot timestamps) are cross-checked against the real dbt build's own output, not merely
  asserted.

## Fixes made during this build

- `dbt seed` failed with a CSV-sniffer column-count mismatch after a `channel` column was added
  to `raw_orders.csv` without `--full-refresh` — fixed by re-seeding with `--full-refresh`.
- Changing an order's status to `'shipped'` broke the existing `accepted_values` data test — fixed
  by adding `'shipped'` to the allowed values.
- The dbt-native unit test's fabricated `given` rows needed the new `updated_at`/`channel` columns
  added once `stg_orders` gained them, or the unit test itself broke on schema mismatch.
- The schema-change demo (`fct_orders_schema_demo`) kept failing with a missing-column error even
  with `on_schema_change='append_new_columns'` set — the real cause was that `stg_orders`, a
  DuckDB *view*, had never been rebuilt after its `.sql` file was edited to add `channel` (a view
  does not auto-refresh from a file edit). Fixed by running `dbt run --select stg_orders` first,
  after which the real three-stage behavior demonstrated correctly.
- Narration step 7 and step 11 (recap) initially spoke their step's own description sentence
  nearly verbatim (`narration-teaches.mjs` flagged both in the build's own check) — rewritten as
  the professor's own explanation instead of a restatement.
- Narration step 10 had 46% description overlap (restating the body almost word for word) — fixed
  with a rewrite that gives the actual reasoning (check-strategy's fragility to column renames vs
  timestamp-strategy's narrower dependency) instead of repeating the claim.
- One narration line (step 11, after its first rewrite) was 53 words, over the 50-word limit —
  split into two lines.
- Two `reel.tsx` takeaways (steps 5 and 6) exceeded the twenty-word limit — shortened both without
  changing their claim.

## Checks run

- `node scripts/sources.mjs check` — 15/15 quotes verified word for word.
- `python3 examples.py` — pass, "incremental-models-snapshots-dbt examples: all numbers check
  out" (late-arriving correction, schema-change stages, and snapshot-strategy divergence all
  cross-checked against plain DuckDB, independent of the dbt build itself).
- `node scripts/check-all.mjs --skip reels,links --topic incremental-models-snapshots-dbt` — pass
  (locked, docs, sources, build, narration) after the fixes above.
- `node scripts/narration-teaches.mjs .../incremental-models-snapshots-dbt` — pass, all 13 steps
  under the description-overlap ceiling after the step 7/10/11 rewrites.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic incremental-models-snapshots-dbt` — pass,
  Playwright desktop and phone.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
