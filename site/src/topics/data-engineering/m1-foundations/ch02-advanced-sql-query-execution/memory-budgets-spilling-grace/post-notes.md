## After this topic you can

- State what `work_mem` actually budgets (per sort/hash operation, not per query or per session) and why `hash_mem_multiplier` gives hash-based operations more room than sort.
- Predict, from `EXPLAIN`'s own `Sort Method`/`Batches` line, whether an operator is spilling and read off how many partitions a hash join split into.
- Explain why a well-provisioned spill measured no slower here than staying in memory, and what actually got slower (too many merge/partition passes under severe under-provisioning) — a measured, not assumed, distinction.
- State why concurrent sessions multiply a workload's real memory/temp-disk footprint even though each one only ever "sees" its own `work_mem`.

## Into the internals

### The exact mechanism that doubles a hash join's batches

PostgreSQL's executor (`src/backend/executor/nodeHash.c`) handles a hash join outgrowing its budget in `ExecHashIncreaseNumBatches`: when the in-memory hash table would exceed its space, the function first checks (`ExecHashIncreaseNumBatches`'s own `ExecHashIncreaseBatchSize`) whether growing the hash table itself would use less additional memory than doubling the batch count — if so, it does that instead; only when doubling the batch count is the cheaper option does the number of batches actually double. This topic's own measurement (1, 4, 16, 32, 64, 256 batches across six `work_mem` settings, with the 1 MB → 512 kB → 256 kB step confirming an exact doubling at fine granularity) is the visible result of that choice being made repeatedly as memory shrinks. The function also checks a `growEnabled` flag before doing anything — a cutoff, not quoted in detail here since it spans a multi-line source comment that doesn't quote cleanly word for word (see `SOURCES.md`'s note on this), but present in the fetched source: past some point, PostgreSQL stops trying to grow the batch count further and accepts whatever imbalance remains, rather than partitioning forever.

### Why a frequent key gets its own bucket

The same source file branches on whether an incoming tuple is "a skew tuple" — one of the most common values PostgreSQL's planner statistics already know about — and if so inserts it into a separate, always-in-memory skew hash table rather than the ordinary batched one. Without this, a key carrying 1% of all rows (measured directly on `mem_demo.skew_key`) would get copied into whichever partition file its batch assignment landed in, and every one of those 20,000 rows would have to be written and read back from disk even though the key itself is small enough to keep in memory forever. This topic could not observe the skew optimization's effect independently through `EXPLAIN` on this PostgreSQL version — there's no separate line reporting skew-bucket hits, and no GUC to turn the optimization off for an A/B comparison — so it's reported here as a documented, sourced mechanism rather than a measured one (see `FACT-CHECK.md`'s red-team notes for exactly what was tried).

### Why the default spill measured no slower than staying in memory

The genuinely surprising result in this topic — a 4 megabyte, spilling sort finishing *faster* than a 256 megabyte, fully in-memory one, repeated twice each — is plausibly explained by external-sort literature's well-known cache-behavior tradeoff: several smaller sorted runs, each small enough to fit comfortably in CPU cache while being built, can outperform one giant in-memory quicksort over an array too large for cache at any point. This topic did not independently measure cache misses (no `perf` counters were used), so that explanation is offered here as the most likely "why," clearly separated from the measured "what": the timing difference itself is real and repeated, the cache explanation is reasoned but unverified.

## In production

- `log_temp_files` (set to `0` to log every temp file, as this topic did to watch two sessions spill at once) is the direct way to see which queries are actually spilling in a running system, rather than guessing from slow-query logs alone.
- The documentation's own advice is to reach for `hash_mem_multiplier` before blindly raising `work_mem` across the board, specifically because hash-based operations are more sensitive to memory than sort-based ones are — this topic's own measurement (batches 8 → 2 from the multiplier alone, same `work_mem`) is that advice made concrete.
- Before raising `work_mem` to "fix" a spilling query, multiply it by the number of concurrently running sessions (or worse, the number of spilling operations per session) that could plausibly run it at once — this topic's own measurement showed two sessions alone roughly doubling the real temp-disk footprint of one.
- A hash join's `Batches` line in `EXPLAIN (ANALYZE)` is the same spill signal topic 21 used for a nested-loop-vs-hash comparison and topic 22 used for a spilling `HashAggregate`: more than one batch means the operator didn't fit and had to partition.

## Next

Every mechanism in this chapter has run one row, or one batch, through a tree of operators pulled one at a time. Next: is that pull-based iteration itself a cost — and what changes when an engine runs whole batches, or compiles the plan to code, instead?
