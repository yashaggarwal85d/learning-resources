# Sources

## Prometheus: Storage (local-storage limitation)

URL: https://prometheus.io/docs/prometheus/latest/storage/
Version: Prometheus documentation, retrieved 2026-10-31

> Note that a limitation of local storage is that it is not clustered or

> replicated. Thus, it is not arbitrarily scalable or durable in the face of

> drive or node outages and should be managed like any other single node

Contents: the local-storage limitation this topic's decision matrix weighs against a scaled-out or lakehouse alternative for long retention. (Previously cited and run against in topic 13; here named only for the Prometheus-style row of the matrix.)

## ClickHouse: MergeTree table engine

URL: https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree
Version: ClickHouse documentation, retrieved 2026-10-31

> MergeTree-family table engines are designed for high data ingest rates and huge data volumes.

> The table's primary key determines the sort order within each table part (clustered index). The primary key also does not reference individual rows but blocks of 8192 rows called granules. This makes primary keys of huge data sets small enough to remain loaded in main memory, while still providing fast access to on-disk data.

> Tables can be partitioned using an arbitrary partition expression. Partition pruning ensures partitions are omitted from reading when the query allows it.

Contents: ClickHouse's own sparse-primary-key and partition-pruning design, named for the high-rate-analytics row of the decision matrix (Chapter 6 §6.4 covers it in depth; sourced-only here, no ClickHouse instance in this environment).

## QuestDB: Architecture overview

URL: https://questdb.com/docs/concept/storage-model/
Version: QuestDB documentation, retrieved 2026-10-31

> QuestDB offers high-speed ingestion and low-latency analytics on time-series

> data. It stores data in a three-tier architecture (streaming WAL files, local

> binary storage, and local or remote storage in Parquet format) to improve

> Data is time-ordered and de-duplicated into QuestDB's native, time-partitioned columnar format and becomes immediately queryable.

Contents: QuestDB's own three-tier (WAL, hot columnar, cold Parquet) architecture, named for the decision matrix's high-rate-analytics row, verified at research time (sourced-only, no QuestDB instance in this environment).

## InfluxData: Create a Last Value Cache

URL: https://docs.influxdata.com/influxdb3/core/admin/last-value-cache/create/
Version: InfluxDB 3 Core documentation, retrieved 2026-10-31

> The LVC is stored in memory, so it's important to consider the size and persistence

Contents: InfluxDB 3's own documented last-value cache, named for the matrix's last-value-query column (not run — no InfluxDB 3 instance in this environment; DuckDB's own last-value query stands in, measured directly in `examples.py`).

## InfluxData: Create a Distinct Value Cache

URL: https://docs.influxdata.com/influxdb3/core/admin/distinct-value-cache/create/
Version: InfluxDB 3 Core documentation, retrieved 2026-10-31

> Use the

> influxdb3 create distinct_cache

> command

Contents: InfluxDB 3's own documented distinct-value cache, named only (not run) alongside the last-value cache above, as the vendor's answer to the same access-path question this topic measures with DuckDB instead.

## Thanos: Design document (object storage cost)

URL: https://thanos.io/tip/thanos/design.md/
Version: Thanos documentation, retrieved 2026-10-31

> Typical object storage prices per GB are at about $0.02. The number of retrievals (typically priced at $0.004 per 10,000) by the store nodes strongly depends on the individual querying pattern.

Contents: the dated object-storage unit price this topic's lakehouse-tier cost estimate uses, carried over from topic 13's identical citation of the same document (consistent with CHAPTER.md's instruction to cite each engine's documentation as topic 13 did, rather than re-deriving a separate price).

## Chapter 15's capacity-estimate-chain and three-alternatives-with-costs (in-course, used)

URL: (none — prior topics in this same site, not an external fetch)
Version: n/a

Named, not quoted. `capacity-estimate-chain` and `three-alternatives-with-costs` are used by this topic's decision matrix and its three-option (TSDB / warehouse+lakehouse / tiered) comparison.

## Chapter 5's analytical-serving-layers id, and Chapter 6's table-format ids (named only — not yet built)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names `analytical-serving-layers` (Chapter 5) and Chapter 6's table-format ids. Verified by grep at build time: `analytical-serving-layers` does not exist in any topic's `introduces` array in `registry.ts`, and the Iceberg/Delta/table-format ids (`iceberg-delta-hudi-table-format-mechanics`, `iceberg-snapshot-branch-mechanics`, `iceberg-delta-table-format-tradeoffs`) appear only in `declared`/`uses` arrays — Chapter 6 has not shipped a topic yet. This topic does not claim either; see `OUTLINE.md` for the full gap note. Same handling as the chapter's five prior Chapter 5/6/15 gaps (topics 6, 10, 11, 12).
