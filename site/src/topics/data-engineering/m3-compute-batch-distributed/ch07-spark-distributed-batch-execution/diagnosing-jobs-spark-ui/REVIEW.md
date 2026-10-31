# Review: de.diagnosing-jobs-spark-ui

## Content review

`--only build` initially failed on QUALITY.md #35 (every number on screen must be computed or
asserted in `examples.py`): the reel copy cited an exact "440x" skew ratio that the script only
bounds (`>= median * 20`), not asserts as a literal value — a run-to-run-variable measurement
hardcoded as a precise number. Fixed by rewriting the copy to "hundreds of times longer"
throughout `reel.tsx`, `scenes.tsx`, and `OUTLINE.md`, matching the qualitative framing
`narration.json` already used. After that fix, `--only build` and the full `--skip reels,links`
suite (locked, docs, sources, build, narration) passed clean.

All five failure modes are genuinely measured against a real local PySpark 4.0.1 session, read
back entirely through the REST API that mirrors the Spark UI's own tables:

- **Skew** needed two iterations. The first attempt used a DataFrame `groupBy().agg(sum(udf))`
  with a skewed key, expecting the reduce-side task to carry the hot key's cost — it didn't,
  because Spark's own hash-aggregate partially aggregates on the map side before the shuffle,
  so the heavy per-row work actually ran during the map stage, which itself showed no skew
  since `spark.range`'s positional splits mixed hot- and cold-key rows evenly across every map
  partition. Switched to an RDD `groupByKey` (no combiner), which forces every row's own cost
  into the single downstream task owning its key — producing a clean, dramatic skew signature
  (one task running two to three orders of magnitude longer than its stage's own median).
- **Spill** reused the exact recipe already verified for `de.spill-shuffle-memory-pressure`
  (a skewed sort under modest driver memory), confirming the same memory-vs-disk contrast.
- **GC** reused the exact recipe already verified for `de.jvm-garbage-collection-symptoms`
  (object-heavy RDD code vs. the identical DataFrame aggregation).
- **Small files** needed a second iteration too. The first attempt compared summed per-task
  run time against the job's own wall-clock time, expecting overhead to show as "sum exceeds
  wall time" — it failed, since four cores running concurrently can rack up more summed
  task-seconds than wall-clock seconds even with zero overhead. Replaced with a direct,
  parallelism-independent comparison already in the REST API: each task's own `schedulerDelay`
  against its own `executorCpuTime`.
- **Driver bottleneck** compares a driver-side post-processing loop's own wall-clock time
  against the sum of every task's own `executorRunTime` across the whole application, showing
  a real stretch of time no stage accounts for.

The SQL tab's per-operator plan metrics and the History Server's event-log replay are sourced
and named only (`FACT-CHECK.md`'s red team explains why: both would need a longer-running setup
outside this script's own scope, consistent with this chapter's established pattern for
UI-rendering behaviors not worth a dedicated probe).

## Looks review

`reel.tsx` has 10 steps with predicts at indices 2 and 5 and 3 takeaways, none on the reel
test's own "from" step (index 3, `RevealTableConfirms`) and none immediately after a predict.
Several `Row` label/value pairs initially ran to 4-5 words on one side (e.g. "one task, rest
zero", "RDD yes, DataFrame no") and were trimmed to 1-3 words each before the build check was
even run, following the chapter's own established convention. The Playwright reel smoke test
passed on the first run at both desktop and phone sizes.
