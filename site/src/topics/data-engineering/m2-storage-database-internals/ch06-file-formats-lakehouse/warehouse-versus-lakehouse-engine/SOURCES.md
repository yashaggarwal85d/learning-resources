Fetched 2026-11-02. This topic closes §6.5 and Chapter 6 by synthesizing the three open engines
built in §6.4 (Trino, ClickHouse, DuckDB) against the three proprietary warehouses sourced in
§6.5 (Snowflake, BigQuery, Redshift), across workload isolation, concurrency/spilling,
cost-based tuning, data gravity/egress, and governance/lock-in. The `examples.py` lab is a real
DuckDB-over-Iceberg measurement: a real local Iceberg table, a real `EXPLAIN ANALYZE` bytes-read
figure, with the warehouse costs for scanning that identical byte count computed from each
vendor's own currently published per-byte price -- a sourced estimate applied to a real number,
never a literal rerun of a warehouse.

## Snowflake documentation, "Apache Iceberg tables"
URL: https://docs.snowflake.com/en/user-guide/tables-iceberg
Version: fetched 2026-11-02

> Snowflake bills your account for virtual warehouse (compute) usage and cloud services when you work with Iceberg tables.

> If your Snowflake account and external volume are in different regions, your external cloud storage account incurs egress costs when you query the table.

## Snowflake documentation, "Multi-cluster warehouses"
URL: https://docs.snowflake.com/en/user-guide/warehouses-multicluster
Version: fetched 2026-11-02

> Multi-cluster warehouses are best utilized for scaling resources to improve concurrency for users/queries. They are not as beneficial for improving the performance of slow-running queries or data loading.

## Snowflake documentation, "Automatic Clustering"
URL: https://docs.snowflake.com/en/user-guide/tables-auto-reclustering
Version: fetched 2026-11-02

> Automatic Clustering is the Snowflake service that seamlessly and continually manages all reclustering, as needed, of clustered tables.

## Google Cloud documentation, "BigQuery tables for Apache Iceberg"
URL: https://cloud.google.com/bigquery/docs/iceberg-tables
Version: fetched 2026-11-02

> Choose single-region Cloud Storage buckets that are colocated in the same region as your BigQuery dataset. This coordination improves performance and lowers costs by avoiding data transfer charges.

> Automatic storage optimization, including adaptive file sizing, automatic clustering, garbage collection, and metadata optimization.

> Column-level security, row-level security, and data masking.

## Google Cloud documentation, BigQuery pricing
URL: https://cloud.google.com/bigquery/pricing
Version: fetched 2026-11-02

> With on-demand pricing, you will generally have access to up to 2,000 concurrent slots, shared among all queries in a single project.

> 1 tebibyte and above
> $6.25 / 1 tebibyte, per 1 month / account

## Amazon Redshift pricing
URL: https://aws.amazon.com/redshift/pricing
Version: fetched 2026-11-02

> Amazon Redshift Spectrum pricing: Run SQL queries directly against the data in your Amazon S3 data lake, out to exabytes—you simply pay for the number of bytes scanned.

> You are charged for the number of bytes scanned by Redshift Spectrum, rounded up to the next megabyte, with a 10 MB minimum per query.

> This query would scan 4 TB and cost $20. ($5/TB x 4 TB = $20)

> Each cluster earns up to one hour of free Concurrency Scaling credits per day, which is sufficient for 97% of customers. This enables you to provide consistently fast performance, even with thousands of concurrent queries and users.

## Amazon Redshift documentation, "Automatic table optimization"
URL: https://docs.aws.amazon.com/redshift/latest/dg/t_Creating_tables.html
Version: fetched 2026-11-02

> Automatic table optimization continuously observes how queries interact with tables. It
 uses advanced artificial intelligence methods to choose sort and distribution keys to
 optimize performance for the cluster's workload.

## Trino documentation, "Cost-based optimizations"
URL: https://trino.io/docs/current/optimizer/cost-based-optimizations.html
Version: fetched 2026-11-02

> With cost-based join enumeration, Trino uses Table statistics provided by connectors to estimate the costs for different join orders and automatically picks the join order with the lowest computed costs.

> With cost-based join distribution selection, Trino automatically chooses whether to use a partitioned or broadcast join.

## ClickHouse documentation, "ClickHouse Cloud architecture"
URL: https://clickhouse.com/docs/cloud/reference/architecture
Version: fetched 2026-11-02

> There is no limit to the number of queries per second (QPS) in your ClickHouse Cloud service. There is, however, a limit of 1000 concurrent queries per replica.

## ClickHouse documentation, "MergeTree table engine"
URL: https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree
Version: fetched 2026-11-02

> The number of columns in the primary key is not explicitly limited. Depending on the data structure, you can include more or fewer columns in the primary key.

## DuckDB documentation, "Tuning Workloads"
URL: https://duckdb.org/docs/2.0/guides/performance/how_to_tune_workloads.html
Version: fetched 2026-11-02

> A key strength of DuckDB is support for larger-than-memory workloads, i.e., it is able to process datasets that are larger than the available system memory (also known as out-of-core processing).

> DuckDB parallelizes the workload based on row groups, i.e., groups of rows that are stored together at the storage level.

### Red team

This sandbox has no Snowflake, BigQuery, or Redshift account and no real multi-node Trino or
ClickHouse cluster -- confirmed the same way as topics 34-39 and documented in
[[learning-resources-ch6-engine-feasibility]]. The comparison table's warehouse cells and every
open-engine concurrency/governance claim are sourced, word-for-word, from each vendor's own
current documentation; no warehouse query is actually executed. The one number this topic
executes for real is the DuckDB-over-Iceberg bytes-scanned figure from `examples.py`'s own
`EXPLAIN ANALYZE` output, against a real local Iceberg table this script builds itself -- the
same `pyiceberg` + local-filesystem-warehouse pattern used in topics 31-33 and 36. Applying
BigQuery's $6.25/TiB and Redshift Spectrum's $5/TB published rates to that real bytes-scanned
number produces a sourced cost estimate grounded in a real measurement, disclosed as exactly
that combination, never presented as an executed warehouse bill. Snowflake's billing model
(virtual-warehouse compute time, not bytes scanned) has no equivalent per-byte rate to apply to
the same measurement, so no comparable dollar figure is computed for it -- this structural
difference (per-byte vs. per-compute-time metering) is itself one of the topic's points, not a
gap papered over.

ClickHouse's governance/lock-in position is inferred from the fact that MergeTree tables and the
Iceberg/Delta write paths this chapter already confirmed for ClickHouse (topic 31's support
matrix) are open formats with no vendor-specific catalog lock-in required -- the same open-format
argument topic 32 (choosing a table format and catalog) made directly, not a new claim.

### Scope boundary

Covers the five named comparison dimensions and the §6.5 lab's two-leg structure (one real
DuckDB-over-Iceberg measurement, several sourced warehouse-pricing estimates against the same
byte count). Does not re-derive each engine's internals (covered in topics 19-39) or attempt a
full TCO model with storage, networking, and operational-staff cost -- those are out of scope for
a 20-minute capstone and are named as such in the recap.
