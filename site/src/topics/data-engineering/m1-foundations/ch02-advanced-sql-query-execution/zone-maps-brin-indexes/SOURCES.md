Fetched: 2026-10-22.

## PostgreSQL 18 documentation, §11.2.6 "BRIN"
URL: https://www.postgresql.org/docs/18/indexes-types.html
> BRIN indexes (a shorthand for Block Range INdexes) store summaries about the values stored in consecutive physical block ranges of a table. Thus, they are most effective for columns whose values are well-correlated with the physical order of the table rows.

## PostgreSQL 18 documentation, §65.5 "BRIN Indexes"
URL: https://www.postgresql.org/docs/18/brin.html
> BRIN stands for Block Range Index. BRIN is designed for handling very large tables in which certain columns have some natural correlation with their physical location within the table.

> BRIN works in terms of block ranges (or "page ranges"). A block range is a group of pages that are physically adjacent in the table; for each block range, some summary info is stored by the index.

> BRIN indexes can satisfy queries via regular bitmap index scans, and will return all tuples in all pages within each range if the summary info stored by the index is consistent with the query conditions. The query executor is in charge of rechecking these tuples and discarding those that do not match the query conditions — in other words, these indexes are lossy. Because a BRIN index is very small, scanning the index adds little overhead compared to a sequential scan, but may avoid scanning large parts of the table that are known not to contain matching tuples.

> Data types having a linear sort order can have operator classes that store the minimum and maximum value within each block range, for instance; geometrical types might store the bounding box for all the objects in the block range.

> The size of the block range is determined at index creation time by the pages_per_range storage parameter. The number of index entries will be equal to the size of the relation in pages divided by the selected value for pages_per_range. Therefore, the smaller the number, the larger the index becomes (because of the need to store more index entries), but at the same time the summary data stored can be more precise and more data blocks can be skipped during an index scan.

## Snowflake documentation, "Micro-partitions & Data Clustering"
URL: https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions
> Snowflake stores metadata about all rows stored in a micro-partition, including: The range of values for each of the columns in the micro-partition.

> In other words, a query that specifies a filter predicate on a range of values that accesses 10% of the values in the range should ideally only scan 10% of the micro-partitions.

> Typically, data stored in tables is sorted/ordered along natural dimensions (e.g. date and/or geographic regions). This "clustering" is a key factor in queries because table data that is not sorted or is only partially sorted may impact query performance, particularly on very large tables.

## Measured directly
URL: n/a — executed locally, not a web source.

**Storage size, PostgreSQL 16.15.** A two-million-row table with `order_date` loaded in natural insertion order (correlated with physical position). A BRIN index on that column: `pg_relation_size` 24,576 bytes. A B-tree index on the identical column, same data: `pg_relation_size` 14,655,488 bytes — about 596 times larger than the BRIN index, for the same column.

**Correlated column, equality filter, PostgreSQL 16.15.** With only the BRIN index on `order_date` present (sequential scan disabled), `EXPLAIN (ANALYZE, BUFFERS)` for an equality filter reports `Buffers: shared hit=15`, `Execution Time: 0.140 ms`. The identical query with no index at all (forced sequential scan): `Buffers: shared hit=10811`, `Execution Time: 116.638 ms` — about 720 times more buffers and about 833 times slower.

**Uncorrelated column, equality filter, PostgreSQL 16.15, same rows.** A second column, `random_id`, loaded as a uniformly random integer with no relationship to physical row position. With a BRIN index on `random_id`, the same kind of equality filter reports `Buffers: shared hit=10826`, `Execution Time: 200.129 ms`, with `Heap Blocks: lossy=10811` — essentially every block in the table gets rechecked. The identical query with no index at all (forced sequential scan): `Buffers: shared hit=10811`, `Execution Time: 100.469 ms`. The BRIN index touches essentially the same number of blocks as a full scan, and its recheck overhead makes it slightly slower than skipping the index entirely.
