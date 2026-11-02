# Sources: de.broadcast-hash-join

## Performance Tuning — Automatically Broadcasting Joins / Join Strategy Hints (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html
Version: 4.3.0 (current "latest" docs at fetch time; `autoBroadcastJoinThreshold` and the hint mechanism unchanged since 4.0)

> Configures the maximum size in bytes for a table that will be broadcast to all worker nodes when

> performing a join. By setting this value to -1, broadcasting can be disabled.

> The join strategy hints, namely BROADCAST, MERGE, SHUFFLE_HASH and SHUFFLE_REPLICATE_NL,

> instruct Spark to use the hinted strategy on each specified relation when joining them with another

> relation. For example, when the BROADCAST hint is used on table ‘t1’, broadcast join (either

> broadcast hash join or broadcast nested loop join depending on whether there is any equi-join key)

> with ‘t1’ as the build side will be prioritized by Spark even if the size of table ‘t1’ suggested

> by the statistics is above the configuration spark.sql.autoBroadcastJoinThreshold.

Contents (item by item):
1. `autoBroadcastJoinThreshold`'s own purpose and default (10 MB) — the exact knob this topic's own `examples.py` sets to `-1` to force the fallback measured in claim 2.
2. The join hints' own existence and priority order, naming `BROADCAST` as the hint that overrides the size-based threshold entirely — disclosed as sourced-only, since this topic's own `examples.py` measures the threshold crossing itself, not the hint override.
3. The source's own confirmation, stated directly, that the same `BROADCAST` hint produces either a broadcast hash join or a broadcast nested-loop join depending on whether an equi-join key exists — the exact contrast this topic's own claim 3 measures without the hint, purely from the join condition's own shape.

## BroadcastHashJoinExec.scala (Apache Spark source, GitHub, tag v4.0.0)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/BroadcastHashJoinExec.scala
Version: v4.0.0 tag

> Performs an inner hash join of two child relations. When the output RDD of this operator is

> being constructed, a Spark job is asynchronously started to calculate the values for the

> broadcast relation. This data is then placed in a Spark broadcast variable. The streamed

> relation is not shuffled.

Contents (item by item):
1. `BroadcastHashJoinExec`'s own scaladoc states directly what this topic's own claim 1 measures: the "streamed" (large) relation is never shuffled at all once the small side is broadcast.

## BroadcastExchangeExec.scala (Apache Spark source, GitHub, tag v4.0.0)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/exchange/BroadcastExchangeExec.scala
Version: v4.0.0 tag

> A [[BroadcastExchangeExec]] collects, transforms and finally broadcasts the result of

> a transformed SparkPlan.

Contents (item by item):
1. `BroadcastExchangeExec`'s own scaladoc names the three-step mechanism directly: collect the small side's rows to the driver, transform them into a lookup structure, then broadcast that structure to every executor — the exact mechanism behind why a broadcast with stale, too-large statistics risks the driver's own memory, named here and disclosed as sourced-only since this topic's own `examples.py` does not deliberately drive the driver toward OOM.
