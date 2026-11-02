# Fact-check: de.broadcast-hash-join

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | `autoBroadcastJoinThreshold` sets the maximum broadcastable table size (default 10 MB) and -1 disables broadcasting | Confirmed | `sources/perf-tuning.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | The `BROADCAST` join hint overrides the threshold, producing either a broadcast hash join or a broadcast nested-loop join depending on an equi-join key | Confirmed | Same source, quoted exactly. |
| 3 | A small table joined to a large one under the default threshold produces a `BroadcastExchange` and `BroadcastHashJoin`, with no shuffle `Exchange` | Confirmed | Measured directly: `examples.py`, string checks on `under_threshold_plan`. |
| 4 | The identical join with the threshold forced to -1 contains no `BroadcastExchange`, contains `SortMergeJoin`, and has exactly 2 `Exchange` nodes | Confirmed | Measured directly: `examples.py`, string/count checks on `threshold_off_plan`. |
| 5 | The identical small table joined on a non-equi condition under the default threshold contains `BroadcastNestedLoopJoin` and `BroadcastExchange`, and no `BroadcastHashJoin` | Confirmed | Measured directly: `examples.py`, string checks on `non_equi_plan`. |
| 6 | `BroadcastHashJoinExec`'s own "streamed" (large) relation is never shuffled once the small side is broadcast | Confirmed | `sources/broadcast-hash-join-exec.txt`, quoted verbatim. |
| 7 | `BroadcastExchangeExec` collects, transforms and broadcasts the small side's result | Confirmed | `sources/broadcast-exchange-exec.txt`, quoted verbatim. |

## Red team

- **Could AQE, not the threshold, be the real reason the under-threshold case broadcasts?** No —
  `spark.sql.adaptive.enabled` is explicitly `false` for the whole session; the static planner
  alone decides the broadcast here, not a runtime AQE conversion.
- **Is the non-equi join's `BroadcastExchange` genuinely the same mechanism as the equi-join's, or
  could it be a coincidence of small table size alone?** The same small table (500 rows) is reused
  unchanged across all three claims; only the join condition's own shape changes between claim 1
  and claim 3, isolating the condition as the one variable that flips `BroadcastHashJoin` to
  `BroadcastNestedLoopJoin` while the broadcast decision itself stays the same.
- **Does forcing `spark.sql.autoBroadcastJoinThreshold` to -1 and back risk leaving later
  measurements in a different state?** No — the config is explicitly reset to its documented
  default (`10485760`) immediately after claim 2's measurement, confirmed by claim 3 showing a
  broadcast again under the restored default.
- **Is the 8 GB limit and the driver-OOM risk (claim named in `coverage.json`'s expert list)
  actually exercised, or only quoted?** Only quoted — disclosed directly in `coverage.json`'s
  syllabus mapping and expert list; deliberately exceeding 8 GB of driver-collected data, or
  staling out real table statistics to trigger the risk, is impractical and unsafe to reproduce in
  this local session, so the mechanism is sourced from `BroadcastExchangeExec`'s own code rather
  than independently measured.

No corrections were needed to `OUTLINE.md` beyond settling on a plain comparison (`<`) rather than
a more exotic non-equi condition as the cleanest way to flip the physical join strategy without
changing anything else about the measurement.
