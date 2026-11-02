# Sources — de.orc-versus-parquet

## Apache ORC specification, `ORCv1.md`

URL: https://orc.apache.org/specification/ORCv1/
Version: orc.apache.org, rendered from `apache/orc`'s `main` branch, fetched 2026-10-31

> The body of ORC files consists of a series of stripes. Stripes are large (typically ~200MB) and independent of each other and are often processed by different tasks.

> In ORC files, each column is stored in several streams that are stored next to each other in the file. For example, an integer column is represented as two streams PRESENT, which uses one with a bit per value recording if the value is non-null, and DATA, which records the non-null values.

> To describe each stream, ORC stores the kind of stream, the column id, and the stream's size in bytes.

> The row group indexes consist of a ROW_INDEX stream for each primitive column that has an entry for each row group. Row groups are controlled by the writer and default to 10,000 rows. Each RowIndexEntry gives the position of each stream for the column and the statistics for that row group.

> The index streams are placed at the front of the stripe, because in the default case of streaming they do not need to be read. They are only loaded when either predicate push down is being used or the reader seeks to a particular row.

> Bloom Filters are added to ORC indexes from Hive 1.2.0 onwards. Predicate pushdown can make use of bloom filters to better prune the row groups that do not satisfy the filter condition.

## Apache Hive, ACID and Transactions

URL: https://cwiki.apache.org/confluence/display/Hive/Hive+Transactions
Version: Hive wiki (Confluence), fetched 2026-10-31

> ACID stands for four traits of database transactions:  Atomicity (an operation either succeeds completely or fails, it does not leave partial data), Consistency (once an application performs an operation the results of that operation are visible to it in every subsequent operation), Isolation (an incomplete operation by one user does not cause unexpected side effects for other users), and Durability (once an operation is complete it will be preserved even in the face of machine or system failure).

> Up until Hive 0.13, atomicity, consistency, and durability were provided at the partition level.  Isolation could be provided by turning on one of the available locking mechanisms (ZooKeeper or in memory).  With the addition of transactions in Hive 0.13 it is now possible to provide full ACID semantics at the row level, so that one application can add rows while another reads from the same partition without interfering with each other.

> Only ORC file format is supported in this first release.  The feature has been built such that transactions can be used by any storage format that can determine how updates or deletes apply to base records (basically, that has an explicit or implicit row id), but so far the integration work has only been done for ORC.

> Tables must be bucketed to make use of these features.  Tables in the same system not using transactions and ACID do not need to be bucketed. External tables cannot be made ACID tables since the changes on external tables are beyond the control of the compactor (HIVE-13175).

> Compactor is a set of background processes running inside the Metastore to support ACID system.  It consists of Initiator, Worker, Cleaner, AcidHouseKeeperService and a few others.

## Apache Parquet project documentation

URL: https://parquet.apache.org/docs/overview/
Version: parquet.apache.org, fetched 2026-10-31

> Apache Parquet is an open source, column-oriented data file format designed for efficient data storage and retrieval. It provides high performance compression and encoding schemes to handle complex data in bulk and is supported in many programming languages and analytics tools.

> The Parquet ecosystem is rich and varied, encompassing a wide array of tools, libraries, and clients, each offering different levels of feature support.

## Apache Parquet project documentation — Motivation

URL: https://parquet.apache.org/docs/overview/motivation/
Version: parquet.apache.org, fetched 2026-10-31

> We created Parquet to make the advantages of compressed, efficient columnar data representation available to any project in the Hadoop ecosystem.

> Parquet is built to be used by anyone. The Hadoop ecosystem is rich with data processing frameworks, and we are not interested in playing favorites. We believe that an efficient, well-implemented columnar storage substrate should be useful to all frameworks without the cost of extensive and difficult to set up dependencies.
