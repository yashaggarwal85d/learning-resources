Fetched: 2026-10-22.

## PostgreSQL 18 documentation, "REFRESH MATERIALIZED VIEW"
URL: https://www.postgresql.org/docs/18/sql-refreshmaterializedview.html
> REFRESH MATERIALIZED VIEW completely replaces the contents of a materialized view.

> Refresh the materialized view without locking out concurrent selects on the materialized view. Without this option a refresh which affects a lot of rows will tend to use fewer resources and complete more quickly, but could block other connections which are trying to read from the materialized view.

> This option is only allowed if there is at least one UNIQUE index on the materialized view which uses only column names and includes all rows; that is, it must not be an expression index or include a WHERE clause.

> Even with this option only one REFRESH at a time may run against any one materialized view.

## Snowflake documentation, "Dynamic tables"
URL: https://docs.snowflake.com/en/user-guide/dynamic-tables-about
> If the dynamic table uses an incremental refresh, only the rows that changed are computed. If it uses a full refresh, the entire result set is refreshed.

> Target lag. Target lag tells Snowflake how fresh the data must be. A target lag of 10 minutes means Snowflake tries to keep the data no more than 10 minutes behind the base tables, but actual lag can exceed the target when refreshes take longer than expected.

> Refresh modes. Dynamic tables support several refresh modes. INCREMENTAL processes only the rows that changed since the last refresh. FULL refreshes the entire result set. AUTO lets Snowflake choose at creation time based on whether the definition supports incremental refresh.

## Databricks documentation, "Incremental refresh for materialized views"
URL: https://docs.databricks.com/en/optimizations/incremental-refresh.html
> Incremental refresh on a materialized view detects changes in the source data and recomputes only the affected results, rather than recomputing the entire query.

> A full refresh always recalculates all inputs to the materialized view, and resets all checkpoints.

> Databricks applies a full or incremental refresh. The decision is based on which option is more cost-effective, and whether a query supports incremental refresh.

> Aggregations that sum floating-point values, such as SUM, AVG, and covariance, can produce non-deterministic results over FLOAT or DOUBLE columns and force a full refresh. Cast these columns to DECIMAL in the expression (for example, SUM(CAST(revenue AS DECIMAL(18,2)))) to allow incremental refresh.

## Measured directly
URL: n/a — executed locally, not a web source.

**Full refresh cost is insensitive to the size of the change, PostgreSQL 16.15.** A materialized view aggregating a three-million-row orders table by customer (`sum`, `count`, grouped by `customer_id`): a full `REFRESH MATERIALIZED VIEW` takes 973.776 ms. After inserting only ten new rows into the base table, the identical `REFRESH MATERIALIZED VIEW` on the same view takes 993.897 ms — essentially unchanged, because a full refresh recomputes the entire query regardless of how much data actually changed.

**Incremental maintenance of the same result, PostgreSQL 16.15.** A second, manually-maintained summary table holding the identical aggregate, kept current by an `AFTER INSERT` trigger that updates only the affected customer's row on each new order. Inserting the same ten new rows, trigger included, takes 5.536 ms — about 180 times less than the full refresh above, for maintaining the same information after the same change.

**REFRESH MATERIALIZED VIEW blocks concurrent reads; CONCURRENTLY does not, PostgreSQL 16.15, same materialized view.** A `SELECT count(*)` issued from a second session while a plain `REFRESH MATERIALIZED VIEW` is running on the first takes 861.419 ms — blocked until the refresh's exclusive lock is released. The identical `SELECT`, issued while `REFRESH MATERIALIZED VIEW CONCURRENTLY` is running instead, takes 4.671 ms — about 184 times faster, never blocked at all.
