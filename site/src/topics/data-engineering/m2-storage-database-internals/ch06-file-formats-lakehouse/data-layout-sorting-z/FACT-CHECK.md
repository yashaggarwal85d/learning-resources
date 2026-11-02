# Fact-check — de.data-layout-sorting-z

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | Liquid clustering improves partitioning/ZORDER by letting data layout evolve without rewriting existing data | Delta Lake, liquid clustering docs | SOURCES.md quote 1 |
| 2 | Clustering is not compatible with partitioning or ZORDER | Delta Lake, liquid clustering docs | SOURCES.md quote 2 |
| 3 | Liquid clustering is incremental: data is only rewritten as necessary; already-clustered files with different clustering columns are not rewritten | Delta Lake, liquid clustering docs | SOURCES.md quote 3 |
| 4 | `OPTIMIZE FULL` reclusters all existing data and can take hours on large, previously-unclustered tables | Delta Lake, liquid clustering docs | SOURCES.md quote 4 |
| 5 | `OPTIMIZE FULL` is needed when clustering columns change; otherwise it behaves like `OPTIMIZE` | Delta Lake, liquid clustering docs | SOURCES.md quote 5 |
| 6 | A sort order lets data be sorted within partitions by columns to gain performance, declared per data/delete file | Apache Iceberg, Spec (Sorting) | SOURCES.md quote 6 |
| 7 | A sort order is an id plus an ordered list of sort fields; field order determines the order the sort is applied | Apache Iceberg, Spec (Sorting) | SOURCES.md quote 7 |
| 8 | Sort order id 0 is reserved for the unsorted order | Apache Iceberg, Spec (Sorting) | SOURCES.md quote 8 |
| 9 | Writers are not required to use the default sort order if it's prohibitively expensive, as for streaming writes | Apache Iceberg, Spec (Sorting) | SOURCES.md quote 9 |
| 10 | Data-skipping statistics (min/max/null counts/row counts) are collected automatically per file and used at query time to skip irrelevant files | Databricks, Data skipping docs | SOURCES.md quote 10 |
| 11 | Z-ordering colocates related information in the same set of files; data-skipping uses that co-locality to reduce data read | Databricks, Data skipping docs | SOURCES.md quote 11 |
| 12 | Z-ordering columns without statistics collected is ineffective and wastes compute | Databricks, Data skipping docs | SOURCES.md quote 12 |
| 13 | Databricks recommends liquid clustering for all new tables; it can't be combined with ZORDER | Databricks, Data skipping docs | SOURCES.md quote 13 |
| 14 | Hudi clustering can stitch small files into larger ones and cluster data by sort key for data locality | Apache Hudi, Clustering docs | SOURCES.md quote 14 |
| 15 | Hudi sorts file groups in a clustering plan by the specified columns while meeting target file sizes, by default | Apache Hudi, Clustering docs | SOURCES.md quote 15 |
| 16 | Hudi supports incremental scheduling: only partitions changed since the last completed clustering operation are processed | Apache Hudi, Clustering docs | SOURCES.md quote 16 |
| 17 | Hudi's clustering service lets writers keep inserting new data while clustering runs in the background, with snapshot isolation | Apache Hudi, Clustering docs | SOURCES.md quote 17 |

**Currency note.** All four sources fetched 2026-11-02 against their current ("latest"/live docs)
pages. The Iceberg spec is the canonical, version-independent table specification (not a release
changelog), so no separate version pin was needed beyond the fetch date.

## Red-team

1. **The 256-row, two-column dataset in `examples.py` is a synthetic, deliberately small and
   dense Cartesian product (every (a, b) pair for a, b in 0..15), not a sample of real production
   data.** This is disclosed in the script's own docstring and `coverage.json`'s expert items. What
   transfers is the real, executed mechanism — row-group bounds computed directly from real row
   data, and a real two-column range predicate evaluated against those bounds — not a claim about
   any particular real dataset's skew or cardinality. The domain size (16) and group size (16) were
   chosen specifically so Z-order's groups align to clean, human-checkable 4×4 boxes in (a, b)
   space; a real table's group boundaries would not align this cleanly, though the same mechanism
   (Morton-order locality) applies.

2. **The "arrival order" layout is a fixed, deterministic scramble (a multiplicative permutation),
   not a sample of real streaming arrival order.** This is a stand-in chosen so the demonstration
   is reproducible and non-random, not a claim that real arrival order always produces zero
   locality — in practice, real streaming data often has *some* incidental locality (e.g., by
   ingestion time), which could prune slightly better than this worst-case stand-in. Disclosed in
   `coverage.json`.

3. **Row-group pruning, as implemented here (an exact min/max-bounds overlap test), is the real
   mechanism Parquet row-group statistics and page indexes use** (the same mechanism topic 7
   covered for Parquet's own statistics) — not a simplification specific to this topic. What's
   synthetic is the dataset and the group-size/domain choice, not the pruning logic itself.

4. **The incremental-vs-full reclustering demonstration (demonstration 4) models Delta's own
   documented behavior directly** — "data is only rewritten as necessary to accommodate data that
   needs to be clustered," versus `OPTIMIZE FULL` rewriting everything — using the same Z-ordered
   dataset from demonstrations 1-3. It does not model Hudi's or Iceberg's own specific incremental-
   clustering implementations in detail (Hudi's `hoodie.table.services.incremental.enabled`
   partition-level incremental scheduling, or Iceberg's own sort-order-driven compaction), though
   both are named and sourced in step 7. Disclosed in `coverage.json`.

5. **Scope boundary.** This topic does not re-derive topic 7's single-column data-skipping
   mechanism from scratch (restated briefly in the hook/outcomes, per CHAPTER.md's own outcome
   wording "restate and extend"); it does not cover Hilbert curves' mathematical construction in
   depth (named alongside Z-order per the syllabus line, but the executed demonstration uses
   Z-order specifically, since Z-order's bit-interleaving is the simpler, directly-implementable
   mechanism — Hilbert curves achieve better locality via a more complex recursive construction,
   named but not separately coded, disclosed in `coverage.json`).

**Problem-solving notes.** All four demonstrations in `examples.py` are deterministic (fixed
Cartesian-product dataset, a fixed multiplicative-hash permutation for "arrival order", no
randomness, no timing), verified byte-identical across 3 consecutive runs. The row counts needing
to scan (16, 4, 1) are exact by construction given the chosen domain/group-size/predicate, not
approximations.
