# REVIEW: de.caching-persistence-checkpointing

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds on this chapter's own unified-memory-manager vocabulary (introduced in
   7.3's first topic), used but not re-taught. Introduces `spark.cache-vs-checkpoint` and
   `spark.storage-levels`, used by nothing earlier. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines action vs. transformation, lineage, storage level, eviction, and
   non-deterministic UDF — all assumed, none taught by the reel itself. Severity: none found.
3. **Gap hunt.** The one syllabus clause names several sub-parts: storage levels and
   eviction/recomputation (measured directly, claims 1-2), `cache` vs. `checkpoint`/
   `localCheckpoint` lineage (sourced-only, matching the clause's own `checkpoint` mention),
   and the two named caching hazards — memory stolen from execution (named in `coverage.json`'s
   expert list, cross-referencing the previous topic's spill) and caching a non-deterministic
   plan (measured directly, claim 3). Severity: none found.
4. **Expert reader.** `localCheckpoint`'s own local-vs-reliable trade-off, the partial-cache-
   plus-retry correctness hazard for a non-deterministic plan, LRU as the specific eviction
   policy, caching-induced spill in a sibling task, Spark's own automatic shuffle-output
   persistence, the serialized-vs-deserialized storage-level axis, replicated levels as a third
   survival strategy, `unpersist()`'s deliberate release, `checkpoint()`'s own eager
   materialization and `setCheckpointDir` precondition, and PySpark's always-Pickle
   serialization could all read as omissions if left unstated; fixed by naming each directly in
   `coverage.json`'s expert list (10 items). Severity: addressed during drafting.
5. **Engagement.** Hook poses a concrete question (the same work, run twice — remembered or
   redone?); two predicts (full topic requires ≥2), the first at step index 2 (within the first
   four, required); each predict's wrong answer is a real, tempting intuition ("caching only
   matters for I/O, not computation," "caching always protects against eviction, whatever the
   storage level"), not a strawman; three takeaways plus the recap's own restatement of both the
   trade-and-cost framing and the frozen-answer lesson.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text before
   running any check, paraphrasing each step as the professor's own framing and avoiding every
   raw number and code identifier (e.g. "remembered result" for cached data, "pushed out" for
   evicted) to satisfy the narration "speakable" check. Grepped `syllabus/data-engineering.md`
   directly for the exact clause wording before writing `coverage.json`, and copied every
   `reel.tsx` step title into `coverage.json`'s `at.step` pointers verbatim before the first
   check run.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as the chapter's earlier topics, with every `Row` label/value
pair kept to 1–3 words each side from the first draft. `node scripts/check-all.mjs --topic
caching-persistence-checkpointing --only build` needed one fix on its first run: the expert
list started at 7 items, short of the required 10 — added three more (unpersist's deliberate
release, checkpoint's own eager materialization, PySpark's always-Pickle serialization) and it
passed. A second fix: one takeaway (storage-level choice) ran to 24 words, over the 20-word
limit — trimmed to exactly 20 by dropping "a memory-only cache"/"a disk-backed one" down to
"memory-only"/"disk-backed." The coverage-check's own `step`/`deep` pointer matching (the
mismatch that bit topics 16 and 17) was caught proactively this time: `Checkpoint truncates
lineage` needed capital-C to match the `post-notes.md` heading exactly, fixed before the first
check run rather than after a failure.

Measuring the three claims needed two design changes during drafting, both documented in
`FACT-CHECK.md`'s own Abandoned approaches: claim 1's first attempt used `count()`, which the
optimizer can satisfy without ever running the UDF column at all (column pruning) — switched to
`agg(sum("h"))`, which can't be pruned away. Claim 2's first attempt used a constant literal
column (`lit("x" * 2000)`) to inflate cached size, which Spark's optimizer constant-folds rather
than materializing per row — switched to a per-row-unique padded string that can't be folded,
confirmed against the Spark UI's own `/storage/rdd` REST endpoint showing real >10x growth
before concluding eviction had occurred. The same claim's first per-row UDF cost (thousands of
SHA-256 rounds at millions of rows, aiming to make the cost visible in wall-clock time too) made
the probe take several minutes per run in this sandbox — dropped the timing angle and kept only
the accumulator-based proof, which runs in seconds.

The preview server (`astro preview --port 4321`) survived from the previous topic's session,
confirmed via a plain `curl` 200 before rebuilding. `PREVIEW_HELD=1 npx astro build` +
`tests/reels.mjs`, logged straight to a file (not piped through `tail`, per the known
background-task-kill risk): passed clean on the first real attempt — `Reel smoke test passed:
1 live reel(s) at desktop and phone sizes.` — with no text-overlap or swipe failures, attributed
to planning short `Row` pairs and the step shape into `OUTLINE.md` from the start.
`npm run test:editor`, bundled unconditionally into the same `reels` check category, fails in
this cloud sandbox on a clean, untouched `main` too (confirmed independently by prior topics in
this chapter) — a known environment limitation, not caused by this topic.
