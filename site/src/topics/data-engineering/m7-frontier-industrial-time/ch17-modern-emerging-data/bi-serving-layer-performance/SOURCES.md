## Google Cloud documentation — Introduction to BI Engine

URL: https://docs.cloud.google.com/bigquery/docs/bi-engine-intro

> BigQuery BI Engine is a fast, in-memory analysis service that accelerates many SQL queries in BigQuery by intelligently caching the data that you use most frequently.

> BI Engine preferred tables let you limit BI Engine acceleration to a specified set of tables. Queries to all other tables use regular BigQuery slots. For example, with preferred tables you can accelerate only the tables and dashboards that you identify as important to your business.

> Leaf-level subqueries: BI Engine is most optimized for leaf-level subqueries that scan data from storage and perform operations such as filtering, computation, aggregation, sorting (ORDER BY), and supported joins.

> Fallback execution: query stages or subqueries that can't be accelerated by BI Engine automatically fall back to standard BigQuery execution slots without failing the query.

> BI Engine accelerates certain types of join queries. Acceleration happens on leaf-level subqueries with INNER and LEFT OUTER joins, where a large fact table is joined with up to four smaller dimension tables.

> JSON type columns aren't supported and aren't accelerated by BI Engine.

> You use wildcards in your queries: queries referencing wildcard tables aren't supported by BI Engine and don't benefit from acceleration.

> You require BigQuery features unsupported by BI Engine: while BI Engine supports most SQL functions and operators, unsupported features include external tables, row-level security, and non-SQL user-defined functions.

## Databricks documentation — Optimize performance with caching on Databricks

URL: https://docs.databricks.com/aws/en/optimizations/disk-cache

> Databricks uses disk caching to speed up data reads. When a node fetches a Parquet data file from remote storage, it automatically stores a copy on its local storage in a fast intermediate format. Later reads of the same data run locally and are significantly faster.

> In SQL warehouses and Databricks Runtime 14.2 and above, the CACHE SELECT command is ignored. An enhanced disk caching algorithm is used instead.

> The disk cache automatically detects when data files are created, deleted, modified, or overwritten and updates its content accordingly. You can write, modify, and delete table data with no need to explicitly invalidate cached data. Any stale entries are automatically invalidated and evicted from the cache.
