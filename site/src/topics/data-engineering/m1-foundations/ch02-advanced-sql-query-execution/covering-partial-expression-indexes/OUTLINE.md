# Outline: Covering, partial and expression indexes (`de.covering-partial-expression-indexes`)

Syllabus line: "INCLUDE columns and index-only scans (and PostgreSQL's dependence on the visibility map), partial indexes over hot subsets, expression indexes and the planner's exact-expression match requirement."

Bridge from topic 28 (composite-index-design-column): its handoff named this topic directly — equality-before-range ordering, selectivity, and skip scan all assumed a table's own rows still had to be visited through the index at all; this topic changes what an index even needs to visit in the first place.

## Learning outcomes
1. Build a covering index with INCLUDE columns, explain why it enables an index-only scan, and name the one condition (the visibility map) that decides whether that scan actually pays off.
2. Explain why updating rows can silently remove an index-only scan's own advantage without changing the index at all, and recognize `Heap Fetches` in EXPLAIN as the tell.
3. Design a partial index over a genuinely small hot subset of a table, and state why it should be both smaller and faster to maintain than a full index on the same column.
4. Explain why an expression index only helps a query that writes the identical expression, and recognize when a semantically equivalent but syntactically different expression silently falls back to a full scan.

## Reel, 15 steps
1. **Hook.** Same table, same filter, same column read back: one index needs 20,809 buffer reads; another, built on the identical column plus one extra payload column, needs 855. `fig`: two buffer counts, one real difference.
2. **Predict:** the query asks for a column that isn't even part of the WHERE clause. Why would adding it to the index change anything?
3. **Reveal:** INCLUDE columns and index-only scans — the index itself can answer the query, with no visit to the table at all.
4. **Reveal:** this only works because of the visibility map — a bit per heap page saying every row on it is old enough to be visible to everyone.
5. **Predict:** update every one of those matching rows. Does the covering index's own advantage survive that?
6. **Reveal:** no — `Heap Fetches` jumps from 0 to 444,014, and the index-only scan's speed disappears, even though the index didn't change shape at all.
7. **Reveal:** `VACUUM` restores it — the visibility map bit gets set again, and `Heap Fetches` drops back to 0.
8. **Predict:** a column is almost always one particular value, 98% of rows. Is a full index on it ever worth avoiding?
9. **Reveal:** partial indexes over a hot subset — indexing only the rare 2% measured here comes out 49 times smaller than indexing the whole column.
10. **Reveal:** that smaller index also means less to update on every write that touches the common 98% — nothing in that partial index ever has to change for those rows.
11. **Predict:** two queries compute the exact same expression, one with `||`, one with `concat()`. Does an index on that expression help both?
12. **Reveal:** no — only the exact expression the index was built on gets used; `concat()` instead of `||` falls back to a full scan, over 9,000 times slower, for computing the identical value.
13. **Reveal:** this is the planner matching syntax, not semantics — the expression index earns its speed only from queries that write it exactly as built.
14. **Recap.**
15. **Prove it.**

## Engagement arc
Hook (step 1, a real measured contrast) → predict (2) → four predicts total (2, 5, 8, 11) → takeaways on steps 4 (visibility map), 9 (partial index size), 13 (exact-expression match) → recap (14) → closing check (15).

## Post-notes layers
- **Internals:** why the visibility map is four orders of magnitude smaller than the heap it describes (quoted from the docs); the exact mechanism of suffix truncation for INCLUDE columns in upper B-Tree levels.
- **Lab:** the exact DDL and `EXPLAIN (ANALYZE, BUFFERS)` commands for all four measurements, including the before/after-VACUUM sequence.
- **Production:** PostgreSQL's own explicit warning against many small partial indexes (one per category) instead of one composite index, quoted directly; why index expressions are "relatively expensive to maintain" on writes, from the docs.
- **Frontier:** how other engines' equivalents (covering indexes, filtered indexes, functional/generated-column indexes) map onto these same three ideas — left as a pointer, not a new claim.
- **Where this goes next:** confirmed via `node scripts/next-topic.mjs de` once this topic is live.

## Concept ledger
- **Introduces:** `covering-index-include`, `visibility-map-dependence`, `partial-index-hot-subset`.
- **Uses:** `composite-index-column-order` (topic 28), `work-mem-spill` (topic 23).
- **Declared:** `sql-select`, `sql-create-index`, `sql-update`, `vacuum`.

## Claims list (→ FACT-CHECK.md)
1. INCLUDE columns let a covering index answer a query via an index-only scan, with no heap visit, when the query only needs columns in the index. [PostgreSQL docs] + measured locally (24x fewer buffers, 5.3x faster).
2. An index-only scan's benefit depends on the visibility map; stale (not-all-visible) heap pages force a heap visit regardless. [PostgreSQL docs] + measured locally (Heap Fetches 0 → 444,014 after an UPDATE, back to 0 after VACUUM).
3. A partial index over a genuinely small, frequently-queried subset is smaller and faster to maintain than a full index on the same column. [PostgreSQL docs] + measured locally (49x smaller for a 2%-of-rows predicate).
4. An expression index only helps a query whose expression matches syntactically; a semantically equivalent but differently-written expression gets no benefit from it. Measured locally (9,281x slower with `concat()` vs. `||`, same computed value).

## Bridge and handoff
- **Bridge:** "Equality-before-range ordering, selectivity, and skip scan all assumed a table's own rows still had to be visited through the index at all. This topic changes what an index even needs to visit in the first place."
- **Handoff:** "An index can now answer a query without visiting its own table at all, when the visibility map allows it. Next: table partitioning and partition pruning, where the table itself gets split so a whole partition, not just an index range, can be skipped before anything is ever read." (confirmed via `node scripts/next-topic.mjs de`, index 44, `de.table-partitioning-partition-pruning`)

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
