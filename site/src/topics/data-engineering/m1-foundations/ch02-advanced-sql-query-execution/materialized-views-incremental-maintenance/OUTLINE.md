# Outline: Materialized views and incremental maintenance (`de.materialized-views-incremental-maintenance`)

Syllabus line: "full refresh vs incremental view maintenance, PostgreSQL REFRESH … CONCURRENTLY, warehouse incremental MVs, Snowflake dynamic tables, Databricks materialized views; which aggregates maintain incrementally, staleness bounds; frontier: DBSP and differential dataflow (→ Ch.9)."

Bridge from topic 31 (zone-maps-brin-indexes): its handoff named this topic directly — a materialized view stores a query's own result instead of recomputing it, with a staleness bound replacing the freshness any live scan always had.

## Learning outcomes
1. Distinguish a full refresh from incremental view maintenance, and explain why a full refresh's cost is insensitive to how much data actually changed.
2. Use PostgreSQL's `REFRESH MATERIALIZED VIEW CONCURRENTLY` correctly, and explain what it trades (a UNIQUE index requirement, somewhat more resource use) for not blocking concurrent reads.
3. Recognize which aggregates and query shapes maintain incrementally in a warehouse engine (Snowflake dynamic tables, Databricks materialized views) and which force a fallback to full recompute, including the floating-point non-determinism case.
4. State what a staleness bound (target lag) actually promises, and that it is a target, not a guarantee.
5. Name DBSP and differential dataflow as the frontier formalism behind general incremental view maintenance.

## Reel, 15 steps
1. **Hook.** The same ten-row change to a three-million-row table, maintained two different ways: a full refresh barely moves; an incremental update is about a hundred and eighty times cheaper. `fig`: ~994 ms (full refresh) vs. ~6 ms (incremental).
2. **Predict:** ten new rows land in a three-million-row table whose materialized view needs updating. Does a full refresh's cost shrink along with the size of that change?
3. **Reveal:** what REFRESH MATERIALIZED VIEW actually does — discards the old contents, reruns the entire defining query, keeps nothing from before.
4. **Reveal:** this topic's own measured result — a full refresh costs almost exactly the same whether ten rows changed or none did.
5. **Predict:** an incrementally maintained version of the same result only touches the rows a change actually affects. How much cheaper should that be, for a change this small?
6. **Reveal:** this topic's own measured incremental-maintenance result — about a hundred and eighty times cheaper than the full refresh, for the identical change.
7. **Predict:** a plain refresh locks out readers while it runs. Does PostgreSQL offer a way to update a materialized view without blocking the queries that read from it?
8. **Reveal:** REFRESH MATERIALIZED VIEW CONCURRENTLY — and this topic's own measured contrast: a reader blocked for most of a second during a plain refresh, versus not blocked at all during a concurrent one.
9. **Reveal:** the requirement CONCURRENTLY comes with — a UNIQUE index covering every row, no expression, no WHERE clause.
10. **Predict:** a warehouse materialized view's query sums a floating-point column. Does that still maintain incrementally?
11. **Reveal:** floating-point aggregates can produce non-deterministic results under incremental refresh and force a fallback to full recompute — cast to a fixed-precision numeric type to keep incremental refresh working.
12. **Reveal:** Snowflake dynamic tables and Databricks materialized views both choose between incremental and full refresh automatically, by cost, for exactly this kind of reason.
13. **Reveal:** a staleness bound (Snowflake's target lag) is a target the engine tries to keep, not a guarantee — actual lag can exceed it when a refresh runs long.
14. **Recap.**
15. **Prove it.**

## Engagement arc
Hook (step 1, a real measured contrast) → predict (2) → four predicts total (2, 5, 7, 10) → takeaways on steps 4 (full refresh cost is flat), 6 (incremental is far cheaper), 8 (CONCURRENTLY unblocks readers) → recap (14) → closing check (15).

## Post-notes layers
- **Internals:** DBSP and differential dataflow as the formalism generalizing trigger-style incremental maintenance to arbitrary relational operators, with a pointer to chapter 9.
- **Lab:** the exact DDL, trigger function, and timing commands for both the full-refresh and incremental-trigger measurements, plus the two-session blocking demonstration.
- **Production:** the UNIQUE index requirement for CONCURRENTLY, quoted directly; "only one REFRESH at a time" per materialized view; the floating-point-to-DECIMAL cast as a real, checkable fix for a materialized view that keeps falling back to full recompute.
- **Frontier:** DBSP/differential dataflow, and incremental systems like Feldera that implement it directly.
- **Where this goes next:** confirmed via `node scripts/next-topic.mjs de` once this topic is live.

## Concept ledger
- **Introduces:** `incremental-view-maintenance`, `staleness-bound-target-lag`.
- **Uses:** `block-range-summary-pruning` (topic 31), `composite-index-column-order` (topic 28).
- **Declared:** `sql-select`, `sql-create-index`, `sql-insert`.

## Claims list (→ FACT-CHECK.md)
1. REFRESH MATERIALIZED VIEW completely replaces the view's contents by rerunning the defining query. [PostgreSQL docs] + measured locally (a full refresh costs about the same, ~974 ms vs. ~994 ms, whether ten rows changed or none did).
2. An incrementally maintained equivalent only touches the rows a change affects, at dramatically lower cost. [Snowflake/Databricks docs on incremental refresh] + measured locally (~6 ms vs. ~994 ms, about 180 times cheaper, for the identical ten-row change).
3. Without CONCURRENTLY, a refresh can block concurrent reads; with it, reads are never blocked, at the cost of requiring a UNIQUE index covering every row. [PostgreSQL docs] + measured locally (a reader blocked ~861 ms during a plain refresh, ~5 ms — not blocked — during CONCURRENTLY, about 184 times different).
4. Floating-point aggregates (SUM, AVG, covariance) can force a fallback to full recompute under incremental refresh; casting to DECIMAL keeps incremental refresh working. [Databricks docs], sourced only — not independently measured (this sandbox's PostgreSQL has no built-in incremental-refresh materialized view feature to reproduce the fallback against).
5. A staleness bound like Snowflake's target lag is a target the engine tries to keep, not a strict guarantee. [Snowflake docs], sourced only — not independently measured (no Snowflake account on this sandbox).

## Bridge and handoff
- **Bridge:** "A block-range summary earns its tiny size only when a column is genuinely correlated with physical row order, and even then the executor still rechecks every candidate row. This topic measures what happens when a query's own result gets stored and kept up to date instead of being recomputed, with a staleness bound replacing the freshness any live scan always had."
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
