# Fact-check: de.data-skew-diagnosis-remedies

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Baseline: max/median duration ~4x, max/median shuffle-read bytes 12.2x, one straggler | Measured (`examples.py`) | `node ... examples.py` assertions, passing |
| AQE skew-join, default thresholds: bytes ratio unchanged (default threshold too high for this scale) | Measured | same |
| AQE skew-join, tuned thresholds: bytes ratio drops to ~1.1x | Measured | same |
| Broadcasting the small side: no shuffle join of any kind in the plan | Measured | same |
| Salting (8 buckets): bytes ratio ~3.2x, duration ratio ~2.6x, total bytes increase over baseline | Measured | same |
| Combinable `sum` aggregation: hot-partition shuffle-write (59 bytes) less than a diverse-key partition (12,750 bytes) | Measured | same |
| Non-combinable `collect_list` aggregation: one reduce task's duration well over 10x the median | Measured | same |
| Two-phase (salt, partial-aggregate, re-aggregate): the comparable stage's duration ratio drops to ~2.3x | Measured | same |
| Skew is detected from shuffle file statistics; skewed partitions are split and matched against the other side | Sourced, Databricks blog | `sources.mjs check`, 12/12 quotes |
| Skew-join handling runs only once a shuffle stage has materialized | Sourced, Databricks blog | same |
| A skewed partition's threshold is median size × factor, or an absolute floor, whichever is larger | Sourced, `OptimizeSkewedJoin.scala` | same |
| The skew-join rule's own purpose is avoiding disproportionate-share straggler tasks | Sourced, `OptimizeSkewedJoin.scala` | same |
| `optimizeSkewJoin` pattern-matches only `SortMergeJoinExec`/`ShuffledHashJoinExec` | Sourced, `OptimizeSkewedJoin.scala` | same |
| The docs restate skew-join handling as scoped to sort-merge join | Sourced, Spark SQL Performance Tuning docs | same |

## Red team

- **Is the baseline skew genuinely about row count, or an artifact of column pruning and
  low-entropy test data making bytes look skewed without being skewed?** Checked directly and
  avoided by design: both the key and payload columns use high-entropy random values (`random.Random`
  seeded per partition, `randint(0, 2**31)`), and the action (`selectExpr("sum(v)...")`) forces the
  payload column to survive into the shuffle rather than letting Spark prune it after a bare
  `.count()`. An earlier design using sequential or constant payload values showed only a 1.2–2x
  byte skew despite a genuine 7x row-count skew (confirmed via
  `repartition(8,"k").groupBy(spark_partition_id()).count()`), which is exactly the confound this
  topic's own measurement avoids.
- **Does the AQE-default-fails claim depend on the specific `shuffle.partitions=8` chosen, or
  would a realistic production partition count (200) show the same thing?** Not independently
  re-tested at 200 partitions; disclosed as measured at the one scale this topic uses. The
  mechanism (an absolute byte threshold compared against this partition's own size) does not
  depend on the partition count itself, only on the skewed partition's real byte size relative to
  the threshold — which is why lowering the threshold, not raising the partition count, is what
  this topic's own remedy does.
- **Is "isolating hot keys" actually demonstrated, or just described?** Disclosed honestly: this
  topic's own `examples.py` measures broadcasting the whole small side (claim 4), not a separate
  worked example where the small side is too large to broadcast whole and only the hot keys' rows
  are isolated. The mechanism is identical (no shuffle on the isolated rows); a dedicated attempt to
  construct a "dim table too large to broadcast, but still joined faster by isolating hot keys"
  scenario at this sandbox's local[4] scale produced *worse* wall-clock time than the plain baseline
  (stage/scheduling overhead dominated at this small a scale), so the claim is sourced and explained
  in `post-notes.md` rather than forced into a misleading measured number. See Abandoned approaches.
- **Is the non-combinable aggregate's duration ratio reliable, or just noise from a 4-core
  sandbox?** The ratio varies run to run (observed between roughly 8x and 26x across repeated runs
  of this same script on this sandbox), which is disclosed directly rather than quoted as one fixed
  number: `examples.py` only asserts it stays above 8x, and the reel/narration describe it as "well
  over 10x" rather than a specific decimal that would not survive a re-run.
- **Does the two-phase remedy actually fix the right stage, or did an earlier stage-selection bug
  just pick a smaller, unrelated stage?** This was a real bug during development: the two-phase
  query produces two 8-task shuffle-read stages (the salted partial aggregation, then the final
  unsalted merge), and selecting "the latest 8-task stage" picked the final merge stage — which has
  small absolute durations and a *misleadingly high* ratio (6.5x) because it's doing almost no work,
  not because it's skewed in any way that matters. Fixed by tracking a stage-id cursor before the
  query runs and selecting the *earliest* new 8-task stage after it, which is the partial
  aggregation stage the remedy is actually supposed to help.

## Abandoned approaches

The first attempt at a combinable-aggregation measurement used a naive stage-selection heuristic
(`max(stages, key=lambda s: s.get("shuffleReadBytes", 0) > threshold)`, with a fixed byte
threshold carried over from the join scenarios) to find the relevant shuffle stage for a plain
`groupBy("k").agg(sum("v"))`. It crashed with an empty-list error: the aggregation's own shuffle
read bytes never crossed that threshold, because — as the measurement eventually revealed on
purpose — map-side partial aggregation had already collapsed the hot key down to almost nothing
before the shuffle ran. The fix was not a bigger threshold; it was reading the shuffle *write*
side's per-task bytes instead of the read side, which is where the actual (inverted) skew signal
lives for this specific claim.

A separate attempt to demonstrate "isolating hot keys" as a distinct, independently measured
remedy (rather than sourced only) constructed a dimension table too large to broadcast whole (2
million rows) and compared a plain shuffle join against a hand-split query that broadcast only the
rows matching the hot key while shuffle-joining the rest. At this sandbox's `local[4]` scale, the
split version's wall-clock time was consistently *worse* than the plain shuffle join (53.5s vs
43.1s in one run; 49.997s vs 42.8s against an earlier, smaller dimension size) — the overhead of
the extra union and job-graph stages outweighed the shuffle-bytes savings at this data and cluster
size, even though the mechanism (no shuffle on the isolated rows) is sound and well documented. Per
`CHAPTER.md`'s own allowance for a remedy to be named without a dedicated worked example, this
topic sources and explains the technique in `post-notes.md` instead of reporting a misleading
wall-clock number that would not demonstrate the claimed benefit at the scale this sandbox can run.
