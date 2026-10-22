# Outline: Zone maps and BRIN indexes (`de.zone-maps-brin-indexes`)

Syllabus line: "min/max summaries per block range for naturally ordered data vs B-trees; the physical-correlation requirement; the same idea as Parquet statistics and Snowflake micro-partition pruning (§6.2, §6.5)."

Bridge from topic 30 (table-partitioning-partition-pruning): its handoff named this topic directly — a partition key gives the planner an exclusion up front, declared explicitly; this topic measures a much smaller structure that learns the same kind of exclusion from a table's own physical row order instead.

## Learning outcomes
1. Explain what a BRIN index actually stores — a min/max summary per block range, not a per-row entry — and why that makes it dramatically smaller than a B-tree over the same column.
2. State the physical-correlation requirement directly, and recognize when it holds and when it doesn't, from a measured contrast on the same table.
3. Explain why a BRIN index is lossy, and what that costs when correlation breaks down.
4. Recognize the same min/max-per-block idea in Parquet statistics and Snowflake micro-partition pruning as one idea applied at a different layer.

## Reel, 15 steps
1. **Hook.** The same equality filter, same two-million-row table, same column: no index needed over fourteen thousand buffers; a tiny summary index needs fifteen. `fig`: 15 buffers vs. 10,811.
2. **Predict:** a B-tree index stores an entry for every row. Could an index that stores nothing at all per-row still work?
3. **Reveal:** what a BRIN index actually stores — a minimum and maximum value per block range, not a per-row entry.
4. **Reveal:** this topic's own measured size contrast — twenty four kilobytes vs. fourteen megabytes, for the identical column.
5. **Predict:** does this summary trick work for any column at all, or does something about the data have to be true first?
6. **Reveal:** the physical-correlation requirement — a block range's min/max is only a useful summary if that range's values are actually clustered together physically.
7. **Reveal:** this topic's own measured correlated-column contrast — fifteen buffers vs. 10,811, about 833 times faster.
8. **Predict:** the same BRIN index, but on a column whose values are scattered randomly across the table. Does it still help?
9. **Reveal:** this topic's own measured uncorrelated-column result — the BRIN index touches essentially the same number of blocks as no index at all, and ends up slightly slower.
10. **Predict:** since a block range's own summary can match a value it doesn't actually contain, what does a BRIN index have to do before trusting that range's rows?
11. **Reveal:** lossy — the executor has to recheck every row in a matching range, since the summary alone can't prove a match.
12. **Reveal:** the same idea restated — Parquet's own per-file and per-row-group statistics, min/max per chunk, read before any row is ever decoded.
13. **Reveal:** Snowflake's micro-partition metadata — the range of values per column per micro-partition, pruning on exactly the same principle.
14. **Recap.**
15. **Prove it.**

## Engagement arc
Hook (step 1, a real measured contrast) → predict (2) → four predicts total (2, 5, 8, 10) → takeaways on steps 4 (size), 7 (correlated speed), 11 (lossy recheck) → recap (14) → closing check (15).

## Post-notes layers
- **Internals:** the `pages_per_range` tradeoff, quoted directly — fewer pages per range means a more precise summary and a larger index.
- **Lab:** the exact DDL and `EXPLAIN (ANALYZE, BUFFERS)` commands for both the correlated and uncorrelated measurements, and the storage-size query.
- **Production:** autosummarization and `brin_summarize_new_values`/`brin_desummarize_range`, and why a BRIN index on a column that's supposed to stay correlated (like an append-only timestamp) needs almost no maintenance, while one on a column that gets reordered needs explicit resummarization.
- **Frontier:** Parquet row-group statistics and Snowflake micro-partition pruning as the same idea, one layer up from a single-engine index.
- **Where this goes next:** confirmed via `node scripts/next-topic.mjs de` once this topic is live.

## Concept ledger
- **Introduces:** `block-range-summary-pruning`, `physical-correlation-requirement`.
- **Uses:** `composite-index-column-order` (topic 28), `covering-index-include` (topic 29).
- **Declared:** `sql-select`, `sql-create-index`.

## Claims list (→ FACT-CHECK.md)
1. A BRIN index stores a summary (for linearly-ordered types, the minimum and maximum value) per block range, not a per-row entry. [PostgreSQL docs] + measured locally (24,576 bytes vs. 14,655,488 bytes for a B-tree on the same column).
2. BRIN indexes are most effective for columns well-correlated with physical row order. [PostgreSQL docs] + measured locally (15 buffers / 0.140 ms correlated vs. 10,811 buffers / 116.638 ms with no index — about 833 times faster).
3. BRIN indexes are lossy: the executor rechecks and discards non-matching tuples returned by a matching block range. [PostgreSQL docs] + measured locally (an uncorrelated column's BRIN index touches essentially the whole table, 10,826 buffers, and runs slower than no index at all, 200.129 ms vs. 100.469 ms).
4. The size of pages_per_range trades index size against summary precision. [PostgreSQL docs], sourced only — not independently measured (the measured examples above use the default value).
5. Snowflake micro-partitions store the range of values per column per micro-partition, and prune partitions whose range cannot match a filter. [Snowflake docs] — not independently measured (no Snowflake account on this sandbox).

## Bridge and handoff
- **Bridge:** "Plan-time pruning, run-time pruning, and partition overhead all assumed the planner is told a partition key up front. This topic measures a much smaller structure that learns the same kind of exclusion from a table's physical row order instead of its declared partitioning."
- **Handoff:** set once `node scripts/next-topic.mjs de` is checked after this topic ships.

## Progress
- [x] Research, sources fetched and verified, all three measurements taken locally
- [x] examples.py written and verified
- [x] OUTLINE.md (this file)
- [ ] FACT-CHECK.md
- [ ] coverage.json
- [ ] reel.tsx / scenes.tsx
- [ ] pre-notes.md / post-notes.md / prerequisites.mdx / references.md / narration.json
- [ ] registry.ts entry
- [ ] checks, content + looks review, ship
