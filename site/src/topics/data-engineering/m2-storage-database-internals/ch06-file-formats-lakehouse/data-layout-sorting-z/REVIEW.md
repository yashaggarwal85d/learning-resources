# Review — de.data-layout-sorting-z

## Sources
17 quotes across 4 sources (Delta liquid clustering docs, Apache Iceberg spec's Sorting
section, Databricks data-skipping docs, Apache Hudi clustering docs). All verified clean on
the first `sources.mjs check` run — no fixes needed.

## examples.py
Real 256-row, two-column (A, B ∈ 0..15) dataset laid out three real ways: arrival order (a
fixed multiplicative-hash permutation), a linear sort by (A, B), and a real Morton/Z-order via
bit interleaving. Row groups (16 per layout, group size 16) with real computed min/max bounds.
A real two-column predicate measured against each layout's groups, and a real incremental-vs-
full reclustering measurement by rows rewritten.

Domain size (16) and group size (16) were deliberately chosen so a real Z-order's groups align
to clean 4×4 boxes in (A, B) space — disclosed as a "best case" in both FACT-CHECK.md and
coverage.json's expert items, not a universal claim.

Two self-introduced bugs caught and fixed before shipping:
- `demo_predicate_pruning_measured`: an initial wrong guess asserted the arrival-order layout
  needs only 15 groups scanned; direct computation showed it needs all 16 (every group overlaps
  the predicate under a fixed hash permutation with no locality). Fixed to `== 16`.
- `demo_incremental_vs_full_reclustering`: a leftover nonsensical assert expression from
  mid-design reasoning (`assert landing_groups == {...}`) was simplified to the intended
  `assert len(landing_groups) == 1`.

Verified 3x byte-identical. Results: arrival order 16/16 groups needed, linear sort 4/16,
Z-order 1/16; incremental recluster rewrites 32 rows, full recluster rewrites 272.

## Build-check fixes
- **reel.tsx digit-provenance**: the Hook's `fig` string said "topic 18 was file size..." — a
  literal "18" with no examples.py basis. Rephrased to "last topic was file size...".
- **pre-notes.md term-bullet count**: initially 3 bullets (needs 4-14). Added two more
  (schema evolution with column IDs, copy-on-write vs merge-on-read), reaching 5.
- **narration.json leftover `"answer": null`**: a non-predict reveal step (step 5) had a stray
  `answer: null` key left over from copying a predict step's shape. Removed — `answer` is only
  valid (and only ever an array of lines) on predict steps.

## Coverage
4 syllabus clauses from CHAPTER.md's §6.3 scope text, each an exact literal substring: why
layout determines data skipping; linear sort vs space-filling curves (Z-order, Hilbert) for
multi-column predicates; Delta liquid clustering / Iceberg sort orders / Hudi clustering as the
format-level mechanisms; incremental vs full re-clustering cost. `expert.items` padded from 8
to 10 (added the predicate-alignment-is-best-case note and the `declared: []` note).

## Design notes
- Two predicts (step 2: does a single-column sort help a two-column predicate; step 6: does
  reclustering rewrite everything). Takeaways placed at steps 5, 7, 8 — none on the reel test's
  "from" step (step 3), avoiding the gotcha from topics 16/17.
- Hilbert curves are named in the predict/outline language only as the broader family Z-order
  belongs to; the topic's own measured demo is Z-order only — Hilbert is out of scope per
  FACT-CHECK.md's red-team note.
- `declared: []` matches CHAPTER.md: this topic introduces `table-data-layout-clustering` and
  uses `parquet-data-skipping` + `small-files-compaction` from earlier topics.

## Checks
- `check-all.mjs --skip reels,links,narration`: passed after the fixes above (locked 68.9s,
  docs 0.3s, sources 0.0s, build 43.5s).
- `check-all.mjs --only links,narration`: passed, 2126 links checked, 0 broken.
- `check-all.mjs --only reels`: passed on the first try — "Reel smoke test passed: 1 live
  reel(s) at desktop and phone sizes." Only the known pre-existing `test:editor` failure
  present (unrelated to this topic).
- All 11 desktop screenshots and all 11 phone screenshots (9 steps + 2 predict-wait `-q`
  variants) manually reviewed via the Read tool: no text overflow, no clipped values, correct
  Hook/Predict/Reveal/Recap rendering, correct `TallRow` label/value display on phone width.
