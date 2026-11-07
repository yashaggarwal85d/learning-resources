# Sources

## PostgreSQL manual, "User-Defined Aggregates" (Partial Aggregation)

URL: https://www.postgresql.org/docs/current/xaggr.html
Version: PostgreSQL 18 documentation, fetched 2026-11-07.

> The idea of partial aggregation is to run the aggregate's state transition function over different subsets of the input data independently, and then to combine the state values resulting from those subsets to produce the same state value that would have resulted from scanning all the input in a single operation.

> It is unspecified what the relative order of the input rows from the two sets would have been. This means that it's usually impossible to define a useful combine function for aggregates that are sensitive to input row order.

> MAX and MIN aggregates can be made to support partial aggregation by specifying the combine function as the same greater-of-two or lesser-of-two comparison function that is used as their transition function. SUM aggregates just need an addition function as combine function.

## Apache Spark, `HyperLogLogPlusPlus.scala`

URL: https://raw.githubusercontent.com/apache/spark/master/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/expressions/aggregate/HyperLogLogPlusPlus.scala
Version: `master` branch, fetched 2026-11-07.

> HyperLogLog++ (HLL++) is a state of the art cardinality estimation algorithm.

> _FUNC_(expr[, relativeSD]) - Returns the estimated cardinality by HyperLogLog++.

> relativeSD - An optional double literal for the maximum relative standard deviation allowed. Defaults to 0.05.

## Google BigQuery, "HyperLogLog++ functions"

URL: https://cloud.google.com/bigquery/docs/reference/standard-sql/hll_functions
Version: fetched 2026-11-07.

> HLL++ functions are approximate aggregate functions. Approximate aggregation typically uses fewer resources than exact aggregation functions, like COUNT(DISTINCT), but also introduces statistical error.

> Merges HLL++ sketches of the same underlying type into a new sketch, and then gets the cardinality of the new sketch.

> Merges HLL++ sketches of the same underlying type into a new sketch.

> If the merged sketches were initialized with different precisions, the precision will be downgraded to the lowest precision involved in the merge.

## Apache Spark, `QuantileSummaries.scala`

URL: https://raw.githubusercontent.com/apache/spark/master/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/util/QuantileSummaries.scala
Version: `master` branch, fetched 2026-11-07.

> "Space-efficient Online Computation of Quantile Summaries" by Greenwald, Michael

## Apache Spark SQL, built-in aggregate functions reference

URL: https://spark.apache.org/docs/latest/api/sql/agg-functions/index.html
Version: Spark 4.2.0 documentation, fetched 2026-11-07.

> The accuracy parameter (default: 10000) is a positive numeric literal which controls approximation accuracy at the cost of memory. Higher value of accuracy yields better accuracy, 1.0/accuracy is the relative error of the approximation.

> The optional k parameter controls the size and accuracy of the sketch (default 200, range 8-65535).

> hll_sketch_agg(expr, lgConfigK) - Returns the HllSketch's updatable binary representation.

> allowDifferentLgConfigK (optional) Allow sketches with different lgConfigK values to be unioned (defaults to false).

## Apache Spark, `Partitioner.scala` (`RangePartitioner.sketch`)

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/Partitioner.scala
Version: `master` branch, fetched 2026-11-07.

> Sketches the input RDD via reservoir sampling on each partition.

> This is the sample size we need to have roughly balanced output partitions, capped at 1M.

> Assume the input partitions are roughly balanced and over-sample a little bit.

> val samplePointsPerPartitionHint: Int = 20

## Apache Druid, "DataSketches extension"

URL: https://druid.apache.org/docs/latest/development/extensions-core/datasketches-extension/
Version: fetched 2026-11-07.

> Sketches are data structures implementing approximate streaming mergeable algorithms.

> Sketches can be stored in Druid segments as additive metrics.
