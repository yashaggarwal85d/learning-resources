# Sources: de.bucketing-storage-partitioned-joins

## Generic Load/Save Functions — Bucketing, Sorting and Partitioning (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-data-sources-load-save-functions.html
Version: 4.3.0 (current "latest" docs at fetch time; `bucketBy`'s own behaviour unchanged since 4.0)

> Bucketing and sorting are applicable only to persistent tables:

> bucketBy distributes

> data across a fixed number of buckets and can be used when the number of unique values is unbounded.

Contents (item by item):
1. Bucketing requires writing a real persistent table (`saveAsTable`), not an ad hoc `save` — the mechanism this topic's own `examples.py` builds against.
2. `bucketBy`'s own purpose: splitting rows across a fixed number of buckets at write time, by the column's hash, so a later join on that column can reuse the split instead of re-shuffling.

## Performance Tuning — Storage Partition Join (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html
Version: 4.3.0 (current "latest" docs at fetch time; SPJ itself shipped in 3.3-3.4 and is stable through 4.0)

> Storage Partition Join (SPJ) is an optimization technique in Spark SQL that makes use of the existing storage layout to avoid the shuffle phase.

> This is a generalization of the concept of Bucket Joins, which is only applicable for bucketed tables, to tables partitioned by functions registered in FunctionCatalog. Storage Partition Joins are currently supported for compatible V2 DataSources.

> If Storage Partition Join is performed, the query plan will not contain Exchange nodes prior to the join.

Contents (item by item):
1. SPJ's own definition, naming it directly as the mechanism that reuses an existing storage layout instead of shuffling.
2. SPJ is explicitly a generalization of classic Hive bucketing to DSv2 sources whose own catalog reports a partitioning function — not the same mechanism as `bucketBy`, a related one.
3. SPJ's own observable signal in a real plan: no Exchange node before the join, the DSv2 analogue of this topic's own measured bucketed-join result.

## partitioning.scala (Apache Spark source, GitHub, tag v4.0.0)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/physical/partitioning.scala
Version: v4.0.0 tag

> Represents a partitioning where rows are split across partitions based on transforms defined

> by `expressions`.

Contents (item by item):
1. `KeyGroupedPartitioning`'s own scaladoc: SPJ's partitioning is keyed on a data source's own reported transform expressions, not a hash of a join column computed by Spark itself the way classic bucketing is.
