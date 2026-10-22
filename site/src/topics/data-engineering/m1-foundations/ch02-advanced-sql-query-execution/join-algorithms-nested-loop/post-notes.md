## After this topic you can

- Name the three join algorithms and state which physical property (an index, existing sort order, or neither) each one needs.
- Predict which of the three a given join will prefer from its cardinalities and filter selectivity alone.
- Recognize a hash join spilling to disk from `EXPLAIN (ANALYZE)`'s own batch count, and explain why `work_mem` is the lever.
- Explain why a hash join needs an equality condition and a nested loop never does.

## Into the internals

### Block and index nested loops

This topic's own nested-loop measurement uses an index on the inner side — the ordinary case the PostgreSQL docs describe, where "column values from the current outer row can be plugged into the inner scan." A plain nested loop without any index on the inner side still exists as an option (a full re-scan of the inner table for every outer row), but it is so expensive that the planner essentially never chooses it once an index is available, which is exactly why this topic's filtered-join measurement shows nested loop winning so clearly: the index is doing almost all the work. "Block nested loop" — batching several outer rows together to amortize a re-scan of an unindexed inner table — is a real technique other databases use, but this topic's own measured examples didn't need it, since an index was always available on the inner join column.

### Grace and hybrid hash joins, and what this topic's batch count actually is

The 1→64 batch jump this topic measured is PostgreSQL's hash join partitioning its build side once it no longer fits in `work_mem` × `hash_mem_multiplier` — the general technique is called a Grace hash join (partition both sides by a hash of the join key, process one partition pair at a time) or, when one partition is kept resident in memory while the rest spill, a hybrid hash join. This topic measured the *symptom* (a batch count greater than one, and the resulting slowdown) without quoting a primary source on the partitioning algorithm's own internals, deliberately leaving the named mechanism and its skew-handling behavior to the syllabus's own later topic ("Memory budgets, spilling and grace hash join"), which is where that vocabulary is sourced properly.

### Why merge join measured as the most expensive here

This topic's own full-join measurement found merge join the slowest of the three (543.876 ms, versus 383.6 ms for hash join and 431.269 ms for nested loop). Neither `customers` nor `orders2` was already sorted on `customer_id` in a way the planner could reuse for free in this query shape, so the forced merge join plan had to pay for an explicit sort on at least one side before it could even start merging — a cost a hash join never pays, since building a hash table doesn't need any particular input order. This is this topic's own measured result on its own schema, not a claim that merge join is always the worst choice: when both sides already arrive sorted (an index already in that order, or a merge join feeding directly off another sorted operator), the sort cost disappears and merge join's lack of a memory-sized hash table becomes an advantage instead.

### The inequality predicate, in the planner's own numbers

`enable_nestloop = off` doesn't remove nested loop as an option; it reprices it, and reprices every unavailable alternative in the opposite direction. This topic observed the alternative (disallowed-but-still-considered) paths priced on the order of `1e10` rather than disappearing from the plan's internal candidate list — a concrete look at what "discourages... if there are other methods available" (the documented wording for all three `enable_*` flags) actually does under the hood: it doesn't forbid, it penalizes, and when every genuinely viable method has been penalized to nothing, the planner falls back to whichever plan is still cheapest even at an inflated price.

## In production

- A hash join's batch count in `EXPLAIN (ANALYZE)` is the direct, no-guessing signal that it spilled: 1 batch means it fit in `work_mem` (times `hash_mem_multiplier`); more than 1 means it didn't.
- Raising `work_mem` is the first lever for a hash join that's spilling, but it's a per-operation budget applied to every sort and hash table in a session — raising it globally to fix one slow query can multiply total memory use across every concurrent session, exactly as the docs warn.
- A query whose join condition is a range or any other non-equality predicate was never a hash-join or merge-join candidate in the first place; don't spend time tuning `enable_hashjoin`/`enable_mergejoin` around such a query, since neither algorithm could ever have run it.
- `enable_nestloop = off` is a diagnostic tool, not a fix: using it to confirm the planner has a cheaper alternative available is reasonable; leaving it off in production discourages nested loop everywhere, including the many small, highly selective joins (like this topic's own filtered-join example) where it's genuinely the fastest choice.

## Next

A join is decided. The same build/probe vs. sorted-input choice happens one level up, for `GROUP BY` — next: hash aggregation versus sort-based aggregation.
