# Fact-check: de.partition-sizing-repartition-coalesce

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | `spark.sql.shuffle.partitions` sets the shuffle output partition count directly | Confirmed | `sources/sql-performance-tuning.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | The identical group-by produces exactly 4, then exactly 17 output partitions, matching the config each time | Confirmed | Measured directly: `examples.py`, `g4.rdd.getNumPartitions() == 4`, `g17.rdd.getNumPartitions() == 17`. |
| 3 | `maxPartitionBytes` caps bytes packed into one input partition when reading files | Confirmed | Same source, quoted exactly. |
| 4 | `openCostInBytes` pads each file's effective size so small files don't over-crowd one partition | Confirmed | Same source, quoted exactly. |
| 5 | `FilePartition.scala`'s packing function takes both as direct parameters to one decision | Confirmed | `sources/file-partition.txt`, quoted verbatim. |
| 6 | `repartition(3)` produces exactly 3 partitions and carries a real Exchange in its own plan | Confirmed | Measured directly: `examples.py`, `rep.rdd.getNumPartitions() == 3`, `"Exchange" in rep_plan`. |
| 7 | `coalesce(3)`, from the identical 8-partition base, produces exactly 3 partitions with no Exchange | Confirmed | Measured directly: `examples.py`, `coal.rdd.getNumPartitions() == 3`, `"Exchange" not in coal_plan`. |
| 8 | `coalesce(20)`, asked to grow an 8-partition base, stays at 8 | Confirmed | Measured directly: `examples.py`, `coal_up.rdd.getNumPartitions() == 8`. |
| 9 | `coalesce(1)` on an 8-partition, 2,000,000-row dataset collapses every row into that one partition | Confirmed | Measured directly: `examples.py`, `collapsed.rdd.getNumPartitions() == 1`, `counts_per_partition == [2_000_000]`. |

## Red team

- **Could the 8-partition "base" DataFrame secretly already carry an Exchange, making the
  repartition/coalesce comparison unfair?** No — `examples.py` explicitly asserts `"Exchange" not
  in base_plan` before either call runs, specifically to rule this out; the base is built with
  `spark.range(..., numPartitions=8)`, a narrow, partition-count-only constructor with no shuffle
  of its own.
- **Is counting rows via `mapPartitions` actually proof of the coalesce(1) collapse, rather than
  just reading the final partition count?** Yes — `getNumPartitions() == 1` alone would be
  consistent with a cheap relabeling that still ran the original read on 8 parallel tasks before
  a late, separate merge step; counting all 2,000,000 rows landing inside that one partition
  directly confirms the upstream read itself executed as a single task, not 8 tasks funneled
  into a late merge.
- **Could AQE have changed any of these partition counts after the fact, undermining the
  measurement?** No — `spark.sql.adaptive.enabled` is explicitly set to `false` for the whole
  session, specifically because AQE's own `coalescePartitions` feature would otherwise merge
  small shuffle partitions automatically, confounding which number came from the explicit calls
  this topic measures.
- **Is the ~100-200 MB per-task target size (named in the syllabus clause) independently
  verified against a real task's actual bytes?** No — disclosed directly in `coverage.json`'s
  expert list as a sourced guideline, not independently measured; verifying it would need
  real file-backed data and Spark UI task metrics this topic's synthetic `range()`-based
  measurements don't produce.

No corrections were needed to `OUTLINE.md` beyond settling on an Exchange-free `spark.range(...,
numPartitions=8)` base (rather than a prior attempt chaining off an explicit `.repartition(8)`
call, which left its own Exchange in every downstream plan and made the comparison ambiguous)
during drafting itself.
