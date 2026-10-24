# Review — de.arrow-columnar-memory-format

## Content review, self-review, 2026-10-23

Read cold, in order: topic 29's reel and Deep dive, then this topic's reel/scenes, narration,
post-notes, pre-notes, prerequisites, registry entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, then topic 31's syllabus line (pandas 3.0 semantics).

1. **Flow.** Clean. The hook names the exact gap topic 29 left open (two engines, same bytes,
   never asked how) rather than a generic restatement, and the handoff is topic 31's own
   bridge verbatim. No concept is used before `introduces`/`uses` establishes it; the only
   `uses` dependency (`cpython-object-model`) is cashed in directly at step 9's kernel-vs-loop
   contrast, exactly where the syllabus's own "compute kernels" clause expects it.
2. **Pre-notes.** Checked against `notes-rules.ts` constraints (5 bullets, 153 words, no links).
   Every term defined there (buffer, boxed `PyObject`, null count, zero-copy, vectorized
   operation) is genuinely assumed rather than taught by this reel; none of them duplicates a
   term the reel itself defines.
3. **Gap hunt.** Found and fixed one imprecision: narration step 7 originally called the
   out-of-line reference "a pointer," which overstates what the view actually stores (a buffer
   index plus an offset, not a raw memory pointer) — reworded to "a note of which buffer the
   rest lives in." No other gap found against the syllabus clause, the sources, or the expert
   list; every expert-list item traces to a real source and a real reel step or lab measurement.
4. **Expert reader.** The run-end-vs-dictionary reveal (step 6) was checked for the
   strictly-better trap an expert would catch immediately — fixed before this review even
   started, during fact-check's red team, by measuring the real alternating-value counter-case
   rather than only showing run-end encoding's favorable case. The interchange-layer takeaway
   (step 10) is scoped to "no conversion of the input," not an unqualified zero-copy claim,
   consistent with topic 29's own finding that a query's output isn't itself a zero-copy view.
5. **Engagement.** Hook (step 1) poses a real unanswered question from the prior topic. Predict
   at step 3, within the first four. Three takeaways (steps 6, 9, 10). The alternating-value
   result in step 6 and the ~kernel-vs-loop gap in step 9 both function as the "surprising
   number" beat. Recap (step 11) pulls every reveal into one line each. "Prove it" (step 12) is
   a genuine synthesis task requiring the learner to match three differently-shaped columns to
   three different layouts, not a restatement of any single reveal.
6. **Narration teaches.** `narration-teaches.mjs` reports 0 flags; the highest description
   overlap is 18% (step 9), well under the flagged threshold, and every line speaks in the
   professor's own voice (asking the question before the reveal, correcting a specific wrong
   intuition) rather than reading `reel.tsx`'s body text.

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 31/31 quotes verified word for word.
- `python3 examples.py` — pass, "arrow-columnar-memory-format examples: all numbers check out"
  (validity-bitmap presence/absence; chunked-array/record-batch no-copy concatenation;
  dictionary vs. run-end encoding on real repeated/run-structured/alternating data; a real
  `string_view()` cast's buffer layout; a `List` array's buffer composition; a timed
  `pyarrow.compute.sum` kernel vs. an equivalent Python loop, ~35-48x across repeated runs; and
  the identical `pyarrow.Table` object queried directly by both Polars and DuckDB).
- `node scripts/check-all.mjs --skip reels,links,narration --topic arrow-columnar-memory-format`
  — pass (locked, docs, sources, build).
- `node scripts/narration-teaches.mjs .../arrow-columnar-memory-format` — pass, 0 flags, highest
  overlap 18%, longest line 48 words (all under the 50-word limit).
- `node scripts/check-links.mjs` — pass, 0 broken links; pre-existing title-mismatch/blocked
  warnings on other topics only, none from this one.
- `node scripts/check-all.mjs --only reels --topic arrow-columnar-memory-format` — run in the
  background; result recorded in the Looks review below once it completes.

## Fixes made during this build

- **A coverage-map / reel-step-title mismatch caught by the build itself**: `coverage.json`
  originally referenced step titles ("Hook", a predict step's short name, a post-notes-only
  heading) that didn't match `reel.tsx`'s actual step titles word for word, and one syllabus/
  source item pointed at a post-notes heading rather than an actual reel step. Fixed by matching
  every `at.step` reference to `reel.tsx`'s real titles exactly, and re-pointing the Parquet-
  relation item to the interchange-layer reveal, where it genuinely belongs.
- **A DuckDB SQL syntax error**: `SELECT sum(x) FROM table` fails because `table` is a reserved
  word; fixed by naming the Python variable (and the query's table reference) `shared_table`.
- **A `buffers()` length assumption**: a `List` array's own buffers are two (validity, offsets),
  but PyArrow's `.buffers()` returns the whole flattened tree, including the child array's own
  buffers (four total here). Fixed the assertion and the returned data to check the first two
  buffers explicitly rather than asserting a flat length of two.
- Three narration lines and two reel takeaways were over the build's own word limits (narration:
  50 words a line; takeaway: 20 words) — fixed by splitting lines and trimming wording, without
  changing what either one actually claims.
- One narration line overstated the string-view layout's out-of-line reference as "a pointer";
  corrected to the accurate "a note of which buffer the rest lives in" during this content
  review (finding 3 above).

## Looks review, self-review

`check-all.mjs --only reels --topic arrow-columnar-memory-format` passed: "Reel smoke test
passed: 1 live reel(s) at desktop and phone sizes." Opened a representative set of screenshots
from `site/test-results/` (the hook, both predict/question frames, the dictionary/run-end bar
comparisons, the compute-kernel bars, the interchange reveal, and prove-it, each at desktop and
phone) and judged them against `DESIGN.md`'s looks-review checklist:

- The point lands at a glance and is shown by more than brightness: the run-end-encoding step's
  three bars (plain, real-runs, alternating) make the "specialist, not strictly better" point
  visually before the caption is even read, with the alternating bar visibly *longer* than
  plain rather than merely a different color.
- Every step moves (opacity-staged rows/bars via `easeOut(seg(...))`) and lands on a final frame
  that teaches on its own, matching the kit's established pattern from prior topics.
- Nothing crowded, clipped, or small at either size; phone layout (checked on the run-end-
  encoding and interchange steps) keeps full line height and no overlap.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (the "worse than plain" alternating case, the "allocated or skipped?"
  question, "identical" on the interchange reveal) — never decorative.
- Captions match the picture at every checked step.

No findings; nothing required fixing after the build-time word-limit and coverage-mapping fixes
already made above. `coverage.json` → `gapReview`: date 2026-10-23, by "Claude (single session)",
open: [] (recorded in the committed file). All reviews in this file are self-review by the same
session that wrote the content; no independent reviewer ran. Expert sign-off: pending.

`coverage.json` → `gapReview`: date 2026-10-23, by "Claude (single session)", open: [] (recorded
in the committed file).
