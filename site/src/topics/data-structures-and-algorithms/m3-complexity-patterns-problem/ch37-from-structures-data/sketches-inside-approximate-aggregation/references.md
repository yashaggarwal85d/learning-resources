# References

- PostgreSQL, "User-Defined Aggregates" (36.12.4 Partial Aggregation), PostgreSQL 18 documentation.
  [xaggr.html](https://www.postgresql.org/docs/current/xaggr.html) — fetched 2026-11-07. Read for
  the combine-function contract and the MAX/MIN/SUM examples.
- Apache Spark, `HyperLogLogPlusPlus.scala`, `master` branch.
  [HyperLogLogPlusPlus.scala](https://raw.githubusercontent.com/apache/spark/master/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/expressions/aggregate/HyperLogLogPlusPlus.scala)
  — fetched 2026-11-07. Read for `approx_count_distinct`'s description and `relativeSD` default.
- Google Cloud, "HyperLogLog++ functions", BigQuery documentation.
  [hll_functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/hll_functions) —
  fetched 2026-11-07. Read for the sketch-as-value design and the merge functions' semantics.
- Apache Spark, `QuantileSummaries.scala`, `master` branch.
  [QuantileSummaries.scala](https://raw.githubusercontent.com/apache/spark/master/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/util/QuantileSummaries.scala)
  — fetched 2026-11-07. Read for the Greenwald-Khanna citation and the `merge` method.
- Apache Spark SQL, built-in aggregate functions reference, 4.2.0 documentation.
  [agg-functions](https://spark.apache.org/docs/latest/api/sql/agg-functions/index.html) — fetched
  2026-11-07. Read for `percentile_approx`'s accuracy default and the `kll_sketch_agg`/`hll_sketch_agg`
  family's defaults.
- Apache Spark, `Partitioner.scala` (`RangePartitioner` and `RangePartitioner.sketch`), `master` branch.
  [Partitioner.scala](https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/Partitioner.scala)
  — fetched 2026-11-07. Read for the reservoir-sampling sketch, the oversampling factor and the
  sample-size cap.
- Apache Druid, "DataSketches extension", Druid documentation.
  [datasketches-extension](https://druid.apache.org/docs/latest/development/extensions-core/datasketches-extension/)
  — fetched 2026-11-07. Read for the list of mergeable sketch types Druid ships.
- Chapter 12 (Bloom filters), Chapter 37 topics 117, 119 and 123, this site's own live or held
  topics — read 2026-11-07 for the Bloom filter, the distributed top-N merge shape and the
  partitioned-stream placement schemes this topic assumes rather than repeats.

Last verified: 2026-11-07. Expert sign-off: pending.
