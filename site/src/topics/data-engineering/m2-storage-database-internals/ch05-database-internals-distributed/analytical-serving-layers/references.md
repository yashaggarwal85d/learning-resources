Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, against a real, in-process DuckDB engine): the same aggregate query measured
against a raw table versus a precomputed materialized table; a real write's freshness gap between
the raw table and the materialized table before and after a refresh.

- ClickHouse docs, "Materialized views": [clickhouse.com](https://clickhouse.com/docs/materialized-view). Pre-aggregation's cost-shift definition and the refreshable view's own named freshness gap.
- Apache Druid docs, "Data rollup": [druid.apache.org](https://druid.apache.org/docs/latest/ingestion/rollup/). Ingestion-time pre-aggregation and its own named cost.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=analytical-serving-layers:%20).
