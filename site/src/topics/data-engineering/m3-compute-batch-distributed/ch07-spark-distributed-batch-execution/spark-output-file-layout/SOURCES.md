# Sources: de.spark-output-file-layout

## Spark source, `RebalancePartitions` (in `basicLogicalOperators.scala`)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/logical/basicLogicalOperators.scala
Version: GitHub tag v4.0.0

Note: CHAPTER.md names this source as a standalone file, `RebalancePartitions.scala`. No such
file exists in the repo at this tag — the `RebalancePartitions` case class lives inside the
shared `basicLogicalOperators.scala`, alongside `Project`, `Filter`, `Repartition` and the other
core logical plan nodes. Substituted the correct path, same class.

> This operator is used to rebalance the output partitions of the given `child`, so that every

> partition is of a reasonable size (not too small and not too big). It also try its best to

> partition the child output by `partitionExpressions`. If there are skews, Spark will split the

> skewed partitions, to make these partitions not too big. This operator is useful when you need

> to write the result of `child` to a table, to avoid too small/big files.

> Note that, this operator only makes sense when AQE is enabled.

### Contents (item by item):

1. The operator's own doc comment, naming exactly what the measured `REBALANCE(k)` run shows:
   rebalancing by the given partition expressions, splitting skewed partitions rather than just
   coalescing, specifically to avoid small/big files at write time.
2. The source's own explicit precondition — "only makes sense when AQE is enabled" — matching
   this topic's own measured finding that the hint has zero effect with AQE off.

## Spark SQL "Hints" docs

URL: https://spark.apache.org/docs/4.0.0/sql-ref-syntax-qry-select-hints.html
Version: Spark 4.0.0 documentation

> The REBALANCE hint can be used to rebalance the query result output partitions, so that every
> partition is of a reasonable size (not too small and not too big). It can take column names as
> parameters, and try its best to partition the query result by these columns. This is a
> best-effort: if there are skews, Spark will split the skewed partitions, to make these
> partitions not too big. This hint is useful when you need to write the result of this query to
> a table, to avoid too small/big files. This hint is ignored if AQE is not enabled.

### Contents (item by item):

3. The user-facing hint docs, confirming `REBALANCE` and `REBALANCE(col)` are both valid forms
   and that the hint is silently ignored without AQE — the exact behavior measured in
   `examples.py` (128 files with AQE off, same hint).

## Spark configuration docs

URL: https://spark.apache.org/docs/4.0.0/configuration.html
Version: Spark 4.0.0 documentation

> Maximum number of records to write out to a single file. If this value is zero or negative,
> there is no limit.

### Contents (item by item):

4. `spark.sql.files.maxRecordsPerFile`'s own one-line description and default (`0`, meaning no
   limit) — the config this topic's `examples.py` sets via the `maxRecordsPerFile` write option
   and measures directly as a per-file row cap independent of task count.
