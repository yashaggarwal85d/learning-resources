# Review — de.incremental-reads-change-feeds

## Sources
23 quotes across 5 fetched pages (Iceberg spec's row lineage section, Iceberg's Spark Queries
incremental-read section, Iceberg's Spark Procedures create_changelog_view section, Databricks'
Change Data Feed docs, Hudi's SQL Queries docs). One fix needed on first check: a reformatted
table-header quote didn't match the raw fetched text word-for-word — replaced with the exact
fetched string.

## examples.py
A from-scratch Python model implementing Iceberg v3 row lineage's actual rules directly: a
table-level `next_row_id` counter, per-row `row_id` (assigned once) and `last_updated_seq`
(reset only when a row's value is genuinely modified, carried forward unchanged otherwise). Four
demos: a pure copy-on-write rewrite leaves row lineage fields byte-identical; a real update
(1 of 10 rows changed) measured by both a naive file-diff scan (10 deletes + 10 inserts) and a
row-lineage scan (1 real change); a real compaction of two 10-row files (0 value changes)
measured the same way (40 spurious changes vs 0 real ones); and Iceberg's own plain incremental
scan (start exclusive, end inclusive, append-only), which correctly reads only the appended rows
in range and raises `ValueError` the moment a non-append snapshot falls inside that range.
Verified 3x byte-identical, no randomness or timing.

## Build-check fixes
- **coverage.json clause mismatch**: CHAPTER.md's own prose had transcribed the syllabus's
  `"what changed"` (double quotes) as `'what changed'` (single quotes). The coverage checker
  reads the actual `syllabus/data-engineering.md` line, not CHAPTER.md's paraphrase — fixed by
  copying the clause with double quotes, matching the real syllabus source exactly. New gotcha:
  always verify a coverage clause against `syllabus/*.md` directly, not just CHAPTER.md's Scope
  line, since CHAPTER.md can itself contain small transcription drift from the syllabus.
- **narration.json line over 50 words**: step 8's second line (describing Delta's and Hudi's
  mechanisms together) ran to 74 words. Split into three shorter lines.
- **Phone text overflow on steps 8 and 9**: `scenes.tsx` TallRow values with long or
  underscore-heavy tokens (`insert / update_preimage / update_postimage / delete`, `reads only
  the appended rows; raises on compaction`) ran outside the drawing on phone width even though
  word count alone looked reasonable. Fixed by shortening to shorter, no-underscore phrasing
  ("tags every change by its real kind", "reads appends; raises on a compaction"). New gotcha:
  a long underscored identifier embedded in a TallRow value is riskier for phone overflow than
  its word count suggests — prefer paraphrasing over quoting the literal token in scene values.

## Coverage
5 syllabus clauses from the real `syllabus/data-engineering.md` scope line (not CHAPTER.md's
transcription), each an exact literal substring: reading only what changed between snapshots;
Iceberg incremental scans/changelog views/v3 row lineage; Delta Change Data Feed; Hudi
incremental queries; how deletes and compaction complicate "what changed" and why downstream CDC
needs row identity. 5 sources with 18 total items; 10 expert.items.

## Design notes
- Two predicts (step 2: does a pure compaction report as zero changes or a pile of
  deletes/inserts; step 6: scaled up, does the naive scan's count grow with the rewrite).
  Takeaways at steps 5, 7, 8 — none on step 3, the reel test's "from" step.
- Delta's CDF and Hudi's `hudi_table_changes` are introduced by name and their own documented
  semantics only, not re-implemented in Python, since this sandbox has no real Delta or Hudi
  runtime and the topic's point is a shared underlying mechanism, not identical code.
- `declared: []` matches CHAPTER.md: this topic introduces `incremental-reads-change-feeds` and
  uses `table-snapshot-model` (topic 12), `deletion-vectors` (topic 15), `table-column-ids`
  (topic 16).

## Checks
- `check-all.mjs --skip reels,links,narration`: passed after the coverage-clause fix (locked
  70.4s, docs 0.2s, sources 0.0s, build 18.7s → 42.7s after fix).
- `check-all.mjs --only links,narration`: passed, 2131 links checked, 0 broken for this topic.
- `check-all.mjs --only reels`: failed once on phone text overflow (steps 8, 9), fixed, then
  passed cleanly: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." Only the
  known pre-existing `test:editor` sandbox limitation present (unrelated to this topic).
- All 10 desktop screenshots and all 10 phone screenshots (8 steps + 2 predict-wait `-q`
  variants, 12 files each) manually reviewed via the Read tool after the overflow fix: no text
  overflow, no clipped values, correct Hook/Predict/Reveal/Recap rendering on both viewports.
