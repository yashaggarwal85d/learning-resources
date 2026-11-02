# Sources — de.why-hive-style-tables

## Apache Hive: "LanguageManual DDL"

URL: https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL
Version: Apache Hive wiki, fetched 2026-10-31

> Partitioned tables can be created using the PARTITIONED BY clause.

> A table can have one or more partition columns and a separate data directory is created for each distinct value combination in the partition columns.

## Thusoo et al., "Hive — A Warehousing Solution Over a Map-Reduce Framework" (VLDB 2009)

URL: https://www.vldb.org/pvldb/vol2/vldb09-938.pdf
Version: VLDB Endowment vol. 2, 2009

> Partitions - Each table can have one or more partitions which determine the distribution of data within sub-directories of the table directory.

> Suppose data for table T is in the directory /wh/T.

> If T is partitioned on columns ds and ctry, then data with a particular ds value 20090101 and ctry value US, will be stored in files within the directory /wh/T/ds=20090101/ctry=US.

> Each bucket is stored as a file in the partition directory.

## Cloudera: "Partition refresh and configuration" (CDP Private Cloud Base docs)

URL: https://docs.cloudera.com/cdp-private-cloud-base/latest/using-hiveql/topics/hive-manage-partitions.html
Version: Cloudera CDP Private Cloud Base documentation, fetched 2026-10-31

> After creating a partitioned table, Hive does not update metadata about corresponding objects or directories on the file system that you add or drop.

> The partition metadata in the Hive metastore becomes stale after corresponding objects/directories are added or deleted.

> The time it takes to refresh the partition information is proportional to the number of partitions involved.

> This command triggers a full repair which might take a longer time if the number of partitions are more.

> The Hive metastore acquires an exclusive lock on a table that enables partition discovery that can slow down other queries.

## Apache Hive: "Hive Transactions"

URL: https://cwiki.apache.org/confluence/display/Hive/Hive+Transactions
Version: Apache Hive wiki, fetched 2026-10-31

> Up until Hive 0.13, atomicity, consistency, and durability were provided at the partition level.

> These tools could stream data into existing partitions, but this would cause readers to get dirty reads (that is, they would see data written after they had started their queries) and leave many small files in their directories that would put pressure on the NameNode.

## Apache Iceberg: "Partitioning" docs, "Problems with Hive partitioning"

URL: https://iceberg.apache.org/docs/latest/partitioning/
Version: Apache Iceberg documentation, fetched 2026-10-31

> Hive can't validate partition values -- it is up to the writer to produce the correct value

> Working queries are tied to the table's partitioning scheme, so partitioning configuration cannot be changed without breaking queries
