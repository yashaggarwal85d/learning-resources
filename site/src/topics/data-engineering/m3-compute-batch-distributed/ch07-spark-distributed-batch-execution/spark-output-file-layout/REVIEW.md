# REVIEW: de.spark-output-file-layout

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds on this chapter's own partition-sizing and AQE vocabulary (introduced
   earlier in 7.2), used but not re-taught; introduces `spark.output-file-layout`, used by
   nothing earlier. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines partition column (write-side), task, AQE, post-shuffle coalescing, and
   shuffle — all assumed, none taught by the reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause names three sub-parts (the tasks-times-partitions
   rule, `maxRecordsPerFile`, `REBALANCE` with AQE) plus an explicit deferral to §6.1/§6.3 for
   table-format write-distribution modes; all three measured sub-parts are measured directly,
   and the deferred part is disclosed, not silently assumed covered. Severity: none found.
4. **Expert reader.** The REBALANCE(n)/REBALANCE(n,col) forms, the shared advisory-size
   machinery with AQE's general coalescing, small-files' downstream metadata cost, the
   complementary (non-overlapping) failure shapes the two levers fix, the bucketing multiplier
   on the file-count rule, dynamic partition overwrite mode's independence from this rule, and
   compaction as an after-the-fact remedy versus this topic's write-time prevention could all
   read as omissions if left unstated; fixed by naming each directly in `coverage.json`'s expert
   list (10 items). Severity: addressed during drafting.
5. **Engagement.** Hook poses a concrete, visible puzzle (identical data and column, only task
   count changes, yet file count differs); two predicts (full topic requires ≥2), the first at
   step index 2 (within the first four, required); each predict's wrong answer is a real,
   tempting intuition ("the only lever for file size runs through task count," "the hint rewrites
   the plan regardless of AQE"), not a strawman; three takeaways plus the recap's own
   restatement of the rule and both levers.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing and avoiding every
   raw number and code identifier (e.g. "a write-time setting" for `maxRecordsPerFile`, "that
   hint" for `REBALANCE`) to satisfy the narration "speakable" check. Grepped
   `syllabus/data-engineering.md` directly for the exact clause wording before writing
   `coverage.json`, and pre-counted the expert list to 10 items before the first build-check run.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics, with every `Row` label/value
pair kept to 1–3 words each side from the first draft, after topic 14's own Playwright failures
from longer pairs. `node scripts/check-all.mjs --topic spark-output-file-layout --only build`
failed once, on the coverage check's own deep-dive heading match: the first draft's
`coverage.json` pointed its `deep` entry at a longer phrase ("The sourced-only half:
table-format write-distribution modes") than the actual `##` heading text in `post-notes.md`
("Table-format write-distribution modes") — the checker matches the literal `##`/`###` heading
in `post-notes.md`, not the section's `data-section` attribute. Fixed by making the `deep` string
and the heading identical, and re-running clean.

`PREVIEW_HELD=1 npx astro build` + `astro preview` (reused across topics, confirmed serving the
rebuilt `dist/` without a restart) + `tests/reels.mjs`: passed clean on the first real attempt —
`Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` — with no text-overlap or
swipe failures, attributed to planning short `Row` pairs and the step shape into `OUTLINE.md`
from the start rather than discovering either after a failure. One earlier invocation of the
same `tests/reels.mjs` command was separately killed by this session's own background-task time
limit before producing any output (an environment/orchestration artifact, not a test failure);
the re-run, logged directly to a file instead of piped through another command, completed
normally in well under a minute.
`npm run test:editor`, bundled unconditionally into the same `reels` check category, fails in
this cloud sandbox on a clean, untouched `main` too (confirmed independently by prior topics in
this chapter) — a known environment limitation, not caused by this topic.
