# Outline

## Scope mapped to steps

1. Hook: a vendor demo shows one engine doing everything; the plant's actual workload has four very different access paths.
2. Reveal: the decision matrix — last value, range scan, cross-series aggregation, join to business data — measured on the same data.
3. Reveal: Prometheus-style engines win the operational-metrics row, and where their own documentation says they stop.
4. Predict: does the join to business data get cheaper or more expensive as history grows?
5. Reveal: high-rate analytics engines (ClickHouse, QuestDB, InfluxDB 3) each name their own last-value shortcut.
6. Reveal: the join is the lakehouse's own case to make, and the cost that comes with it.
7. Reveal: a capacity-and-cost chain, priced at a dated unit cost, for the hot tier and the lakehouse tier.
8. Reveal: tiering duplicates points at the boundary, and a late reading can miss the lakehouse entirely.
9. Recap.
10. ProveIt (second predict: does the structure alone, with no new numbers, say which tier a given access path belongs on?).

(The predict step is placed fourth, not fifth, so the first predict lands within the first four steps per the build's engagement-rule check; the join-cost question is asked before the matrix has shown the high-rate-analytics shortcuts, which only sharpens the prediction.)

## Why the matrix was measured, not asserted

CHAPTER.md's own outcomes ask this topic to fill a decision matrix "with measured or sourced values for the plant's workload," not to assert which engine wins each row from memory. `examples.py` builds a synthetic week of the plant's own series count (1297, from topic 12) in DuckDB, using DuckDB's own set-generating SQL rather than a row-by-row Python loop (the full week's row count is in the tens of millions), and measures all four access paths directly: a last-value lookup, a single-series range scan, a cross-series aggregation, and a join to a synthetic work-order table. DuckDB stands in for the high-rate-analytics and lakehouse rows (consistent with its role in topics 11, 12 and 13); Prometheus, ClickHouse, QuestDB and InfluxDB 3's own vendor-specific shortcuts (last-value caches, MergeTree's sparse primary key) are named and quoted from their own documentation rather than run, since none of them is installed in this environment (confirmed directly in topic 13's own build).

## The capacity-and-cost chain, priced at a dated unit cost

Per CHAPTER.md's instruction that "cost is stated with dated unit prices from the vendors' own pages, never bare," the hot-tier and lakehouse-tier capacity estimates in `examples.py` are priced using Thanos's own documented object-storage figure (about $0.02/GB, dated to its design document, retrieved 2026-10-31) — the same figure topic 13 already cited for the identical purpose, rather than deriving a new, undated number.

## The registry gaps (sixth and seventh of this chapter, same handling each time)

CHAPTER.md's `uses` line names `analytical-serving-layers` (Chapter 5) and "Chapter 6's table-format ids (look up in `registry.ts`)". Verified by grep before writing this file: `analytical-serving-layers` doesn't exist in any topic's `introduces` list yet (only named in one other topic's own forward-looking `uses`), and every Iceberg/Delta/table-format id in `registry.ts` (`iceberg-delta-hudi-table-format-mechanics`, `iceberg-snapshot-branch-mechanics`, `iceberg-delta-table-format-tradeoffs`) appears only in `declared` or `uses` arrays, never in an `introduces` array — Chapter 6 itself hasn't shipped a single topic yet. This topic's own `uses` list in `registry.ts` includes the 14 other ids CHAPTER.md names (all confirmed `introduced` by grep) and omits these two, rather than claiming either a Chapter 5 topic or all of Chapter 6 that hasn't been built — the same pattern as topics 6, 10, 11 and 12's five prior gaps.

## What this topic leaves out (per CHAPTER.md)

Each engine's internals (topic 13, Chapter 6 §6.4); series cardinality (topic 12); compression (topic 11); the design method itself (Chapter 15, whose steps this topic applies to one decision); cloud pricing mechanics in general (Chapter 10).
