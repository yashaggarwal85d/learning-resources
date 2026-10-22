# Outline: Reading EXPLAIN across engines (`de.reading-explain-across-engines`)

Syllabus line: "estimated vs actual rows, loops, buffers (on by default with ANALYZE since PostgreSQL 18), spill and memory indicators; the equivalents in Spark (physical plan + UI), Trino (EXPLAIN ANALYZE), Snowflake (Query Profile) and BigQuery (execution graph); a fixed triage order."

Bridge from topic 26 (adaptive-execution-runtime-filters): its handoff named this topic directly — every plan in this chapter has been read off one engine's own EXPLAIN output at a time; this topic generalizes.

## Learning outcomes
1. Read "estimated vs. actual rows" and "loops" on any engine's plan output and say what a large gap or a high loop count means.
2. Explain the one concrete, version-dated change this topic measured (PostgreSQL 18 turning on `BUFFERS` by default with `ANALYZE`) as an instance of a general lesson: a plan's own defaults can change across versions, so read the actual output, not a memorized format.
3. Find spill/memory indicators in Spark's UI/API, name Snowflake Query Profile's and BigQuery's execution graph's equivalent fields by name, and say what Trino's `EXPLAIN ANALYZE` reports that plain `EXPLAIN` doesn't.
4. Apply a fixed triage order to an unfamiliar plan from any of these five engines.

## Reel, 15 steps
1. **Hook.** Same command shape, same kind of query, two versions of the same engine: PostgreSQL 16 shows no `Buffers:` line at all; PostgreSQL 18 shows one automatically. `fig`: two EXPLAIN outputs, one with a line the other doesn't have.
2. **Predict:** why would the same command, run the same way, show more information in a newer version?
3. **Reveal:** PostgreSQL 18 turns `BUFFERS` on by default with `ANALYZE` — a real, version-dated default change, not a trick of the query.
4. **Reveal:** estimated vs. actual rows, and loops — this topic's own measured ~2x underestimate, and what a high `loops` count means for a node under it.
5. **Reveal:** spill and memory indicators, recapped from this chapter's own prior measurements (topic 23's `Batches`/spill output) — the same question ("did this run out of its memory budget") every engine answers somewhere.
6. **Predict:** across five totally different outputs, what's worth checking first, regardless of vocabulary?
7. **Reveal:** Spark's own "estimated" lives in its plan text (`explain(mode="cost")`'s `Statistics(rowCount=...)`), not in a separate UI.
8. **Reveal:** Spark's "actual" lives in its UI and REST API — this topic's own measured contrast, a comfortable run (no spill) vs. a memory-constrained run (a real, nonzero spill).
9. **Predict:** given a stage's own reported numbers, which field actually tells you it spilled?
10. **Reveal:** Trino's `EXPLAIN ANALYZE` — CPU time and relative cost per plan node, inline in the same text plan (sourced; no Trino installed, honest gap).
11. **Reveal:** Snowflake's Query Profile — named panes for pruning (partitions scanned vs. total) and spilling (bytes to local vs. remote storage) (sourced; no Snowflake account, honest gap).
12. **Reveal:** BigQuery's execution graph — stages as boxes, edges carrying the estimated rows exchanged, shuffle spill called out by name (sourced; no BigQuery account, honest gap).
13. **Recap**, including the fixed triage order as the synthesizing idea: check the biggest estimate-vs-actual gap first, then a high loop count multiplying a small per-call cost, then spill/memory pressure, then the single slowest or widest operator.
14. **Prove it · 1 of 2.**
15. **Prove it · 2 of 2.**

## Engagement arc
Hook (step 1, a real measured version-dated default change) → early predict (step 2) → three predicts total (2, 6, 9) → takeaways on steps 4 (estimate gap), 8 (Spark's honest spill contrast), 13 (the triage order itself, folded into Recap — if the engagement check needs a `takeaway` field distinct from Recap's own body, add one on step 11 or 12 instead) → recap (13) → two closing checks (14-15).

## Post-notes layers
- **Internals:** why PostgreSQL 18 changed the `BUFFERS` default (ANALYZE without buffer detail was judged to answer fewer real questions than it used to); the exact Spark REST API endpoint and fields used; Snowflake's and BigQuery's documented permission requirements to even view this data.
- **Lab:** the exact `pg_createcluster`/`pg_ctlcluster` commands used to run PostgreSQL 18 alongside 16 without touching the existing cluster; the Spark configs used to force a genuine spill locally.
- **Production:** a fixed triage order worth keeping as a checklist; what each engine's documentation says about required permissions or configuration to see this data at all (Snowflake's and BigQuery's own access requirements, named explicitly).
- **Frontier:** the common shape across all five — a stage/operator tree, a per-node or per-stage cost signal, and a real vs. estimated distinction — as the actual generalizable skill, independent of any one engine's vocabulary.
- **Where this goes next:** confirmed via `node scripts/next-topic.mjs de` once this topic is live.

## Concept ledger
- **Introduces:** `explain-triage`, `buffers-default-pg18`.
- **Uses:** `cardinality-estimation` (topic 19), `work-mem-spill` (topic 23), `adaptive-query-execution` (topic 26).
- **Declared:** `sql-select`, `group-by`.

## Claims list (→ FACT-CHECK.md)
1. PostgreSQL 18's `ANALYZE` option implicitly enables `BUFFERS`. [PostgreSQL docs] + measured locally (PG16 vs. PG18, same sandbox).
2. Estimated vs. actual rows, and loops, are read the same way (compare the two, watch for a high loop count) across engines, demonstrated on a real PostgreSQL 18 underestimate.
3. Spark's own row/size estimate is printed in its plan text (`explain(mode="cost")`), separate from its actual runtime stats, which live only in its UI/REST API. Measured locally, including a genuine forced spill.
4. Trino's `EXPLAIN ANALYZE` reports CPU time and relative cost per plan node inline. [Trino docs] — not independently measured (no Trino installed; same honest-gap reasoning as topics 25-26).
5. Snowflake's Query Profile names pruning (partitions scanned/total) and spilling (bytes to local/remote storage) as explicit panes. [Snowflake docs] — not independently measured (no Snowflake account).
6. BigQuery's execution graph shows stages as boxes with estimated rows on the connecting edges, and names shuffle-memory spill explicitly as a slowdown cause. [Google Cloud docs] — not independently measured (no BigQuery account).

## Bridge and handoff
- **Bridge:** "Every plan in this chapter, adaptive or not, has been read off one engine's own EXPLAIN output at a time. This topic reads across all of them."
- **Handoff:** "A fixed triage order reads any plan, on any engine, once you know where to look. Next: composite index design and column order, where equality-before-range ordering, selectivity, and PostgreSQL 18's B-tree skip scan decide what that plan even has available to choose from." (confirmed via `node scripts/next-topic.mjs de`, index 42, `de.composite-index-design-column`)

## Progress
- [x] Research, sources fetched and verified, PostgreSQL 18 installed and measured, Spark UI/API measured
- [x] examples.py written and verified
- [x] OUTLINE.md (this file)
- [ ] FACT-CHECK.md
- [ ] coverage.json
- [ ] reel.tsx / scenes.tsx
- [ ] pre-notes.md / post-notes.md / prerequisites.mdx / references.md / narration.json
- [ ] registry.ts entry
- [ ] checks, content + looks review, ship
