# Sources: de.shuffle-joins-sort-merge-hash

## SparkStrategies.scala — JoinSelection (Apache Spark source, GitHub, tag v4.0.0)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/SparkStrategies.scala
Version: v4.0.0 tag

> Shuffle hash join:

> Only supported for equi-joins, while the join keys do not need to be sortable.

> Supported for all join types.

> Building hash map from table is a memory-intensive operation and it could cause OOM

> when the build side is big.

> Pick shuffle hash join if one side is small enough to build local hash map, and is

> much smaller than the other side, and `spark.sql.join.preferSortMergeJoin` is false.

Contents (item by item):
1. `ShuffledHashJoinExec`'s own named danger, stated directly in the planner's own comment: building the hash map in memory can OOM when the build side is big — the mechanism behind the syllabus's "OOM-prone if the build side is skewed," disclosed as sourced-only since this topic's own `examples.py` never deliberately drives a build side toward OOM.
2. The planner's own rule for choosing shuffled hash at all: one side has to be small enough AND `spark.sql.join.preferSortMergeJoin` has to be false — explaining directly why this topic's own `examples.py` needs an explicit hint to see a `ShuffledHashJoin` at all between two equally large tables, since the default leaves `preferSortMergeJoin` true.

## SortMergeJoinExec.scala (Apache Spark source, GitHub, tag v4.0.0)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/SortMergeJoinExec.scala
Version: v4.0.0 tag

> Performs a sort merge join of two child relations.

Contents (item by item):
1. `SortMergeJoinExec`'s own scaladoc, naming the mechanism this topic's own claim 1 measures directly: both sides sorted, then merged, as a single physical operator.

## ShuffledHashJoinExec.scala (Apache Spark source, GitHub, tag v4.0.0)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/ShuffledHashJoinExec.scala
Version: v4.0.0 tag

> Performs a hash join of two child relations by first shuffling the data using the join keys.

Contents (item by item):
1. `ShuffledHashJoinExec`'s own scaladoc, naming the mechanism this topic's own claim 2 measures directly: the data is shuffled by the join keys, then a hash join runs on the shuffled result — no sort step anywhere, unlike `SortMergeJoinExec`.
