# References

- PostgreSQL, "tuplesort.c, nodeAgg.c", source code, `master` branch.
  [tuplesort.c](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/utils/sort/tuplesort.c)
  — fetched 2026-11-05. Read for the balanced merge, run generation, prereading, the on-the-fly
  final merge, and the hash-partitioned aggregation spill.
- Apache Spark, "SortMergeJoinExec.scala, TungstenAggregationIterator.scala,
  ExternalSorter.scala", source code, `master` branch.
  [SortMergeJoinExec.scala](https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/SortMergeJoinExec.scala)
  — fetched 2026-11-05. Read for the sort-merge join's buffered-match spill, the hash-to-sort
  aggregation fallback, and the external sorter behind a key-ordered shuffle read.
- Chapter 15, "External merge sort", syllabus title, not yet a published topic at build time,
  confirmed by checking `registry.ts` directly. Named as the textbook algorithm this topic's
  production systems are a version of; not read as a source since it has no published plan or
  reel yet.

Last verified: 2026-11-05. Expert sign-off: pending.
