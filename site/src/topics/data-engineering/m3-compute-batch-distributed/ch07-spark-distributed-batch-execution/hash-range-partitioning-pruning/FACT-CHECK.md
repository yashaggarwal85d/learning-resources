# Fact-check: de.hash-range-partitioning-pruning

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | `HashPartitioning` places rows sharing the same hash of its expressions in the same partition | Confirmed | `sources/partitioning.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | `RangePartitioning` splits rows by a total ordering, a stronger guarantee than mere grouping | Confirmed | Same source, quoted exactly. |
| 3 | A real `groupBy`'s own shuffle is tagged `hashpartitioning` in the plan | Confirmed | Measured directly: `examples.py`, `"hashpartitioning" in group_plan`. |
| 4 | A real `orderBy`'s own shuffle is tagged `rangepartitioning` in the plan | Confirmed | Measured directly: `examples.py`, `"rangepartitioning" in sort_plan`. |
| 5 | Two window steps partitioned by the same key share exactly one Exchange | Confirmed | Measured directly: `examples.py`, `same_plan.count("Exchange") == 1`. |
| 6 | The same two steps, partitioned by two different keys, need exactly two Exchanges | Confirmed | Measured directly: `examples.py`, `diff_plan.count("Exchange") == 2`. |
| 7 | Hive-style partitioning encodes partitioning column values in the directory path itself | Confirmed | `sources/partition-discovery.txt`, quoted verbatim. |
| 8 | A filter on a Hive-style partitioned column shows a real `PartitionFilters` entry naming the predicate | Confirmed | Measured directly: `examples.py`, `"PartitionFilters: [isnotnull" in part_scan_line`. |
| 9 | The identical filter against a flat (unpartitioned) layout shows an empty `PartitionFilters` list | Confirmed | Measured directly: `examples.py`, `"PartitionFilters: []" in flat_scan_line`. |
| 10 | A DSv2 source implements `SupportsPushDownFilters` to push filters down and reduce data read | Confirmed | `sources/supports-push-down-filters.txt`, quoted verbatim. |

## Red team

- **Does the same-key/different-key window contrast actually isolate exchange elimination, or
  could Catalyst be doing something else (e.g. caching) to produce those exact counts?** The
  mechanism is a documented planner rule (`EnsureRequirements`), not caching — no `.cache()` or
  `.persist()` call appears anywhere in either measured query, and the contrast itself (1 vs. 2)
  rules out a blanket "windows are free" explanation, since the different-key version genuinely
  pays for two separate shuffles.
- **Could AQE have changed any of these Exchange counts after the fact?** No —
  `spark.sql.adaptive.enabled` is explicitly `false` for the whole session; AQE's own runtime
  `coalescePartitions` feature is a separate, later-stage mechanism this topic disables to keep
  Catalyst's own up-front plan legible.
- **Is writing the test dataset with `partitionBy("day")` a fair stand-in for a "real" Hive-style
  table, given it's Spark's own write path rather than an externally registered Hive table?**
  Yes — the directory structure `day=N/` this produces, and the discovery mechanism that reads it
  back, is the identical mechanism the Partition Discovery docs describe; no Hive metastore
  registration is required for Spark's own partition discovery or pruning to apply.
- **Is DSv2 partition-stats filtering (claim 10) actually exercised by this topic's own
  measurement, or only quoted?** Only quoted — disclosed directly in `coverage.json`'s expert
  list; this topic's own `examples.py` measures static pruning on a Hive-style directory layout,
  a related but distinct mechanism from a DSv2 source reporting its own statistics.

No corrections were needed to `OUTLINE.md` beyond settling on the window-step contrast (same key
vs. different key) as the cleanest deterministic way to demonstrate exchange elimination, after an
earlier attempt using a join and an explicit `repartition` call produced confounding results from
Spark's own `ReusedExchange` subplan-deduplication kicking in on identical lineages instead.
