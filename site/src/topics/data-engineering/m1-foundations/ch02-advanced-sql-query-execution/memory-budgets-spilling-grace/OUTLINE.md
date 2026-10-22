# Outline: Memory budgets, spilling and grace hash join (`de.memory-budgets-spilling-grace`)

## Learning outcomes
1. State what `work_mem` actually budgets (per sort/hash operation, not per query or per session) and why `hash_mem_multiplier` gives hash-based operations more room than sort.
2. Predict, from `EXPLAIN`'s own `Sort Method`/`Batches` line, whether an operator is spilling and read off how many partitions a hash join split into.
3. Explain *why* a well-provisioned spill is not inherently slow on this measured workload, and what actually gets slow (too many merge/partition passes under severe under-provisioning) — a measured, not assumed, distinction.
4. State why concurrent sessions multiply a workload's real memory/temp-disk footprint even though each one only ever "sees" its own `work_mem`.

## Claims list (claim → source)
1. `work_mem` sets the base budget per sort/hash operation; a query can run several at once; concurrent sessions multiply it → SOURCES.md, PostgreSQL docs §19.4 `work_mem`. Measured: two concurrent 4MB-work_mem sorts peaking at ~69MB combined temp vs. ~35MB for one.
2. Hash-based operations get `work_mem × hash_mem_multiplier` (default 2.0), more than sort gets → SOURCES.md §19.4 `hash_mem_multiplier`. Measured: batches 8→2 at `hash_mem_multiplier` 1.0→4.0, same `work_mem`.
3. A sort that doesn't fit spills to an external merge sort instead of erroring → measured (`Sort Method: external merge  Disk: …kB`).
4. Spilling itself is not what makes the default (4MB) case slow on this workload — it measured *faster* than the fully in-memory (256MB) run — but severely undersized `work_mem` (64–128kB) measurably is slower → measured, both directions.
5. A hash join that doesn't fit partitions into batches, doubling as memory shrinks (1→4→8→16→64→256 across the measured settings) → measured, and the doubling mechanism is confirmed in PostgreSQL's own `nodeHash.c` (`ExecHashIncreaseNumBatches`, read but only short single-line fragments quoted word for word per `sources.mjs`'s check).
6. PostgreSQL protects frequent ("skewed") key values from repeated spilling with a dedicated in-memory skew bucket, confirmed in `nodeHash.c`, but not independently observable through `EXPLAIN`'s own output on this version — honest gap, named rather than faked.

## Reel steps (storyboard)

1. **Hook — "The same 35 megabytes, two very different stories"**: contrast a sort that spills 35MB and comes back *faster* than staying in memory, against the same spill at a starved `work_mem` running 30% slower. `fig`: "35 MB spilled, two outcomes".
2. **Predict: does spilling to disk make a sort slower?** Options: Always / Only if work_mem is severely undersized (correct) / Never. `fig`: "2,000,000 rows, ORDER BY".
3. **Reveal: not necessarily** — 256MB (quicksort, in memory) vs. 4MB (external merge, spills 35MB): near-identical, spill is marginally *faster*. `takeaway`: "A spill that fits in a handful of merge passes isn't inherently slow — on this storage, it measured faster than staying in memory."
4. **How work_mem actually budgets**: per-operator, not per-query or per-session; a query with several sorts/hashes can use several times `work_mem`; concurrent sessions multiply it again. Mechanism step, no measurement beyond the quote.
5. **Reveal: what actually gets slow** — 128kB and 64kB: visibly slower (~1000-1090ms vs ~750-850ms), same ~35MB spilled. `takeaway`: "The cost isn't the disk write — it's how many merge passes a starved budget forces."
6. **How hash gets more room than sort**: `hash_mem_multiplier` mechanism; measured batches 8→2 at multiplier 1.0→4.0, same `work_mem`.
7. **Predict: shrink work_mem under a hash join — what happens?** Options: it errors / it still runs, split into more partitions (correct) / it ignores the setting. `fig`: "500,000-row build side".
8. **Reveal: the grace/hybrid hash join's batches** — 1 (256MB) → 4 (4MB) → 16 (1MB) → 64 (256kB) → 256 (64kB), each halving of work_mem roughly doubling the partition count. `takeaway`: "A hash join that doesn't fit doesn't fail — it partitions itself into smaller batches on disk."
9. **How a batch actually spills and recombines**: build-side rows that don't fit the current batch's slice go to a numbered partition file; so do matching probe-side rows; each partition is then joined on its own, one at a time — the mechanism `ExecHashIncreaseNumBatches` implements by doubling the file count and re-sorting tuples into it.
10. **Predict: two sessions, same work_mem, running at once — what happens to total memory used?** Options: it's shared and capped / each gets its own, so the total multiplies (correct) / PostgreSQL queues the second one.
11. **Reveal: concurrency multiplies the budget** — two concurrent 4MB sorts measured peaking at 69MB of combined temp files, each still reporting its own ~35MB spill. `takeaway`: "work_mem is a per-operation budget, not a system-wide ceiling — every concurrent spiller pays it again."
12. **Why skew needs its own protection**: a single dominant key (1% of rows here) would get re-spilled into every partition a naive hash join builds; PostgreSQL's skew optimization keeps its matching rows in a dedicated in-memory bucket instead — named and sourced from `nodeHash.c`, flagged as not independently visible in this version's `EXPLAIN` output (honest gap, in post-notes).
13. **Recap**: work_mem as a per-operator budget, hash_mem_multiplier's extra room, spilling itself vs. too-few-merge-passes, batch doubling, concurrency's multiplication.
14. **Prove it · 1 of 2**: given an `EXPLAIN` snippet's `Sort Method`/`Batches` line, name whether and how it's spilling.
15. **Prove it · 2 of 2**: given a scenario (N concurrent sessions, each work_mem W), compute the worst-case total.

## Engagement arc
Hook (surprising non-slowdown) on step 1; first predict by step 2; second surprising number at step 5 (slower only once pathological); third predict at step 7; takeaways at steps 3, 5, 8, 11; recap at 13; two Prove-it closers.

## Post-notes headings
- Internals: the exact batch-doubling algorithm (`ExecHashIncreaseNumBatches`, `ExecHashIncreaseBatchSize`'s choice between growing buckets vs. batches) and the skew-bucket mechanism, from `nodeHash.c`.
- Lab: reproduce the chapter's own "Try it" — vary `work_mem` on a real spilling query and read the batch/merge-method change off `EXPLAIN`.
- Production: `log_temp_files`, monitoring concurrent spillers, `hash_mem_multiplier` as the lever the docs themselves recommend over blindly raising `work_mem`.
- Frontier / where this goes next: recursive partitioning under adversarial skew beyond what one MCV bucket protects; the next topic's execution-model question of whether iterator-at-a-time execution is itself what makes spilling cheap to reason about here.

## Bridge / handoff
- **Bridge** (from topic 22's corrected handoff): "Every operator so far has treated a spill to disk as a fact to read off `EXPLAIN`, not a thing to explain. Next: what `work_mem` actually budgets, why a sort, a hash join and a hash aggregate all spill differently, and why concurrency multiplies the memory a workload actually needs."
- **Handoff** (to topic 38, execution models): "Every mechanism in this chapter has run one row (or one batch) through a tree of operators pulled one at a time. Next: is that pull-based iteration itself a cost — and what changes when an engine runs whole batches, or compiles the plan to code, instead?"

## Concept ledger
- **Introduces:** `work-mem-budget`, `grace-hash-join`, `hash-mem-multiplier`.
- **Uses:** `work-mem-spill` (topic 21), `hash-join` (topic 21), `hash-aggregation`/`sort-aggregation` (topic 22).
- **Declared:** `sql-select`, `group-by`.

## Pre-notes terms (planned)
`work_mem`, `temp file`, `batch` (carried from topic 21/22), `skew` (new).
