# Fact-check — de.warehouse-versus-lakehouse-engine

| # | Claim | Backing |
|---|---|---|
| 1 | Snowflake bills virtual warehouse compute + cloud services for Iceberg tables | Yes, quoted verbatim (Snowflake, Iceberg tables) |
| 2 | Cross-region Snowflake external volume incurs egress cost | Yes, quoted verbatim (Snowflake, Iceberg tables) |
| 3 | Snowflake multi-cluster warehouses scale for concurrency, not slow queries | Yes, quoted verbatim (Snowflake, Multi-cluster warehouses) |
| 4 | Snowflake Automatic Clustering manages reclustering without admin action | Yes, quoted verbatim (Snowflake, Automatic Clustering) |
| 5 | BigQuery recommends co-located single-region buckets to avoid transfer charges | Yes, quoted verbatim (Google Cloud, BigQuery tables for Apache Iceberg) |
| 6 | BigQuery managed Iceberg tables get automatic storage optimization | Yes, quoted verbatim (Google Cloud, BigQuery tables for Apache Iceberg) |
| 7 | BigQuery managed Iceberg tables support column/row-level security and data masking | Yes, quoted verbatim (Google Cloud, BigQuery tables for Apache Iceberg) |
| 8 | BigQuery on-demand gives ~2,000 concurrent slots shared per project | Yes, quoted verbatim (Google Cloud, BigQuery pricing) |
| 9 | BigQuery on-demand rate is $6.25 per TiB (1 TiB and above) | Yes, quoted verbatim (Google Cloud, BigQuery pricing) |
| 10 | Redshift Spectrum bills per byte scanned | Yes, quoted verbatim (AWS, Amazon Redshift pricing) |
| 11 | Redshift Spectrum rounds to the next MB, 10 MB minimum per query | Yes, quoted verbatim (AWS, Amazon Redshift pricing) |
| 12 | Redshift Spectrum example: 4 TB scanned costs $20 at $5/TB | Yes, quoted verbatim (AWS, Amazon Redshift pricing) |
| 13 | Redshift Concurrency Scaling gives ~1 free credit-hour/day per cluster | Yes, quoted verbatim (AWS, Amazon Redshift pricing) |
| 14 | Redshift Automatic table optimization chooses sort/distribution keys with AI, no admin needed | Yes, quoted verbatim (AWS, Automatic table optimization) |
| 15 | Trino cost-based join enumeration uses connector table statistics | Yes, quoted verbatim (Trino, Cost-based optimizations) |
| 16 | Trino cost-based join distribution selection picks partitioned vs. broadcast automatically | Yes, quoted verbatim (Trino, Cost-based optimizations) |
| 17 | ClickHouse Cloud limits 1000 concurrent queries per replica, no QPS limit | Yes, quoted verbatim (ClickHouse, ClickHouse Cloud architecture) |
| 18 | ClickHouse MergeTree primary key column count is not explicitly limited | Yes, quoted verbatim (ClickHouse, MergeTree table engine) |
| 19 | DuckDB supports out-of-core / larger-than-memory processing | Yes, quoted verbatim (DuckDB, Tuning Workloads) |
| 20 | DuckDB parallelizes by row group | Yes, quoted verbatim (DuckDB, Tuning Workloads) |
| 21 | `examples.py`'s DuckDB-over-Iceberg bytes-scanned figure and derived cost estimates | Yes, real executed output of this script, not narrated |

## Red team

No Snowflake, BigQuery, or Redshift account exists in this sandbox, and no real multi-node Trino
or ClickHouse cluster runs here — same constraint as topics 34-39. Every warehouse-side claim
above is a sourced quote, not an executed query against that vendor. The one executed number is
`examples.py`'s own real DuckDB `EXPLAIN ANALYZE` bytes-read figure against a real local Iceberg
table it builds itself. Applying BigQuery's and Redshift's own published per-byte rates to that
real number produces a cost *estimate*, not a warehouse bill — disclosed as exactly that mix
throughout, including in the reel's own narration. Snowflake bills compute time, not bytes
scanned, so no comparable per-byte estimate is computed for it; this is reported as a real
structural difference between the three warehouses' pricing models, not a missing data point.

## Scope boundary

Synthesizes the five named comparison dimensions across six engines already taught in this
chapter (topics 19-39); does not re-derive any engine's internals, and does not build a full
total-cost-of-ownership model including storage, networking, or operational staff time — a
20-minute capstone names that boundary rather than quietly ignoring it.
