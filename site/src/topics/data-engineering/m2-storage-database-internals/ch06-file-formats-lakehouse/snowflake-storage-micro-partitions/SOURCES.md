# Sources — de.snowflake-storage-micro-partitions

All quotes fetched 2 November 2026 from Snowflake's own current documentation (`docs.snowflake.com`).

## Snowflake docs, Micro-Partitions & Data Clustering
URL: https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions
Version: fetched 2026-11-02

> All data in Snowflake tables is automatically divided into micro-partitions, which are contiguous units of storage. Each micro-partition contains between 50 MB and 500 MB of uncompressed data (note that the actual size in Snowflake is smaller because data is always stored compressed).

> In contrast to traditional static partitioning, Snowflake micro-partitions are derived automatically; they don't need to be explicitly defined up-front or maintained by users.

> The micro-partition metadata maintained by Snowflake enables precise pruning of columns in micro-partitions at query run-time, including columns containing semi-structured data.

> Snowflake maintains clustering metadata for the micro-partitions in a table, including: The total number of micro-partitions that comprise the table. The number of micro-partitions containing values that overlap with each other (in a specified subset of table columns). The depth of the overlapping micro-partitions.

> The clustering depth for a populated table measures the average depth (1 or greater) of the overlapping micro-partitions for specified columns in a table. The smaller the average depth, the better clustered the table is with regards to the specified columns.

> A table with no micro-partitions (i.e. an unpopulated/empty table) has a clustering depth of 0.

## Snowflake docs, Automatic Clustering
URL: https://docs.snowflake.com/en/user-guide/tables-auto-reclustering
Version: fetched 2026-11-02

> Automatic Clustering is the Snowflake service that seamlessly and continually manages all reclustering, as needed, of clustered tables.

> You can suspend and resume Automatic Clustering for a clustered table at any time using ALTER TABLE … SUSPEND / RESUME RECLUSTER.

> Automatic Clustering consumes Snowflake credits, but does not require you to provide a virtual warehouse. Instead, Snowflake internally manages and achieves efficient resource utilization for reclustering the tables.

## Snowflake docs, Speeding up queries of structured data with search optimization
URL: https://docs.snowflake.com/en/user-guide/search-optimization/structured-queries
Version: fetched 2026-11-02

> The search optimization service can improve the performance of point-lookup and substring queries on structured data in Snowflake tables

## Snowflake docs, Understanding & using Time Travel
URL: https://docs.snowflake.com/en/user-guide/data-time-travel
Version: fetched 2026-11-02

> Snowflake Time Travel enables accessing historical data (that is, data that has been changed or deleted) at any point within a defined period.

> The standard retention period is 1 day (24 hours) and is automatically enabled for all Snowflake accounts

> For permanent databases, schemas, and tables, the retention period can be set to any value from 0 up to 90 days.

> When the retention period ends for an object, the historical data is moved into Snowflake Fail-safe

## Snowflake docs, Understanding and viewing Fail-safe
URL: https://docs.snowflake.com/en/user-guide/data-failsafe
Version: fetched 2026-11-02

> Fail-safe provides a (non-configurable) 7-day period during which historical data may be recoverable by Snowflake.

> Fail-safe is a data recovery service that is provided on a best effort basis and is intended only for use when all other recovery options have been attempted.

> Data recovery through Fail-safe may take from several hours to several days to complete.

> To recover data from Fail-safe, open a case with Snowflake Support.

## Snowflake docs, Cloning considerations

URL: https://docs.snowflake.com/en/user-guide/object-clone
Version: fetched 2026-11-02

> clones share the same underlying storage as the source table.

> A table can have a subset of columns designated as a clustering key to co-locate similar rows in the same micro-partition.

## Snowflake docs, About Secure Data Sharing
URL: https://docs.snowflake.com/en/user-guide/data-sharing-intro
Version: fetched 2026-11-02

> Secure Data Sharing lets you share selected objects in a database in your account with other Snowflake accounts.

> With Secure Data Sharing, no actual data is copied or transferred between accounts. All sharing uses Snowflake's services layer and metadata store.

> All database objects shared between accounts are read-only (i.e. the objects cannot be modified or deleted, including adding or modifying table data).

> Shares are named Snowflake objects that encapsulate all of the information required to share a database.

### Red team

This topic is disclosed as sourced-only throughout: this sandbox has no Snowflake account, so
nothing here is a real execution, unlike topics 34-36. Every quoted figure above (50-500 MB,
1-day default retention, up to 90-day paid retention, the 7-day fail-safe window) is Snowflake's
own published current documentation, not a measurement. Zero-copy cloning's "shares the same
micro-partition" mechanism and secure data sharing's "no actual data is copied" claim are stated
directly from the docs' own wording; neither is independently verified by running a clone or a
share, since no Snowflake account is reachable here. The clustering-depth metaphor (five
micro-partitions ranging A-Z) is the docs' own conceptual diagram, not a number this topic
computed. The `cloning.txt` fetch returned the English page's nav/body mixed with no numeric
figures beyond mechanism descriptions, so this topic makes no quantitative claim about cloning
beyond "shares the source's storage, diverges only on new writes," which several quoted lines
support directly.
