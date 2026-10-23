# Review — de.semantic-metrics-layers

## Content summary

13 steps covering what a semantic layer does (compiling one metric definition to SQL
consistently regardless of grain), entities as declared join keys, the DRY principle as
MetricFlow's own stated design rationale, the time spine as a required declared structure
(not an assumption), and this layer's place among other tools and its own open-sourcing/rename
history. Three predicts (first at step 3, within the first four), three reveals carrying
takeaways, a genuinely new "Prove it" scenario (regrouping an existing ratio metric by a
different dimension with no redefinition).

This topic has a real hands-on lab (`lab/mf_shop/`, `examples.py`), unlike topics 20–22 in this
chapter. MetricFlow was installed in an isolated virtualenv, a dbt project was built over a
synthetic star schema, and `mf query` was run by hand to compile one declared metric to two
different SQL queries at two different grains — both cross-checked against an independently
written plain-SQL aggregate in `examples.py`. The time-spine requirement and the ratio-metric
numerator/denominator convention were both discovered as real build failures during this lab,
not read off the documentation and taken on faith.

## Sources

MetricFlow's own docs ("About MetricFlow", "MetricFlow time spine"), dbt Labs' own
open-sourcing announcement, and the Apache Ossie (incubating) project homepage — 12 quotes
total, verified word for word (`node scripts/sources.mjs check`, 0 problems). The Open Semantic
Interchange spec's rename to Apache Ossie, discovered during research, is disclosed explicitly
(`SOURCES.md`, `coverage.json`), the same version/name-drift discipline used in the previous
topic for ODCS's own version bump.

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 5, 8, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, highest overlap 29%, longest line 50 words).
- No literal digits appear in `reel.tsx`'s rendered content; `examples.py`'s lab numbers (row
  counts, dollar totals) are cross-checked against an independently written aggregate rather
  than merely asserted.

## Fixes made during this build

- `pip install dbt-metricflow` failed system-wide against this environment's newer setuptools
  (a `halo` wheel build failure). Fixed by installing into an isolated venv with
  `setuptools<70` pinned — documented in `lab/README.md`.
- MetricFlow's ratio-metric YAML initially referenced measure names directly in
  `numerator`/`denominator`; the actual parser rejected this ("the metric `order_amount` does
  not exist") — fixed by referencing the metric names instead (`{name: revenue}`).
- `dbt parse` failed with "the semantic layer requires a time spine model... but none was
  found" until a dedicated `metricflow_time_spine.sql` model and `_time_spine.yml` were added —
  this became genuine lesson content (steps 9–10) rather than just a build obstacle.
- `mf query` could not find the `mf_shop` profile despite a correct `~/.dbt/profiles.yml` until
  `DBT_PROFILES_DIR` was set explicitly — documented in `lab/README.md`.
- `examples.py` initially compared dates with `str(row[0]) == "2026-01-01"`, which never matched
  because DuckDB returns `datetime` objects with a time component in their string form — fixed
  with `.strftime("%Y-%m-%d")`.
- Narration step 11 (the "other tools" reveal) was initially one 51-word line — fixed by
  splitting it into two lines within the same step, matching the fix pattern used for topics 20
  and 21 in this chapter.
- No coverage or takeaway-count fixes were needed — `coverage.json` was written with 10 expert
  items and `at.step` values copied from the final `reel.tsx` titles from the start.

## Checks run

- `node scripts/sources.mjs check` — 12/12 quotes verified word for word.
- `python3 examples.py` — pass, "semantic-metrics-layers examples: all numbers check out"
  (two compiled-query results cross-checked against an independent DuckDB aggregate).
- `node scripts/check-all.mjs --skip reels,links --topic semantic-metrics-layers` — pass
  (locked, docs, sources, build, narration) after the narration-line fix above.
- `node scripts/narration-teaches.mjs .../semantic-metrics-layers` — pass, all 13 steps under
  the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; this topic's own `ossie.apache.org` link is a title-mismatch
  note, not a broken link).
- `node scripts/check-all.mjs --only reels --topic semantic-metrics-layers` — pass, Playwright
  desktop and phone.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
