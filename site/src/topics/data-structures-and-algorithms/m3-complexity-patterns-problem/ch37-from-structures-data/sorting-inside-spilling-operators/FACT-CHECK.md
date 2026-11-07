# FACT-CHECK — Sorting inside spilling operators

| # | Claim | Checked against |
|---|---|---|
| 1 | PostgreSQL switched from the polyphase merge to a balanced k-way merge in PostgreSQL 15, because tape drives stopped being a scarce physical resource | `tuplesort.c` header comment, quoted word for word |
| 2 | Run generation now always uses quicksort or radix sort, not replacement selection | `tuplesort.c` header comment, quoted word for word |
| 3 | The merge prereads about `workMem/M` bytes per tape to keep the access pattern sequential | `tuplesort.c`, quoted |
| 4 | The final merge can be done on the fly, saving one write-and-reread cycle, when the caller does not need random access | `tuplesort.c`, quoted |
| 5 | A small instance (2,000 rows, budget 50) produces 40 runs and finishes in 3 merge passes at merge order 4, verified by actually simulating both and checking the final output equals a full sort | `examples.py`, `NUM_SMALL_RUNS == 40`, `passes_run == FORMULA_PASSES == 3`, `current[0] == sorted(SMALL_ROWS)` |
| 6 | At the hook's own numbers (20 million rows, a 200,000-row budget), the run count is 100 | `examples.py`, `HOOK_NUM_RUNS == 100`, computed by the same formula validated in #5 |
| 7 | With every run's buffer held open at once, the balanced merge finishes in 1 pass | `examples.py`, `HOOK_PASSES_UNLIMITED_TAPES == 1` |
| 8 | At a realistic merge order of 7, the same 100 runs take 3 passes | `examples.py`, `HOOK_PASSES_REALISTIC == 3` |
| 9 | A hash aggregation's spill partitions the overflow between `HASHAGG_MIN_PARTITIONS` (4) and `HASHAGG_MAX_PARTITIONS` (1024), sized by `HASHAGG_PARTITION_FACTOR` (1.50) | `nodeAgg.c`, quoted and reproduced in `examples.py` |
| 10 | A sort-merge join's buffered matches for one key spill past a row-count or byte-size threshold, reported as a "spill size" metric | `SortMergeJoinExec.scala`, quoted word for word |
| 11 | Spark's hash aggregation sorts its map's entries and switches to sort-based aggregation once it cannot acquire more memory | `TungstenAggregationIterator.scala`, quoted word for word |
| 12 | A key-ordered shuffle read builds an `ExternalSorter` to merge its fetched blocks | `ExternalSorter.scala`, the class itself, quoted; confirmed used this way by `TungstenAggregationIterator.scala`'s own quoted comment |
| 13 | On a skewed stream of 60,000 rows against a 400-group budget, both the hash-partitioned and sort-based spill designs see the identical 25,667 overflow rows (43%) | `examples.py`, `SPARK_OVERFLOW_ROWS == PG_ROWS_SPILLED`, measured on the same input, not asserted |
| 14 | At this example's scale, PostgreSQL's own partition-count formula saturates at the 1024 cap | `examples.py`, `PG_PARTITIONS` printed as 1024 |
| 15 | Chapter 15's "External merge sort" is not yet a live topic | `registry.ts`, grepped directly, confirmed absent at build time (2026-11-05) |

## Red-team pass

- **Are the small instance (2,000 rows) and the hook instance (20 million rows) using the same
  code, or two different implementations that happen to agree?** The same code — `examples.py`
  defines `count_merge_passes` once and calls it on both instances, after separately verifying
  that a full simulation at the small scale matches that formula exactly.
- **Does the aggregation example actually force the budget to be exceeded, or could all 3,000
  distinct customers fit?** Checked: `distinct_seen > GROUP_BUDGET` is asserted and holds
  (3,000 distinct customers against a 400-group budget).
- **Is DuckDB's external-sorting blog post, named in CHAPTER.md, quoted anywhere in this
  topic?** No — deliberately not re-fetched; documented in OUTLINE.md rather than silently
  omitted.
- **Does this topic claim PostgreSQL's real merge-order formula (`tuplesort_merge_order`,
  which depends on byte-level buffer constants) was simulated?** No — post-notes.md's
  "In production" section explicitly says it was read but not simulated, since this topic's
  model works in rows, not bytes.

## Corrections applied

None.
