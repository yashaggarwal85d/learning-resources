# Fact-check: de.caching-persistence-checkpointing

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Uncached, two actions over the same heavy-UDF DataFrame each run the UDF on every row | Measured (`examples.py`) | accumulator count doubles across two actions |
| Cached, the UDF runs once; the second action reuses the cached result exactly | Measured | accumulator count stays at the row count after the second action |
| A MEMORY_ONLY cache evicted under real memory pressure is fully recomputed on the next touch | Measured | accumulator count doubles after a same-sized filler forces eviction |
| A MEMORY_AND_DISK cache evicted the same way is read back, not recomputed | Measured | accumulator count stays unchanged after the same filler |
| A non-deterministic UDF's output disagrees across two uncached actions, and matches across every action once cached | Measured | 40/40 rows differ uncached; 0/40 differ cached |
| Without persist/cache an action may recompute an RDD from scratch; `cache()` defaults to MEMORY_ONLY, which recomputes evicted partitions, while MEMORY_AND_DISK reads them from disk instead | Sourced, Spark "RDD Programming Guide" | `sources.mjs check`, word for word |
| A storage level is a bundle of independent flags (memory, disk, deserialized, replication) | Sourced, `StorageLevel.scala` | same |
| A reliable checkpoint's RDD reads purely from checkpoint files, with no reference to its original RDD | Sourced, `ReliableCheckpointRDD.scala` | same |

## Red team

- **Is the eviction result (claim 2) really about the storage level, or just about how much
  data the filler happened to push out?** Checked directly against the Spark UI's own
  `/storage/rdd` REST endpoint before and after the filler: cached data grew by more than 10x
  in both runs, confirming the filler genuinely forced real eviction rather than fitting
  alongside the existing cache; the only variable that changed between the two runs was the
  storage level passed to `persist()`.
- **Could the "UDF runs once" result for claim 1 be an artifact of column pruning (the
  optimizer skipping a column nothing downstream needs), rather than genuine caching?** This
  exact trap was hit and fixed while designing this topic's own probes: an early version used
  `count()`, which doesn't need the UDF's output column at all, so the optimizer pruned it and
  the UDF never ran even without caching, making both branches look identical. Fixed by
  aggregating over the UDF's own output column (`sum(h)`) so the optimizer can never prune it
  away, in every version of every probe that ships in `examples.py`.
- **Does `rand()` (a built-in SQL function, not a Python UDF) show the same uncached-disagrees
  behavior as claim 3?** Checked directly: `rand()` without an explicit seed is still
  deterministic *for one fixed logical plan object*, because Spark assigns it a seed once at
  analysis time, not fresh on every action — reusing the same `DataFrame` variable for both
  actions therefore produces identical values even uncached. This topic's own claim 3
  deliberately uses a Python UDF marked `asNondeterministic()`, whose random value genuinely
  comes from Python's own `random.random()` call on every row evaluation, to get the real
  per-action disagreement the syllabus clause describes.
- **Is "memory stolen from execution" (the syllabus clause's own other named caching hazard)
  measured directly here?** No — this topic measures caching's recomputation/eviction
  behavior and its freezing of non-deterministic output directly, but the knock-on effect of
  a cache claiming memory that a concurrently-running task's own sort or aggregation then
  needs (forcing that task to spill) is named only, in `coverage.json`'s expert list,
  cross-referencing the previous topic's own spill mechanics rather than re-measuring it here.

## Abandoned approaches

The first design attempt for claim 2 (eviction) used a column of identical, constant padding
(`lit("x" * 2000)`) to inflate each cached row's apparent size. It didn't work: Spark's own
optimizer constant-folds a literal column rather than materializing it per row, so the
measured cached size via `/storage/rdd` stayed at a few megabytes regardless of row count —
nowhere near enough to force real eviction. Switched to a per-row-unique padded string
(`repeat(concat(cast(id as string), '-<seed>-'), 200)`), which cannot be constant-folded since
it depends on each row's own `id`, and which produced the expected multi-hundred-megabyte
growth, confirmed directly against the REST API before concluding eviction had actually
occurred.

An earlier version of claim 2's own workload also made the per-row UDF too expensive (several
thousand SHA-256 rounds per row at millions of rows), aiming to make eviction's cost visible
in wall-clock time as well as the accumulator count. It made the probe too slow to run
reliably in this sandbox (multiple minutes of pure CPU work per run). Dropped the timing
angle entirely and kept only the accumulator-based proof of recomputation vs. read-back, which
needs far less per-row work to demonstrate cleanly and runs in seconds.
