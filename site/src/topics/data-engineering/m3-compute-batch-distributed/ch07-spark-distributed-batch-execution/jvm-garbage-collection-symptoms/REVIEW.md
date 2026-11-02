# REVIEW: de.jvm-garbage-collection-symptoms

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds on this chapter's own unified-memory-manager and Tungsten/binary-row
   vocabulary (introduced in 7.1 and reused through 7.3), used but not re-taught. Introduces
   `spark.gc-symptoms`, used by nothing earlier. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines garbage collection, object churn, Tungsten, executor, and
   bottleneck — all assumed, none taught by the reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause names several sub-parts: GC time in the executor tab
   (read directly in this topic's own measured examples), long G1 pauses causing heartbeat
   timeouts and lost executors (sourced-only, since local mode has no separate executor
   process to lose), object-heavy RDD/UDF code vs. Tungsten binary rows (measured directly),
   and Spark 4.x on Java 17/21 and the GC choices that matter (sourced from the release notes
   and Tuning Spark docs). Severity: none found.
4. **Expert reader.** The heartbeat-timeout-to-lost-executor mechanism, serialized caching as
   the docs' own first GC fix, Eden/Survivor young-generation mechanics, repeated full GCs as
   a memory-exhaustion signal, `spark.memory.fraction`'s own interaction with GC, G1's own
   region-size tuning, Python UDF overhead living outside the JVM's GC entirely, the Spark
   UI's equivalent display of the same metric, concurrent GC time as a third category, and
   direct GC-log collection as the docs' own first diagnostic step could all read as omissions
   if left unstated; fixed by naming each directly in `coverage.json`'s expert list (10
   items). Severity: addressed during drafting.
5. **Engagement.** Hook poses a concrete comparison (the same aggregation, built two ways —
   does the JVM notice?); two predicts (full topic requires ≥2), the first at step index 2
   (within the first four, required); each predict's wrong answer is a real, tempting
   intuition ("the same work should cost the same either way," "any real, measured cost is a
   real bottleneck"), not a strawman; three takeaways plus the recap's own restatement of both
   the object-count framing and the ratio-reading lesson.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text
   before running any check, paraphrasing each step as the professor's own framing and
   avoiding every raw number and code identifier (e.g. "everyday objects" for RDD, "compact
   rows" for Tungsten binary rows) to satisfy the narration "speakable" check. Grepped
   `syllabus/data-engineering.md` directly for the exact clause wording before writing
   `coverage.json`, and copied every `reel.tsx` step title into `coverage.json`'s `at.step`
   pointers verbatim before the first check run.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics, with every `Row` label/value
pair kept to 1–3 words each side from the first draft. `node scripts/check-all.mjs --topic
jvm-garbage-collection-symptoms --only build` passed clean on its first run, including the
expert-list-needs-≥10-items check and both `coverage.json`'s `step`/`deep` pointer matches —
all copied verbatim from `reel.tsx`/`post-notes.md` before the first check run, per the
pattern that already paid off on topics 18 and 19. One takeaway (the ratio-reading one) ran to
21 words on the first draft, over the 20-word limit — trimmed by dropping a trailing clause
("not on its own") that repeated the sentence's own point.

Measuring the two claims needed one abandoned angle, documented in `FACT-CHECK.md`'s own
Abandoned approaches: a third claim attempting to show that a smaller heap increases GC time
for the identical object-heavy job produced the opposite of the expected direction in a
one-off comparison (700MB heap: 201ms GC; 1536MB heap: 355ms GC) — most likely G1's own
heap-size-dependent region/young-generation sizing rather than a real, reproducible
relationship at this job's scale. Dropped the claim entirely rather than report a misleading
result, keeping only the two measurements (RDD-vs-DataFrame GC contrast, and GC time as a
small fraction of total run time) that reproduced cleanly and consistently across runs. The
"long G1 pauses causing heartbeat timeouts and lost executors" half of the syllabus clause was
deliberately not attempted as a live measurement: `local[N]` mode has no separate executor
process for Spark to actually lose, so forcing a pause that long would only crash the single
JVM running the session rather than demonstrate the cluster-level failure and recovery the
clause describes — sourced and named in `coverage.json`'s own `deep` pointer instead.

`PREVIEW_HELD=1 npx astro build` (the preview server survived from the previous topic's
session, confirmed via a plain `curl` 200 before rebuilding) + `tests/reels.mjs`, logged
straight to a file (not piped through `tail`, per the known background-task-kill risk):
passed clean on the first real attempt — `Reel smoke test passed: 1 live reel(s) at desktop
and phone sizes.` — with no text-overlap or swipe failures, attributed to planning short `Row`
pairs and the step shape into `OUTLINE.md` from the start. `npm run test:editor`, bundled
unconditionally into the same `reels` check category, fails in this cloud sandbox on a clean,
untouched `main` too (confirmed independently by prior topics in this chapter) — a known
environment limitation, not caused by this topic.
