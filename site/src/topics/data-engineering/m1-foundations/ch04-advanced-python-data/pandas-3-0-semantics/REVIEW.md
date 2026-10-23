# Review — de.pandas-3-0-semantics

## Content review, self-review, 2026-10-23

Read cold, in order: topic 30's reel and Deep dive, then this topic's reel/scenes, narration,
post-notes, pre-notes, prerequisites, registry entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, then the next syllabus line (Polars' lazy query engine).

1. **Flow.** Clean. The hook names the exact handoff topic 30 left open (Arrow is the shared
   format; this is the first library in the chapter actually said to be built on it) rather than
   a generic restatement. No concept is used before `introduces`/`uses` establishes it; the only
   `uses` dependency (`arrow-columnar-format`) is cashed in directly at step 2 (the new default
   string dtype sitting on those buffers) and again at step 3 (its missing-value marker measured
   against the strict buffers underneath).
2. **Pre-notes.** Checked against `notes-rules.ts` constraints. Every term the pre-notes assume
   (DataFrame, Series, dtype, the old `object` catch-all) is genuinely prior knowledge, not
   re-taught by this reel; none duplicates a term the reel itself defines.
3. **Gap hunt.** Found and fixed two real gaps:
   - A wrong factual assumption, caught by actually running the assertion rather than trusting
     an earlier manual read: the new default `str` dtype and the older `string[pyarrow]` dtype
     were assumed to print the same dtype name. Measurement showed they don't — `"str"` vs.
     `"string"`. Corrected across `OUTLINE.md`, `coverage.json`, `FACT-CHECK.md`, `examples.py`,
     `reel.tsx`, `scenes.tsx`, and `narration.json`; step title changed from "two different
     'Arrow string' dtypes, same display name" to "two confusingly similar string dtypes."
   - A precision gap: the syllabus clause says the default string dtype is PyArrow-backed "when
     installed," but `reel.tsx` step 2 and `narration.json` step 2 both stated the Arrow-backing
     unconditionally. Fixed both to carry the conditional ("on an install that has them" /
     "when they're actually available").
   No other gap found against the syllabus clause, the sources, or the expert list.
4. **Expert reader.** `pd.errors.ChainedAssignmentError`'s class name is explicitly disclosed in
   `FACT-CHECK.md` and the post-notes as a direct sandbox observation, not sourced from the
   fetched whatsnew prose — an expert checking primary-source rigor would want that distinction,
   and it's already there. The NumPy-backed-vs-Arrow-backed nullable-numeric reveal (step 7) is
   scoped to the real axis (nullable-extension-or-not, not NumPy-vs-Arrow), avoiding the trap of
   implying all "Arrow-backed" dtypes share one sentinel convention — the opposite trap the
   string-dtype reveal (step 6) demonstrates on purpose.
5. **Engagement.** Hook (step 1) poses the real open question left by topic 30. Predict at
   step 3, within the first four. Three takeaways (steps 6, 7, 9). The string-dtype-vs-numeric-
   dtype contrast (steps 6–7) functions as the "surprising result" beat: two things that sound
   alike disagree, two things that sound different agree. Recap (step 10) pulls every reveal
   into one line each. "Prove it" (step 11) is a genuine synthesis task requiring the learner to
   diagnose two independent production failures (a dtype check, a chained-assignment guard) from
   this topic's reveals, not a restatement of any single one.
6. **Narration teaches.** Every line asks the question or states the surprise before the reveal,
   in the professor's own voice, rather than reading `reel.tsx`'s body text — e.g. step 6 opens
   "Here's where two things that sound like the same feature turn out not to be" before naming
   either dtype. No line exceeds the 50-word limit (step 11 was split into two lines during the
   build to fix a 55-word violation).

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 17/17 quotes verified word for word (one mangled
  code-block quote removed; the adjacent prose quote already covered the claim).
- `python3 examples.py` — pass, "pandas-3-0-semantics examples: all numbers check out" (default
  `str` dtype vs. the old `object` catch-all; the new default's sentinel vs. `string[pyarrow]`'s
  sentinel; copy-on-write confirmed via `np.shares_memory` before/after mutation; chained
  assignment's real `pd.errors.ChainedAssignmentError`; NumPy-backed `Int64` vs. Arrow-backed
  `int64[pyarrow]` sharing the identical `pd.NA` sentinel; microsecond- vs. second-resolution
  datetime inference; both pandas 2.3 migration flags measured on this install).
- `node scripts/check-all.mjs --skip reels,links,narration --topic pandas-3-0-semantics` — pass
  (locked, docs, sources, build).
- `node scripts/check-all.mjs --only reels --topic pandas-3-0-semantics` — first run genuinely
  failed: a real phone-layout text collision in the Recap scene ("strings differ, numbers
  don't" ran into "measured both ways"). Fixed in `scenes.tsx`'s `Recap` by shortening both
  strings ("strings vs numbers" / "differ, then don't"). Re-run from a clean state afterward
  (out of caution about a possible race with concurrent file edits) — passed: "Reel smoke test
  passed: 1 live reel(s) at desktop and phone sizes."
- `node scripts/check-links.mjs` — pass, 0 broken links from this topic.

## Fixes made during this build

- **A wrong factual assumption, caught by running the actual assertion**: see gap hunt item 1
  above — propagated via a single verified find-and-replace across seven files.
- **A PyArrow-conditional wording gap**: see gap hunt item 2 above.
- **A real phone-layout text collision**, caught by the automated Playwright reel test, not by
  eye: see Checks run above.
- Narration step 11 and reel wording were checked against the build's own word limits; one
  55-word narration line was split into two during the build.

## Looks review, self-review

`check-all.mjs --only reels --topic pandas-3-0-semantics` passed on the second run: "Reel smoke
test passed: 1 live reel(s) at desktop and phone sizes." Opened a representative set of
screenshots from `site/test-results/` and judged them against `DESIGN.md`'s looks-review
checklist:

- `phone-pandas-3-0-semantics-10.png` (Recap, phone) — the fixed row ("strings vs numbers" /
  "differ, then don't") now renders cleanly with no text collision.
- `desktop-pandas-3-0-semantics-06.png` (step 6, "Reveal: two confusingly similar string
  dtypes," desktop) — the three-row comparison (`"str"` vs. `"string"` dtype names, plus
  "missing markers / also different") renders cleanly, takeaway shown below it.
- `desktop-pandas-3-0-semantics-03-q.png` (step 3, predict frame, desktop) — both answer-option
  cards render cleanly, no clipping.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: the string-dtype-vs-numeric-
  dtype contrast (steps 6–7) makes the "sounds alike, isn't / sounds different, is" point
  through the row labels and values themselves, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own, matching the kit's established pattern from prior topics.
- Nothing crowded, clipped, or small at either size, including the Recap row fixed above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  corrected value (the loose sentinel kept on purpose, the differing dtype names, the "differ,
  then don't" recap line) — never decorative.
- Captions match the picture at every checked step.

No findings beyond the collision already fixed above. `coverage.json` → `gapReview`: date
2026-10-23, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent
reviewer ran. Expert sign-off: pending.
