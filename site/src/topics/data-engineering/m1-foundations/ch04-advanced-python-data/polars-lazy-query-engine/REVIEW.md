# Review — de.polars-lazy-query-engine

## Content review, self-review, 2026-10-23

Read cold, in order: topic 31's reel and Deep dive, then this topic's files in order (reel and
scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`), then the next syllabus line (connection pooling and database
clients).

1. **Flow.** Clean. The hook names the exact handoff topic 31 left open (pandas adopted Arrow
   dtypes onto an eager API; does Polars' lazy label actually change behavior) rather than a
   generic restatement. No concept is used before `introduces`/`uses` establishes it; the only
   `uses` dependency (`arrow-columnar-format`) is cashed in at step 7's streaming-memory
   measurement, where the earlier chapter's buffer vocabulary (projection, column-level reads)
   is assumed rather than re-taught.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, under 400 words, no links).
   Every term (DataFrame vs. query, query plan, query optimizer, row order, peak memory) is
   genuinely assumed rather than taught by this reel; "query optimizer" is explicitly framed as
   a callback to Chapter 2 rather than introduced fresh, matching the bridge's own framing.
3. **Gap hunt.** Found one real precision issue during the initial build, caught before this
   review by actually running `node scripts/check-all.mjs --skip reels,links,narration`: the
   predict step ("does collect() preserve row order?") originally sat at reel position five,
   violating the plan's "predict within the first four steps" rule (and the build's own check).
   Fixed by reordering the reel — the predict/no-implicit-order pair now sits at positions four
   and five, with common-subexpression elimination moved to position six. No other ordering,
   narration, or coverage reference needed to change as a result, since all `at.step` references
   and narration lines are matched by title/content rather than position. No other gap found
   against the syllabus line, the sources, or the expert list.
4. **Expert reader.** The out-of-core reveal (step 7) was checked specifically for the trap of
   overclaiming "out-of-core execution" (the syllabus clause) as fully solved: the step keeps
   the measured claim (today's streaming scan peaks lower on real memory) and the team's own
   disclosed gap ("proper out-of-core support ... still in flight") in two visually separate
   rows rather than blending them into one claim stronger than either source supports. The GPU
   engine step (step 8) is scoped entirely to direct quotes, with the reel and narration both
   stating plainly that nothing runs on a GPU in this sandbox — no claim is presented as locally
   measured that isn't.
5. **Engagement.** Hook (step 1) poses the real open question left by topic 31. Predict at step
   4, within the first four. Three takeaways (steps 3, 5, 7). The row-order measurement (step 5)
   functions as the "surprising number" beat — several different orders out of thirty runs of
   identical code is a genuinely counter-intuitive result for anyone used to the pre-2.0
   default. Recap (step 9) pulls every reveal into one line each. "Prove it" (step 10) is a
   genuine synthesis task: diagnosing a silent production failure (a report read by row
   position) from the row-order reveal, not a restatement of any single step.
6. **Narration teaches.** `narration-teaches.mjs` reports 0 flags; highest description overlap
   17% (step 5), well under the flagged threshold, and every line speaks in the professor's own
   voice — asking the open question before answering it (step 1), naming what a measurement
   actually rules out before stating the conclusion (step 5's "that claim is worth more than one
   run's evidence") — rather than reading `reel.tsx`'s body text. No digits, symbols or code
   names appear in any narration line; "maintain_order" is spoken as "one keyword argument" or
   "one extra keyword" throughout, and "LazyFrame"/"collect()" are spoken as "deferred query"
   and "one single final call" respectively.

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 21/21 quotes verified word for word.
- `python3 examples.py` — pass, "polars-lazy-query-engine examples: all numbers check out"
  (eager vs. lazy identical rows; real `explain()` pushdown and column-count narrowing; a
  cached `CSER` node in a real optimized plan; thirty repeated runs of an identical join under
  the default engine vs. `maintain_order`; isolated-subprocess peak-RSS measurement, streaming
  vs. eager; the GPU engine confirmed unrunnable on this sandbox).
- `node scripts/check-all.mjs --skip reels,links,narration --topic polars-lazy-query-engine` —
  pass (locked, docs, sources, build — the build's own coverage and predict-position checks
  both caught real problems during the build, both fixed, see Fixes below).
- `node scripts/narration-teaches.mjs .../polars-lazy-query-engine` — pass, 0 flags, highest
  overlap 17%, longest line 49 words (all under the 50-word limit), no digits.
- `node scripts/check-links.mjs` — pass, 0 broken links; no new blocked or title-mismatch
  warnings traced to this topic.
- `node scripts/check-all.mjs --only reels --topic polars-lazy-query-engine` — run in the
  background; result recorded in the Looks review below once it completes.

## Fixes made during this build

- **A coverage.json schema mismatch caught by the build itself**: `coverage.json` was first
  written with `sources[].items` as plain strings and `expert` as a bare array, rather than the
  real schema (`sources[].items` as `{item, at}` objects; `expert` as `{by, date, items}`). The
  build's own coverage checker (`site/src/lib/coverage.ts`) threw on the mismatch; fixed by
  rewriting `coverage.json` to the real schema, matched against `site/src/lib/coverage.ts`'s
  type definitions directly rather than guessed from the surrounding files' shape.
- **A predict-position rule violation caught by the build's own topic-file check**: the predict
  step ("does collect() preserve row order?") originally sat at reel position five; the plan
  requires a predict within the first four steps, and the build enforces this directly. Fixed by
  reordering the reel so the predict/reveal pair moved to positions four and five, with
  common-subexpression elimination moved to position six; narration reordered to match.
- A `common_subexpression_elimination` assertion in `examples.py` was first written with a
  dead conditional branch (`r3["cached_node_in_optimized"] if False else ...`) left over from an
  earlier draft; cleaned up to a direct assertion before the first full run.

## Looks review, self-review

First `check-all.mjs --only reels --topic polars-lazy-query-engine` run genuinely failed: ten
real text collisions across desktop and phone (steps 5, 7, 8, 9, 10 — several rows whose label
or value text was too long for its column at phone width). Fixed in `scenes.tsx` by shortening
the longest labels and values on every flagged row (e.g. "streaming scan, same columns" →
"streaming scan"; "every operation spilling to disk?" / "not yet, by their own account" → "every
operation spills?" / "not yet"; "streaming memory, gpu engine" / "measured gain; sourced
frontier" → "memory, gpu" / "measured; sourced"), without changing what any row actually claims.
Re-ran twice more after incremental fixes (one row on step 9's Recap needed a second, smaller
trim after the first pass); the third run passed cleanly: "Reel smoke test passed: 1 live
reel(s) at desktop and phone sizes."

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `desktop-polars-lazy-query-engine-01.png` (Hook, desktop) — renders cleanly, the "from the
  last topic" bridge callout and the two-row visual both legible with no crowding.
- `desktop-polars-lazy-query-engine-04-q.png` (step 4, predict frame, desktop) — both answer-
  option cards render fully, no clipping.
- `desktop-polars-lazy-query-engine-07.png` (step 7, the streaming-memory honest-gap reveal,
  desktop) — the four-row comparison (full eager read / streaming scan / "everything spills to
  disk? not yet" / "today's result: real, but not the full story") renders cleanly after the
  fix, with the takeaway shown below it.
- `phone-polars-lazy-query-engine-09.png` (Recap, phone) — the fixed four-row recap renders
  cleanly with no overlap, including the shortened "memory, gpu" / "measured; sourced" row.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: the honest-gap row in step 7
  ("everything spills to disk? — not yet") makes the scoping distinction through the words
  themselves, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size, including every row fixed above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (several row orders, the honest "not yet" on out-of-core, the GPU fallback,
  the report's silent assumption in Prove it) — never decorative.
- Captions match the picture at every checked step.

No findings beyond the collisions already fixed above. `coverage.json` → `gapReview`: date
2026-10-23, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent
reviewer ran. Expert sign-off: pending.
