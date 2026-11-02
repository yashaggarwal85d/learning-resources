# REVIEW: de.dynamic-partition-pruning

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds on this chapter's own broadcast-hash-join and partition-pruning vocabulary,
   used but not re-taught; introduces `spark-dynamic-partition-pruning`, used by nothing earlier.
   Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines star join, partitioned table, broadcast hash join, `EXPLAIN FORMATTED`,
   and broadcast reuse — all assumed, none taught by the reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause names both preconditions and "how to see it in the
   plan"; all three are measured directly. The rule's own subquery-duplicate fallback for a
   non-broadcast join is named in the expert list and sourced in `post-notes.md`, disclosed
   rather than independently re-measured, since the measured example only produces the
   broadcast-reuse path. Severity: none found — disclosed, not silently assumed covered.
4. **Expert reader.** The `onlyInBroadcast` bailout, bucketing-vs-partitioning, multi-dimension
   star joins, the `reuseBroadcastOnly` config, DPP-vs-AQE's planning-time-vs-runtime timing, the
   exact-column-reference gotcha, and the wrong-partition-column case could all read as
   omissions if left unstated; fixed by naming each directly in `coverage.json`'s expert list
   (10 items). Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about how much of a partitioned table a
   selective join actually has to touch; two predicts (full topic requires ≥2), the first at
   step index 2 (within the first four, required); each predict's wrong answer is a real,
   tempting intuition ("the partition column lining up is the whole requirement," "a selective
   filter helps regardless of storage"), not a strawman; three takeaways plus the recap's own
   restatement of both preconditions and where to check them.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing rather than
   restating the body. `node scripts/check-all.mjs --topic dynamic-partition-pruning --only
   build` passed on its first run. Code identifiers spoken aloud rather than written literally
   throughout (e.g. "a formatted version of the plan" for `EXPLAIN FORMATTED`). Grepped
   `syllabus/data-engineering.md` directly for the exact clause wording before writing
   `coverage.json`, and pre-counted the expert list to 10 items before the first build-check run
   (after catching, on a first pass, that 9 fell one short — see Looks review).

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics, with every `Row` label/value
pair kept to 1–3 words each side from the first draft, after topic 14's own Playwright failures
from longer pairs. `node scripts/check-all.mjs --topic dynamic-partition-pruning --only build`
failed once, on the coverage check's own 10-item minimum (the first draft had 9 expert items) —
fixed by adding a tenth item (the exact-column-reference-matching gotcha) and re-running clean.

`PREVIEW_HELD=1 npx astro build` + `astro preview` + `tests/reels.mjs`: passed clean on the first
run — `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` — with no text-overlap
or swipe failures, confirming the shorter `Row` pairs and the "elaborate beat after each predict's
own reveal" step shape (planned into `OUTLINE.md` from the start, rather than discovered after a
failure, this time) avoid both known gotchas from topic 14.
`npm run test:editor`, bundled unconditionally into the same `reels` check category, fails in this
cloud sandbox on a clean, untouched `main` too (confirmed independently by prior topics in this
chapter) — a known environment limitation, not caused by this topic.
