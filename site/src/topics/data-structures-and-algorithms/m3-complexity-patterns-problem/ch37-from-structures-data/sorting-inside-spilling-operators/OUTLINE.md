# OUTLINE — Sorting inside spilling operators

Chapter 37's second topic: the other path out of memory. Topic 117 batched by hash; this topic
spills sorted runs to disk and merges them back, inside sorts, sort-merge joins and
aggregations.

## Storyboard (12 steps)

1. Hook (word for word from CHAPTER.md's own numbers): `ORDER BY amount` over 20 million rows
   with room for 200,000; predict the run count and the merge passes if the engine can hold
   every run's read buffer open at once.
2. Run generation: quicksort over the in-memory array, verified on a small instance against a
   full sort of the same data.
3. PostgreSQL's four departures from Knuth, read from `tuplesort.c`'s own header comment: a
   balanced k-way merge (not polyphase), quicksort generation (not replacement selection),
   prereading a fair share of the budget per tape, and an on-the-fly final merge.
4. Predict: at the hook's scale, how many runs, and how many passes with every run's buffer
   held open at once versus a realistic, much smaller number of tapes?
5. Measured: 100 runs at the hook's budget; one pass with unlimited tapes, three passes with a
   small, realistic merge order — the same merge-pass formula validated on the small instance.
6. Sort-merge joins: the buffered-matches spill (Spark's two thresholds, its "spill size"
   metric) and the shuffle-read-as-external-sort (`ExternalSorter`).
7. Hash aggregation's hash-partitioned spill: PostgreSQL writes overflow groups to logical
   tapes sized by `HASHAGG_PARTITION_FACTOR`, between 4 and 1024 partitions.
8. Spark's different answer: sort the whole overflow buffer once and merge it back — a hash
   structure turning into a sort once memory ends.
9. Measured: both designs spill the identical rows on the same skewed stream; what differs is
   only how the spilled rows are organized afterward.
10. Predict/contrast: which design pays an extra sort it didn't need to pay?
11. Recap: a sort's spill path ends in the same merge kernel a hash aggregation's sort fallback
    uses — one heap or tree of losers, picking the next-smallest element.
12. Handoff to heaps (topic 119): that merge kernel, inside LSM compaction, shuffle reads and a
    bounded top-N heap.

## Concept ledger

Introduces: `external-sort-spill-path`, `spilling-hash-aggregation`, `sort-merge-join-spill`,
`sorted-run-merge-operator`.
Uses: `io-model`, `io-sort-bound` (`dsa.measuring-memory-hierarchy` and Chapter 1's own I/O
topics, confirmed live), `binary-heap` (`dsa.binary-heaps-heapify`), `k-way-merge-bound`
(`dsa.tournament-loser-trees`), `hash-join-batch-spill` (topic 117: the hash partitioning the
aggregation spill reuses).
Declared, not yet live at build time (confirmed by grep of `registry.ts`): Chapter 15's
`external-merge-sort`, `run-generation`, `replacement-selection`, `quicksort-partitioning`,
`radix-sort` — named once in post-notes.md as the textbook algorithm this topic's production
systems are a version of, not rebuilt from scratch since this topic's own run generation and
merge already demonstrate the mechanics directly.

## Changes from the chapter plan

1. **The hook's numbers (20 million rows, a 200,000-row budget) are taken directly from
   CHAPTER.md's own hook text**, not invented fresh; `examples.py` computes the run count and
   merge-pass counts from them with the same formula validated on a small, fully-simulated
   instance (2,000 rows, budget 50), so the large numbers are computed truth, not asserted.
2. **A realistic merge order of 7 is the builder's own choice** (CHAPTER.md leaves exact
   planning values to the builder) for the second, more interesting merge-pass count (3 passes
   against 1 with unlimited tapes).
3. **The aggregation example's exact sizes (60,000 rows, 3,000 distinct customers, a budget of
   400 resident groups) are the builder's own choice**, scaled so the group budget is genuinely
   exceeded and the two spill designs' identical overflow is worth reporting.
4. **DuckDB's external-sorting and external-aggregation engineering posts**, named in
   CHAPTER.md as "fetched at planning time, partly read", were not re-fetched for this build;
   the two PostgreSQL and two Spark sources already carry the structural facts this topic needs,
   and DuckDB is not quoted or claimed from in this build.
5. **Chapter 15's "External merge sort" topic was confirmed not live** in the registry at build
   time, so this topic's run-generation and merge code is its own, not borrowed.
