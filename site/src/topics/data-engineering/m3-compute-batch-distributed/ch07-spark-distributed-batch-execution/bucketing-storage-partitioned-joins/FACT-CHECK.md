# Fact-check: de.bucketing-storage-partitioned-joins

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Bucketing and sorting apply only to persistent tables, written with `saveAsTable` | Confirmed | `sources/` cached text, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | `bucketBy` splits rows across a fixed number of buckets, usable when the column's unique-value count is unbounded | Confirmed | Same source, quoted exactly. |
| 3 | Two tables bucketed by the same key with the same bucket count join with zero `Exchange` nodes | Confirmed | Measured directly: `examples.py`, `matched_plan.count("Exchange") == 0`. |
| 4 | Both sides' own scan is tagged a bucketed read when buckets match | Confirmed | Measured directly: `examples.py`, `matched_plan.count("Bucketed: true") == 2`. |
| 5 | A mismatched bucket count forces a real `Exchange` | Confirmed | Measured directly: `examples.py`, `mismatched_plan.count("Exchange") == 1`. |
| 6 | The side whose own bucket count never changed still loses its bucketed read when the OTHER side mismatches | Confirmed | Measured directly: `examples.py`, `"Bucketed: false (disabled by query planner)" in mismatched_plan`. |
| 7 | Storage Partition Join (SPJ) avoids the shuffle phase using the existing storage layout, generalising bucket joins to DSv2 sources | Confirmed | `sources/` cached text, quoted verbatim. |
| 8 | A successful SPJ leaves no `Exchange` node before the join in the plan | Confirmed | Same source, quoted exactly. |
| 9 | `KeyGroupedPartitioning` is keyed on a data source's own reported partition transform expressions | Confirmed | `partitioning.scala`, quoted verbatim. |

## Red team

- **Does measuring `Exchange` counts via plain substring/count checks actually isolate the
  bucketing mechanism, or could AQE or caching produce the same counts for an unrelated reason?**
  AQE is explicitly disabled (`spark.sql.adaptive.enabled=false`) for the whole session, and no
  `.cache()`/`.persist()` call appears anywhere in either measured query — the contrast (0 vs. 1
  Exchange) itself rules out a blanket "joins never shuffle" misreading, since the mismatched case
  genuinely pays for one.
- **Could the broadcast join strategy, not bucketing, be the real reason the matched case shows
  zero Exchange?** No — `spark.sql.autoBroadcastJoinThreshold` is forced to `-1` for the whole
  session specifically to rule this out; the plan text itself confirms a `SortMergeJoin`, not a
  broadcast, in both the matched and mismatched cases.
- **Is writing both tables via `bucketBy(...).saveAsTable(...)` on the same local warehouse a fair
  stand-in for "two tables bucketed the same way," given it's Spark's own write path rather than a
  table managed by an external system?** Yes — this is exactly the mechanism the Generic Load/Save
  Functions docs describe bucketing as being for; no external catalog or cluster is needed for
  Spark's own bucketed read/write path to apply.
- **Is Storage Partition Join (claim 7-9) actually exercised by this topic's own measurement, or
  only quoted?** Only quoted — disclosed directly in `coverage.json`'s syllabus mapping and expert
  list; no real DSv2/Iceberg table runs in this cloud session, so SPJ's own no-Exchange behaviour
  is sourced from Spark's own documentation and source rather than independently re-measured here.
  This topic's own `examples.py` measures classic Hive bucketing only.

No corrections were needed to `OUTLINE.md` beyond settling on the mismatched-bucket-count contrast
(rather than a mismatched column, which would be a less surprising, more obviously-broken case) as
the cleanest way to show that even a single disagreement withdraws the optimisation from both
sides, not just the side that changed.
