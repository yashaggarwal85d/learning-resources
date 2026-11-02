# Outline — de.bi-serving-layer-performance

## Outcomes (from CHAPTER.md)

Choose between a rollup table, a materialized view and result caching for a stated query pattern
and justify the choice by how often the underlying data changes versus how often the query
repeats; explain what BigQuery BI Engine does and does not accelerate, from its own documented
exclusions; state why a cache's invalidation policy must be tied to a freshness SLA, not a fixed
timer, to stay correct; predict queueing behavior when a concurrency ceiling is exceeded and size
a ceiling against a given usage pattern.

## 9-step storyboard (full, ~15 min, closes §17.7)

1. **Hook.** A dashboard that was fast all quarter suddenly queues for thirty seconds every Monday
   morning. Nothing about the dashboard's query changed.
2. **Predict: what two numbers, outside the query itself, explain this, and which lever actually
   fixes it.** (Correct: Monday's usage spike plus a fixed concurrency ceiling; only a bigger
   reservation or spreading the load fixes a ceiling problem, since the query itself was never the
   bottleneck.)
3. **Reveal: rollup tables and materialized views.** The oldest lever, reused by name from earlier
   chapters: compute the expensive aggregation once, on a schedule, and let every dashboard query
   the small result instead of the large source. No takeaway (reel test's reference step).
4. **Reveal: result caching.** Caching a query's exact result for reuse by an identical or
   near-identical later query — a cached result is only as fresh as its cache key accounts for, and
   an invalidation policy tied to the source's own freshness SLA (topic 8's term) is what keeps
   "fast" from becoming "wrong." Takeaway.
5. **Reveal: BigQuery BI Engine.** Google's own description — "a fast, in-memory analysis service"
   that caches a reservation's preferred tables, accelerating leaf-level joins (up to four small
   dimension tables against one large fact table) and falling back to standard execution slots,
   without failing the query, for anything it can't accelerate (JSON columns, external tables,
   wildcard tables, and more). Takeaway.
6. **Reveal: Databricks SQL's disk cache.** The comparable warehouse-native acceleration layer:
   Databricks' own documentation describes an automatic, local-disk cache of remote Parquet/Delta
   reads that detects and invalidates stale entries itself when source files change. Takeaway.
7. **Reveal: concurrency ceilings and queueing.** Every one of these engines has a concurrency
   limit (a reservation size, a capacity unit count) past which queries queue or fail; sizing a
   ceiling against a stated usage pattern, and the queueing that results when it's exceeded.
   Takeaway.
8. **Recap.**
9. **Prove it.** A team doubles its dashboard refresh frequency and queries start queueing even
   though each individual query runs just as fast as before. What actually changed? (Correct:
   nothing about query speed — the number of concurrent queries hitting the reservation at once
   went up, which is a concurrency-ceiling problem, not a performance regression in any one query.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (BI Engine's and Databricks SQL's own documented mechanisms); Lab (none of its
own — a sized, worked scenario rather than a chapter lab leg); Production (the Monday-morning
queueing failure mode); Frontier (choosing between the three levers by data-change-rate vs.
query-repeat-rate); Where this goes next (zero-ETL, closing the chapter).

## Bridge / handoff

Bridge (answers topic 9's handoff verbatim): "Any of these tools, in any mode, can still bring a
warehouse to its knees if enough analysts ask it the same expensive question at once. This topic
is the engine layer that catches that load before the warehouse has to: rollups, materialized
views, result caching, and the named acceleration engines that do all three under one name — with
their own documented limits."

Handoff (leads into topic 11): "Everything in this section assumed data engineering still moves
the data at all. The chapter's last topic asks what happens when a vendor claims it doesn't have
to: 'zero-ETL,' and what that name is actually hiding."

## Concept ledger

Introduces: `pre-aggregation-vs-materialized-view-vs-cache`, `warehouse-acceleration-engine-scope`,
`concurrency-ceiling-and-queueing`.
Uses: `bi-query-modes-import-live-direct`, `headless-bi-many-tools-one-metric` (topic 9);
`grain-and-freshness-documentation`, `de-to-bi-handoff-contract` (topic 8). Builds on Chapter 6's
materialized-view/rollup material (not yet live) in prose only.
Declared: none.

## Claims list (for FACT-CHECK.md)

1. Google Cloud's own BI Engine documentation: "a fast, in-memory analysis service that
   accelerates many SQL queries in BigQuery by intelligently caching the data that you use most
   frequently."
2. BI Engine preferred tables let acceleration be limited to a specified set of tables; queries to
   all other tables use regular BigQuery slots.
3. BI Engine is most optimized for leaf-level subqueries (scanning, filtering, aggregation,
   sorting, supported joins); unaccelerated stages fall back to standard execution slots without
   failing the query.
4. BI Engine's join acceleration: a large fact table joined with up to four smaller dimension
   tables, on leaf-level INNER/LEFT OUTER joins.
5. BI Engine's named exclusions: JSON type columns, wildcard tables, external tables, row-level
   security, non-SQL user-defined functions.
6. Databricks' own documentation: disk caching automatically stores a local copy of remote Parquet
   data on first read; later reads of the same data run locally and are significantly faster.
   In SQL warehouses, the legacy CACHE SELECT command is ignored in favor of this automatic
   mechanism.
7. Databricks' own documentation: the disk cache automatically detects when data files are
   created, deleted, modified, or overwritten, and invalidates/evicts stale entries itself, with
   no need to explicitly invalidate cached data.
8. (This course) a cache's invalidation policy must be tied to the source's own freshness SLA
   (topic 8's term), not a fixed timer, to stay correct — the generic correctness claim that both
   named engines' own automatic-invalidation mechanisms are concrete instances of.
9. (This course) rollup tables, materialized views and result caching are the same lever at three
   different granularities, chosen by how often the underlying data changes versus how often the
   query repeats — reused by name from this course's own earlier chapters (not yet live), not
   re-derived here.
10. (This course) a concurrency ceiling (a reservation size, a capacity unit count) is a distinct
    failure mode from a slow query — exceeding it produces queueing regardless of how fast any
    individual query runs, sized against a stated usage pattern in this topic's worked scenario.
