# Outline: Composite index design and column order (`de.composite-index-design-column`)

Syllabus line: "equality-before-range ordering, using index order to avoid sorts, selectivity; B-tree skip scan (PostgreSQL 18) when leading columns lack predicates; the write and storage cost of every extra index."

Bridge from topic 27 (reading-explain-across-engines): its handoff named this topic directly — a fixed triage order reads any plan; this topic decides what that plan even has available to choose from.

## Learning outcomes
1. Explain why a composite index's column order changes how much of the index gets scanned, not just whether it gets used at all, and measure the difference directly.
2. Build an index whose column order satisfies a query's ORDER BY, and recognize when a mismatched order forces an explicit sort instead.
3. Explain selectivity as the reason equality-before-range ordering works, and name PostgreSQL 18's B-tree skip scan as the case that relaxes the leading-column requirement.
4. State that every index adds real, measured write and storage cost, as a reason multicolumn indexes should be used sparingly.

## Reel, 15 steps
1. **Hook.** Same table, same query, two indexes differing only in column order: one answers in a handful of buffer reads, the other reads over 2,000 pages for the identical result. `fig`: two buffer counts, one query.
2. **Predict:** the two indexes cover the same two columns. Why would reading the same data through them cost so differently?
3. **Reveal:** equality constraints on leading columns narrow the scanned range; a range constraint on a leading column doesn't narrow nearly as much — this topic's own measured 364x gap.
4. **Reveal:** selectivity is why — the leading column's own number of distinct values decides how tight that first narrowing actually is.
5. **Predict:** an index already exists on (a, b). Does ORDER BY a, b and ORDER BY b, a cost the same to satisfy?
6. **Reveal:** the matched order skips sorting entirely; the mismatched order forces a full parallel sort — this topic's own measured ~1869x time gap.
7. **Reveal:** LIMIT n makes this worse to get wrong — an index-satisfied order returns the first n rows directly; a mismatched order has to sort everything first.
8. **Predict:** a query filters only on a composite index's second column, with nothing on the first. Can the index help at all, before PostgreSQL 18?
9. **Reveal:** before 18, no — the planner falls back to scanning the whole index (or the whole table).
10. **Reveal:** PostgreSQL 18's B-tree skip scan — measured directly, PG 16 vs. 18, same index, same query, same data: a full index scan drops to roughly one search per distinct leading value.
11. **Reveal:** skip scan only pays off when the leading column has few distinct values — this topic's own measurement used 10.
12. **Predict:** every index speeds up some query. Is adding one ever free?
13. **Reveal:** no — this topic's own measured write and storage cost: inserts ran about 4.8x slower with three extra indexes, and the indexes added real bytes on disk with nothing yet reading them.
14. **Recap**, including the syllabus's own closing principle: more than three columns, or indexes added without a query to justify them, rarely pay for themselves.
15. **Prove it.**

## Engagement arc
Hook (step 1, a real measured contrast) → predict (2) → three predicts total (2, 5, 8/12 — using 5 and 8 and 12, or folding two into one slot; confirmed final count against reel.tsx) → takeaways on steps 3 (equality-before-range), 7 (LIMIT amplifies the sort cost), 13 (write/storage cost) → recap (14) → closing check (15).

## Post-notes layers
- **Internals:** the exact mechanics of skip scan's "dynamic equality constraint," quoted from the multicolumn-indexes page; why `Index Searches` in `EXPLAIN` is itself a new-in-18 field worth knowing to look for.
- **Lab:** the exact table/index DDL and `EXPLAIN (ANALYZE, BUFFERS)` commands used for all four measurements.
- **Production:** PostgreSQL's own "used sparingly" and "more than three columns" guidance, stated as a real design constraint, not a rule of thumb without a source.
- **Frontier:** how other engines (covered across this chapter) handle the same column-order and selectivity tradeoffs — left as a pointer, not a new claim.
- **Where this goes next:** confirmed via `node scripts/next-topic.mjs de` once this topic is live.

## Concept ledger
- **Introduces:** `composite-index-column-order`, `btree-skip-scan`.
- **Uses:** `cardinality-estimation` (topic 19), `explain-triage` (topic 27).
- **Declared:** `sql-select`, `sql-create-index`, `order-by`.

## Claims list (→ FACT-CHECK.md)
1. A multicolumn B-tree index is most efficient with constraints on leading columns; equality constraints on leading columns (plus one inequality on the first column lacking equality) limit the scanned portion of the index. [PostgreSQL docs] + measured locally (same query, (a,b) vs (b,a) indexes).
2. An index can satisfy ORDER BY directly, avoiding an explicit sort step, and this matters especially with LIMIT. [PostgreSQL docs] + measured locally (matched vs. mismatched column order).
3. PostgreSQL 18 added B-tree skip scan, letting a multicolumn index help even when leading columns lack predicates, by re-searching once per distinct leading value. [PostgreSQL 18 release notes + multicolumn-indexes docs] + measured locally (PG16 vs. PG18, same index, same query).
4. Every index adds real overhead to writes, synchronized at the time of each data modification. [PostgreSQL docs] + measured locally (insert timing and storage with 0 vs. 3 indexes).
5. Multicolumn indexes should be used sparingly; more than three columns is unlikely to help. [PostgreSQL docs, quoted directly in Recap].

## Bridge and handoff
- **Bridge:** "A fixed triage order reads any plan, on any engine, once you know where to look. This topic decides what that plan even has available to choose from."
- **Handoff:** "Equality-before-range ordering, selectivity, and skip scan all assumed a table's own rows still had to be visited through the index at all. Next: covering, partial and expression indexes, where INCLUDE columns, partial indexes, and expression indexes each change what an index even needs to visit in the first place." (confirmed via `node scripts/next-topic.mjs de`, index 43, `de.covering-partial-expression-indexes`)

## Progress
- [x] Research, sources fetched and verified, all four measurements taken locally (PG16 + PG18 side by side)
- [x] examples.py written and verified
- [x] OUTLINE.md (this file)
- [ ] FACT-CHECK.md
- [ ] coverage.json
- [ ] reel.tsx / scenes.tsx
- [ ] pre-notes.md / post-notes.md / prerequisites.mdx / references.md / narration.json
- [ ] registry.ts entry
- [ ] checks, content + looks review, ship
