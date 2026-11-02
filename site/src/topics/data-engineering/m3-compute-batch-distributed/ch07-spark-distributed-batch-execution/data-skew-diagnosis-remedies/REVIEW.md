# REVIEW: de.data-skew-diagnosis-remedies

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's AQE vocabulary and this chapter's own
   broadcast-hash-join topic; introduces `spark-skew-diagnosis` and `spark-salting-remedy`, used
   by nothing earlier in the chapter. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines shuffle partition, task duration/shuffle-read bytes, AQE skew-join
   splitting, broadcast hash join, map-side partial aggregation, and salting — all assumed or
   named by the previous topic, none taught by this reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause lists five remedies plus the AQE-exclusion list; all
   five remedies appear, three of five with a dedicated measured worked example (AQE split,
   broadcast, salting, two-phase aggregation — four measured; isolating hot keys sourced/
   explained only, disclosed explicitly in `FACT-CHECK.md` and `coverage.json`'s expert list,
   after an attempt to independently measure it produced misleading wall-clock numbers at this
   sandbox's scale). Severity: none found — disclosed, not silently assumed covered.
4. **Expert reader.** The preserved side of an outer join and window functions, the skew factor
   config, composing isolate-and-salt, salting's cost formula, spill as a co-occurring symptom,
   the cost-gated split, the combinable/non-combinable function split, and the byte-vs-row-count
   measurement confound could all read as omissions if left unstated; fixed by naming each
   directly in `coverage.json`'s expert list (10 items). Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about what happens to the one task holding a
   disproportionate key; two predicts (full topic requires ≥2), the first at step index 2
   (within the first four, required); each predict's wrong answer is a real, tempting intuition
   ("skew-join splitting just works," "broadcasting only changes the small side"), not a
   strawman; three takeaways plus the recap's own restatement of the evidence-then-ladder
   structure and its one hard edge (never a join).
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing rather than restating
   the body — e.g. the reel's "the gap closes" becomes the narration's "watch what happens to
   that twelve-times gap," and the reel's technical "map-side partial aggregation" becomes the
   narration's "collapse early." `node scripts/check-all.mjs --topic data-skew-diagnosis-remedies
   --only build` passed on its first run for narration-teaches, after two earlier failures on
   unrelated checks (see below) were fixed first. Code identifiers spoken aloud rather than
   written literally throughout. Grepped `syllabus/data-engineering.md` directly for the exact
   clause wording before writing `coverage.json`, and pre-counted the expert list to 10 items
   before the first build-check run.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics. `node scripts/check-all.mjs
--topic data-skew-diagnosis-remedies --only build` failed twice before passing:

1. First failure: every measured figure shown in `reel.tsx` (12.2x, 1.1x, 3.2x, 2.6x, 59,
   12,750, the "10" in "well over 10x", 2.3x) had to be computed or asserted somewhere in
   `examples.py`'s own source text (QUALITY.md's "every number on screen comes from executed
   truth" check scans literal numerals in both files). Fixed by adding a short comment next to
   each relevant assertion in `examples.py` naming the exact figure used in the reel/narration,
   and by computing the skewed partition's real size in MB directly (rather than hand-writing
   "155" as an unverified guess) so the 100–200 MB bound asserted against Spark's own documented
   256 MB default is itself checked, not just quoted.
2. Second failure: four takeaways were over the 20-word limit (26–35 words each). Fixed by
   trimming each to its single essential clause, re-counted by hand before the next run.

`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`: the first run found
eleven phone-only text overlaps (steps 8, 9, 11, 12, 13) and one desktop overlap (step 12),
all from `Row` label/value pairs longer than the kit's safe 1–3-word-per-side budget — this
topic has more data-dense steps than most in the chapter (comparing two remedies' exact ratios
per step), and several `Row` pairs were drafted too long from the start. Fixed by shortening
every flagged pair to 1–3 words each side (e.g. "small side too big to fit" / "broadcast the
whole thing?" → "dim table too big" / "broadcast it all?"; "duration ratio, well over 10x" →
"ratio: over 10x") without changing any measured claim's meaning. Re-ran clean (`Reel smoke test
passed: 1 live reel(s) at desktop and phone sizes.`) on the next attempt.
`npm run test:editor`, bundled unconditionally into the same `reels` check category, fails in
this cloud sandbox on a clean, untouched `main` too (confirmed independently by prior topics in
this chapter) — a known environment limitation, not caused by this topic.
