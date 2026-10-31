## ClickHouse docs — "Materialized views" (index page)

URL: https://clickhouse.com/docs/materialized-view
Version: ClickHouse documentation, fetched 2026-10-31

> Allow users to shift the cost of computation from query time to insert time, resulting in faster SELECT queries.

> Conceptually similar to incremental materialized views but require the periodic execution of the query over the full dataset - the results of which are stored in a target table for querying.

Used for: pre-aggregation's own cost-shifting definition (incremental materialized views), and the
named freshness gap a periodically refreshed materialized view carries (refreshable materialized
views) — the engine's own words for both halves of this topic's freshness-vs-cost trade-off.

## Apache Druid docs — "Data rollup"

URL: https://druid.apache.org/docs/latest/ingestion/rollup/
Version: Apache Druid documentation, fetched 2026-10-31

> Druid can roll up data at ingestion time to reduce the amount of raw data to store on disk. Rollup is a form of summarization or pre-aggregation. Rolling up data can dramatically reduce the size of data to be stored and reduce row counts by potentially orders of magnitude. As a trade-off for the efficiency of rollup, you lose the ability to query individual events.

> When you disable rollup, Druid loads each row as-is without doing any form of pre-aggregation. This mode is similar to databases that do not support a rollup feature. Set rollup to false if you want Druid to store each record as-is, without any rollup summarization.

Used for: a real-time OLAP store's own definition of rollup as ingestion-time pre-aggregation, and
its own named cost (losing the ability to query individual events) — the real-time-OLAP side of
this topic's three-way comparison, in the engine's own words.
