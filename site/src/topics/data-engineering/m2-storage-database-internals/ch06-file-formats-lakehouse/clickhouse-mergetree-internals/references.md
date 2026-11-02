Last verified: 2 November 2026. No Docker daemon or standalone `clickhouse-server` process runs in
this sandbox; `examples.py` uses `chdb` (pip-installable), which embeds a real ClickHouse 26.9
engine directly in the Python process -- the same MergeTree engine ClickHouse Cloud and
self-hosted ClickHouse run, not a simulation of it. Every architectural claim is a word-for-word
quote from ClickHouse's own current documentation; every number is chdb's own real, executed
output.

- ClickHouse, "MergeTree table engine": [clickhouse.com](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree). Fetched 2026-11-02.
- ClickHouse, "Understanding ClickHouse data skipping indexes": [clickhouse.com](https://clickhouse.com/docs/optimize/skipping-indexes). Fetched 2026-11-02.
- ClickHouse, "CREATE VIEW": [clickhouse.com](https://clickhouse.com/docs/sql-reference/statements/create/view). Fetched 2026-11-02.
- ClickHouse, "AggregatingMergeTree table engine": [clickhouse.com](https://clickhouse.com/docs/engines/table-engines/mergetree-family/aggregatingmergetree). Fetched 2026-11-02.
- ClickHouse, "ReplacingMergeTree table engine": [clickhouse.com](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree). Fetched 2026-11-02.
- ClickHouse, "DELETE": [clickhouse.com](https://clickhouse.com/docs/sql-reference/statements/delete). Fetched 2026-11-02.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=clickhouse-mergetree-internals:%20).
