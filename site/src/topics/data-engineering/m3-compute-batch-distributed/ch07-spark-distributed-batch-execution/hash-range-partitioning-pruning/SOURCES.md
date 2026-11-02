## partitioning.scala (Apache Spark source, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/physical/partitioning.scala
Version: v4.0.0 tag

> Represents a partitioning where rows are split up across partitions based on the hash

> of `expressions`. All rows where `expressions` evaluate to the same values are guaranteed to be

> in the same partition.

> Represents a partitioning where rows are split across partitions based on some total ordering of

> the expressions specified in `ordering`.

Contents (item by item):
1. `HashPartitioning`'s own scaladoc states directly what `groupBy`'s plan-text marker confirms: rows land in the same partition purely by the hash of the partitioning expressions.
2. `RangePartitioning`'s own scaladoc states the second partitioner's own mechanism: a total ordering, not a hash — the signal `orderBy`'s own plan carries instead.

## Parquet Files — Partition Discovery (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-data-sources-parquet.html
Version: 4.3.0 (current "latest" docs at fetch time; Hive-style partition discovery behaviour unchanged since 4.0)

> Table partitioning is a common optimization approach used in systems like Hive. In a partitioned

> table, data are usually stored in different directories, with partitioning column values encoded in

> the path of each partition directory.

Contents (item by item):
1. States directly the Hive-style directory layout this topic's own static pruning measurement depends on: partitioning column values encoded in the directory path itself, which is exactly what lets a filter on that column skip whole directories before reading any file.

## SupportsPushDownFilters.java (Apache Spark source, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/catalyst/src/main/java/org/apache/spark/sql/connector/read/SupportsPushDownFilters.java
Version: v4.0.0 tag

> A mix-in interface for {@link ScanBuilder}. Data sources can implement this interface to

> push down filters to the data source and reduce the size of the data to be read.

Contents (item by item):
1. Names the DSv2 interface directly behind the syllabus's own "DSv2 partition-stats filtering" clause: a data source implements this interface specifically to reduce how much data a scan actually reads, the same goal this topic's own static-pruning measurement demonstrates for a Hive-style layout.
