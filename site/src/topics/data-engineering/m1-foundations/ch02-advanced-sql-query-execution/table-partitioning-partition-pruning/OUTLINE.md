# Outline: Table partitioning and partition pruning (`de.table-partitioning-partition-pruning`)

Syllabus line: "range/list/hash partitioning, choosing keys from predicates and retention policy, plan-time vs run-time pruning, overhead of too many partitions; contrast with warehouse clustering (§6.5)."

Bridge from topic 29 (covering-partial-expression-indexes): its handoff named this topic directly — an index can now answer a query without visiting its own table at all; this topic splits the table itself, so a whole partition can be skipped before anything is ever read.

## Learning outcomes
1. Choose a partitioning strategy (range, list, or hash) based on the predicates queries actually use and a retention policy's own needs.
2. Distinguish plan-time partition pruning from run-time (execution-time) pruning, and recognize `Subplans Removed` as evidence of each.
3. Explain why dropping a partition is dramatically faster than a bulk DELETE for retention, and why too many partitions carries a real planning-time and memory cost.
4. Contrast PostgreSQL's physical partitioning with a warehouse's logical clustering, and explain why they solve a similar problem differently.

## Reel, 15 steps
1. **Hook.** The same count query, same data, same filter: without pruning, 60 partitions scanned; with pruning, 1. `fig`: 300 buffers vs. 5.
2. **Predict:** the planner already knows the filter value before the query runs. Why would it ever need to scan every partition anyway?
3. **Reveal:** range/list/hash partitioning — the partitioning method decides which predicate shape a partition's boundary can even match.
4. **Reveal:** plan-time pruning — this topic's own measured 60x fewer buffers, ~25x faster, from proving most partitions can't match before scanning starts.
5. **Predict:** the filter value isn't known until the query actually runs (a parameter, not a literal). Can pruning still happen at all?
6. **Reveal:** run-time pruning — `Subplans Removed: 59` in EXPLAIN, with the real value only available once execution began.
7. **Reveal:** this is why EXPLAIN shows two different signals for two different pruning moments — missing partitions from the plan itself (plan-time) vs. `Subplans Removed` (run-time).
8. **Predict:** a table with no filter at all still needs every partition. Is partitioning ever a cost here?
9. **Reveal:** overhead of too many partitions — this topic's own measured ~36x longer planning time and ~198x more planning buffers, from partition count alone, same data.
10. **Predict:** removing a year of old data for a retention policy — DROP a partition, or DELETE the rows?
11. **Reveal:** DROP TABLE on one partition vs. DELETE on the identical million rows — ~38x faster, and DROP avoids the VACUUM overhead DELETE leaves behind.
12. **Reveal:** choosing a partition key means choosing what a retention policy can cheaply drop, and what predicates can prune.
13. **Reveal:** contrast with warehouse clustering — sorts rows into storage blocks instead of splitting the table into separate physical objects; no DROP-a-partition retention trick, no per-partition metadata overhead.
14. **Recap.**
15. **Prove it.**

## Engagement arc
Hook (step 1, a real measured contrast) → predict (2) → four predicts total (2, 5, 8, 10) → takeaways on steps 4 (plan-time pruning), 9 (partition overhead), 11 (retention via DROP) → recap (14) → closing check (15).

## Post-notes layers
- **Internals:** constraint exclusion vs. partition pruning (the legacy inheritance method vs. declarative partitioning), quoted from the docs; the exact three moments run-time pruning can happen (initialization vs. actual execution).
- **Lab:** the exact DDL and `EXPLAIN (ANALYZE, BUFFERS)` commands for all four measurements, including the `PREPARE`/`force_generic_plan` sequence for run-time pruning.
- **Production:** PostgreSQL's own rule of thumb that a table should exceed physical memory before partitioning pays off; the "few thousand partitions" planner guidance, quoted directly.
- **Frontier:** BigQuery's clustering as one concrete alternative design, sourced and disclosed as not independently measured (no BigQuery account on this sandbox).
- **Where this goes next:** confirmed via `node scripts/next-topic.mjs de` once this topic is live.

## Concept ledger
- **Introduces:** `partition-pruning-plan-vs-run-time`, `partition-overhead`.
- **Uses:** `covering-index-include` (topic 29), `composite-index-column-order` (topic 28).
- **Declared:** `sql-select`, `sql-create-table`, `sql-drop-table`, `sql-delete`.

## Claims list (→ FACT-CHECK.md)
1. Partition pruning lets the planner prove a partition can't match a query's WHERE clause and exclude it from the plan. [PostgreSQL docs] + measured locally (60x fewer buffers, ~25x faster).
2. Partition pruning can also happen at execution time, for values not known at planning time, visible as `Subplans Removed` in EXPLAIN. [PostgreSQL docs] + measured locally (`Subplans Removed: 59` via a forced generic plan).
3. Too many partitions means longer planning time and higher memory consumption. [PostgreSQL docs] + measured locally (~36x longer planning time, ~198x more planning buffers, same data, partitioned vs. flat).
4. Dropping a partition for retention is far faster than a bulk DELETE and avoids DELETE's VACUUM overhead. [PostgreSQL docs] + measured locally (~38x faster for 1,000,000 rows).
5. BigQuery's clustering sorts rows into storage blocks instead of splitting the table into separate physical partitions. [BigQuery docs] — not independently measured (no BigQuery account on this sandbox).

## Bridge and handoff
- **Bridge:** "An index can now answer a query without visiting its own table at all, when the visibility map allows it. This topic splits the table itself, so a whole partition — not just an index range — can be skipped before anything is ever read."
- **Handoff:** set once `node scripts/next-topic.mjs de` is checked after this topic ships.

## Progress
- [x] Research, sources fetched and verified, all four measurements taken locally
- [x] examples.py written and verified
- [x] OUTLINE.md (this file)
- [ ] FACT-CHECK.md
- [ ] coverage.json
- [ ] reel.tsx / scenes.tsx
- [ ] pre-notes.md / post-notes.md / prerequisites.mdx / references.md / narration.json
- [ ] registry.ts entry
- [ ] checks, content + looks review, ship
