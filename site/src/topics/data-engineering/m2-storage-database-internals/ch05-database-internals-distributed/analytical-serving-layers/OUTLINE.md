# Outline — de.analytical-serving-layers

## Outcomes (from CHAPTER.md)

Explain pre-aggregation, a materialized serving table and a cube as three real techniques for the
same goal; decide, from a real freshness-vs-concurrency-vs-cost trade-off, when to move from
plain warehouse queries (Chapter 3's own subject) to a real-time OLAP store, naming Druid, Pinot
and ClickHouse as real reference points without building their engine internals (that's §6.4/§9.3's
job).

## 9-step storyboard (full, ~15 min)

1. **Hook.** The same aggregate query, measured for real against a real engine: once scanning raw
   rows from scratch, once against a table that already holds the answer. One of these is orders
   of magnitude faster, measured directly in this sandbox.
2. **Predict: is the fast one fast because it's a different kind of database, or because it's
   answering a smaller question.** (Correct: a smaller question — the pre-aggregated table holds
   far fewer rows because the aggregation work already happened, not because the engine
   underneath is fundamentally different.)
3. **Reveal: pre-aggregation is a cost shift, not a cost cut.** The real aggregation work still
   happens; it just happens once, at write time, instead of being repeated on every read. No
   takeaway (reel test's reference step).
4. **Reveal: a materialized serving table, measured.** A real precomputed table answers the same
   query a measured number of times faster than scanning the raw table directly. Takeaway.
5. **Reveal: the freshness gap, measured.** A write that lands in the raw table is measured
   invisible in the materialized table until it's refreshed — a real, measured staleness window a
   live raw-table scan never has. Takeaway.
6. **Reveal: cubes generalize this to many questions at once.** A cube precomputes the aggregate
   along every combination of a fixed set of dimensions, trading storage for being ready for any
   of those questions, not just the one this topic measured.
7. **Reveal: a real-time OLAP store's own rollup, named from its own documentation.** Druid,
   Pinot and ClickHouse each do this pre-aggregation at ingestion time itself, named directly from
   Druid's own documented trade-off (losing the ability to query individual events) — a third
   point on the freshness/concurrency/cost trade-off beyond a periodic materialized view, not
   separately run in this sandbox. Takeaway.
8. **Recap.**
9. **Prove it.** A dashboard needs a number that's both correct to the second and cheap to query
   a thousand times a minute. Which of this topic's own three options fits, and what does it cost
   to get there?
   (Correct: a real-time OLAP store with ingestion-time rollup — a periodic materialized view
   isn't fresh enough, and a raw warehouse scan isn't cheap enough at that query volume; the cost
   is standing up and operating that extra system.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 7 (three takeaways).

## Post-notes headings

Outcomes; Internals (pre-aggregation as a cost shift; the materialized-table speedup and
freshness-gap measurements; cubes as the general case; real-time OLAP's own ingestion-time
rollup); Production (choosing by the real freshness/concurrency/cost trade-off, the "Prove it"
step's own answer); Frontier (why Druid/Pinot/ClickHouse differ from each other, named but not
built here); Where this goes next (every read-side pattern so far assumed a reader pulling from a
store; the next topic is the opposite direction — a consumer reading what a producer wrote).

## Bridge / handoff

Bridge (answers topic 27's handoff verbatim): "A cache in front of a database is one read-side
pattern. This topic is a different one this chapter hasn't yet connected to Chapter 3's own
warehouse material: pre-aggregation and materialized serving layers, and precisely when a
real-time OLAP store earns its own cost over plain warehouse queries."

Handoff: "Every read-side pattern so far assumed a reader pulling from a store. The next topic is
the opposite direction entirely — a consumer reading what a producer wrote, through a queue or a
log."

## Concept ledger

Introduces: `analytical-serving-layers`. Uses: `cache-patterns-eviction`, `partitioning-schemes`.
Declared: Chapter 3's warehouse/dimensional-modeling material, used directly for contrast.

## Claims list (for FACT-CHECK.md)

1. ClickHouse's own documentation: an incremental materialized view shifts aggregation cost from
   query time to insert time; a refreshable materialized view instead re-runs the query
   periodically over the full dataset, so its results are only as fresh as the last refresh.
2. Apache Druid's own documentation: rollup is ingestion-time pre-aggregation, dramatically
   reducing stored row count, at the real, named cost of losing the ability to query individual
   events.
3. (This course) a real aggregate query, measured directly against a real engine, is orders of
   magnitude faster against a precomputed materialized table than against the raw table it was
   computed from.
4. (This course) a write to the raw table, measured directly, is invisible in the materialized
   table until the materialized table is explicitly refreshed — a real, measured freshness gap.
