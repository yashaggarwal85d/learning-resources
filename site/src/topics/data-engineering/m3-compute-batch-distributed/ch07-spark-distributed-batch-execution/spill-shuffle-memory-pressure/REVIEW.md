# REVIEW: de.spill-shuffle-memory-pressure

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds on this chapter's own unified-memory-manager and skew-diagnosis
   vocabulary (both introduced earlier in 7.1-7.3), used but not re-taught; introduces
   `spark.spill-mechanics`, used by nothing earlier. Declares `dsa.external-merge-sort`,
   not yet live. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines execution memory, external merge sort, task, skew, and shuffle
   partitions — all assumed, none taught by the reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause names several sub-parts: the spill-and-merge
   mechanism itself (deferred to DSA Ch.6 by the clause's own explicit cross-reference),
   reading the two spill metrics, and why adding memory often fails on a skewed task. The
   metrics and memory-vs-skew halves are measured directly; the external-merge-sort
   algorithm itself is disclosed as sourced-only, matching the clause's own deferral.
   Severity: none found.
4. **Expert reader.** Hash-aggregation's own inability to spill one oversized group,
   operator-specific spill thresholds (windows, sort-merge joins), the element-count forced
   spill safety valve, concurrency's role in dividing the shared pool, AQE's earlier
   intervention point, the cumulative nature of the two spill counters, grace/hybrid hash
   join's identical idea applied to a different operator, caching's deliberate-choice
   contrast, and the Spark UI's own equivalent display could all read as omissions if left
   unstated; fixed by naming each directly in `coverage.json`'s expert list (10 items).
   Severity: addressed during drafting.
5. **Engagement.** Hook poses a concrete collision (four workers, one holding far more data);
   two predicts (full topic requires ≥2), the first at step index 2 (within the first four,
   required); each predict's wrong answer is a real, tempting intuition ("the same operation
   under the same pressure should affect every worker," "four times the memory should mean
   roughly a quarter of the spill"), not a strawman; three takeaways plus the recap's own
   restatement of both the metric contrast and the memory-vs-skew lesson.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text
   before running any check, paraphrasing each step as the professor's own framing and
   avoiding every raw number and code identifier (e.g. "a worker" for task, "running short"
   for spill) to satisfy the narration "speakable" check. Grepped
   `syllabus/data-engineering.md` directly for the exact clause wording, including its own
   cross-reference to *Data Structures & Algorithms* Chapter 6, before writing
   `coverage.json`.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics, with every `Row` label/value
pair kept to 1–3 words each side from the first draft, after topic 14's own Playwright
failures from longer pairs. `node scripts/check-all.mjs --topic spill-shuffle-memory-pressure
--only build` passed on its first run — the two prior topics' own coverage-check mismatches
(a missing "and" in the clause string, and step-title punctuation mismatches between
`coverage.json` and `reel.tsx`) were caught proactively this time by re-grepping the syllabus
line and copying every step title from `reel.tsx` verbatim before the first check run, rather
than after a failure.

Measuring the memory-vs-skew claim itself needed one design change during drafting: the first
probe attempt used a non-combinable hash aggregation (`collect_list` over one huge group),
expecting a spill the same way a sort shows one, but it threw a genuine
`java.lang.OutOfMemoryError` instead — `ObjectHashAggregateExec`'s own spill fallback only
triggers on too many distinct groups, never on one oversized group alone. Documented in
`FACT-CHECK.md`'s Abandoned approaches, and fixed by switching to `sortWithinPartitions` on
the same skewed data, which genuinely spills via `UnsafeExternalSorter` — the exact source
this topic quotes.

`PREVIEW_HELD=1 npx astro build` (the preview server from the previous topic had died between
sessions, found via `curl` returning a connection-refused rather than a stale 200 — started a
fresh `astro preview --port 4321` in the background) + `tests/reels.mjs`, logged straight to a
file: passed clean on the first real attempt — `Reel smoke test passed: 1 live reel(s) at
desktop and phone sizes.` — with no text-overlap or swipe failures, attributed to planning
short `Row` pairs and the step shape into `OUTLINE.md` from the start.
`npm run test:editor`, bundled unconditionally into the same `reels` check category, fails in
this cloud sandbox on a clean, untouched `main` too (confirmed independently by prior topics
in this chapter) — a known environment limitation, not caused by this topic.
