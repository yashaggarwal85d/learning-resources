# Sources

## Prometheus: Storage

URL: https://prometheus.io/docs/prometheus/latest/storage/
Version: Prometheus documentation, retrieved 2026-10-31

> Ingested samples are grouped into two-hour blocks. Each block consists of a directory that contains a chunks subdirectory with all the time series samples for that time window, a metadata file, and an index file (which maps metric names and labels to the time series in the chunks directory).

> persisted. It is secured against crashes by a write-ahead log (WAL) that can be replayed when the Prometheus server restarts. Write-ahead log files are stored in the wal directory in 128MB segments.

> High-traffic servers may retain more than three WAL files in order to keep at least two hours of raw data.

> The initial two-hour blocks are eventually compacted into longer blocks in the background.

> Compaction will create larger blocks containing data spanning up to 10% of the retention time, or 31 days, whichever is smaller. Because both the source blocks and the new compacted block must coexist on disk, on-disk size can briefly exceed storage.tsdb.retention.size; the excess is released when the next retention cleanup removes the source blocks.

> this flag nor storage.tsdb.retention.size is set, the retention time defaults to 15d.

> Prometheus stores an average of only 1-2 bytes per sample. Thus, to plan the

> needed_disk_space = retention_time_seconds * ingested_samples_per_second * bytes_per_sample

Contents: the head-block/WAL/compaction/retention structure and the capacity formula, run directly in `examples.py` against the plant's own ingestion rate.

## Prometheus: Configuration (out-of-order sample window)

URL: https://prometheus.io/docs/prometheus/latest/configuration/configuration/
Version: Prometheus documentation, retrieved 2026-10-31

> Configures how old an out-of-order/out-of-bounds sample can be w.r.t. the TSDB max time.

> An out-of-order/out-of-bounds sample is ingested into the TSDB as long as the timestamp

> of the sample is >= TSDB.MaxTime-out_of_order_time_window.

> [ out_of_order_time_window: <duration> | default = 0s ]

Contents: the accept/reject rule for a late sample relative to the head's max time, run directly in `examples.py`'s accept/reject simulation.

## Tiger Data (TimescaleDB): Understand hypertables

URL: https://docs.tigerdata.com/use-timescale/latest/hypertables/about-hypertables/
Version: Tiger Data documentation, retrieved 2026-10-31

> hypertables, PostgreSQL tables that automatically partition your time-series data by time and optionally by other dimensions. When you run a query, Tiger Cloud identifies the correct partition, called chunk, and runs the query on it, instead of going through the entire table.

Contents: the chunk-exclusion rule, run directly in `examples.py`'s simulated chunk-pruning check.

## Tiger Data (TimescaleDB): Understand hypercore

URL: https://docs.tigerdata.com/use-timescale/latest/hypercore/
Version: Tiger Data documentation, retrieved 2026-10-31

> Hypercore is Tiger Data's hybrid row-columnar storage engine. New data lands in the rowstore for fast inserts and updates, then automatically converts to the columnstore where analytical queries read fewer bytes and run faster. This conversion includes data compression of up to 98%, which dramatically cuts storage costs.

Contents: the rowstore-then-columnstore conversion named for TimescaleDB's own columnstore compression (not reproduced numerically — no TimescaleDB instance in this environment; named and quoted).

## InfluxData: InfluxDB 3 Core storage engine

URL: https://docs.influxdata.com/influxdb3/core/reference/internals/storage-engine/
Version: InfluxDB 3 Core documentation, retrieved 2026-10-31

> InfluxDB 3 Core always writes and stores data using the Parquet storage engine

Contents: the default-codec/storage-format claim; exercised for real in topic 11's `examples.py` (DuckDB's own ALP/Parquet codec), named here only as the storage format this topic's WAL-then-Parquet flow simulation targets.

## InfluxData: InfluxDB 3 Core durability

URL: https://docs.influxdata.com/influxdb3/core/reference/internals/durability/
Version: InfluxDB 3 Core documentation, retrieved 2026-10-31

> The database flushes the write buffer to the WAL every second (default).

> After WAL persistence completes, data moves to the queryable buffer where it becomes available for queries. By default, the server keeps up to 900 WAL files (15 minutes of data) buffered.

> Every ten minutes (default), InfluxDB 3 Core persists the oldest data from the queryable buffer to the object store in Parquet format, and keeps the remaining data (the most recent 5 minutes) in memory.

Contents: the exact second/fifteen-minute/ten-minute/five-minute timings this topic's `examples.py` simulates directly as a staged buffer-to-WAL-to-Parquet pipeline.

## InfluxData: InfluxDB 3 Core release notes (DataFusion)

URL: https://docs.influxdata.com/influxdb3/core/release-notes/
Version: InfluxDB 3 Core documentation, retrieved 2026-10-31

> The query engine is upgraded from DataFusion 51.0 to 52.5.

Contents: confirms InfluxDB 3's query engine is DataFusion, at the version its own release notes name; the Arrow-in-memory statement is named per CHAPTER.md's own caveat (confirmed from planning-time pages for Parquet/WAL/timing, not independently re-verified here beyond the DataFusion naming) and not claimed beyond that.

## Thanos: Design document

URL: https://thanos.io/tip/thanos/design.md/
Version: Thanos documentation, retrieved 2026-10-31

> Thanos provides two components that act as data sources: the Prometheus sidecar and rule nodes.

> Those block files can be backed up to object storage and later be queried by another component (see below). All data is uploaded as it is created by the Prometheus server/storage engine.

> A store node acts as a gateway to block data that is stored in an object storage bucket. It implements the same gRPC API as data sources to provide access to all metric data found in the bucket.

> The compactor is a singleton process that does not participate in the Thanos cluster. Instead, it is only pointed at an object storage bucket and continuously consolidates multiple smaller blocks into larger ones.

> Typical object storage prices per GB are at about $0.02. The number of retrievals (typically priced at $0.004 per 10,000) by the store nodes strongly depends on the individual querying pattern.

Contents: the sidecar-uploads-blocks-to-object-storage architecture and its own cost quantification, named and quoted (sourced-only — no Thanos/object-storage instance in this environment, consistent with topic 10's identical sourced-only handling).

## Grafana Mimir: Architecture

URL: https://grafana.com/docs/mimir/latest/get-started/about-grafana-mimir-architecture/
Version: Grafana Mimir documentation, retrieved 2026-10-31

> Grafana Mimir has a microservices-based architecture. The system has multiple horizontally scalable microservices that can run separately and in parallel.

> Uses stateful ingesters with local write-ahead logs to manage both the ingestion of new data and serving recent data for queries

Contents: the stateful-ingester-with-local-WAL design, named and quoted (sourced-only — no Mimir instance in this environment).

## VictoriaMetrics: Documentation

URL: https://docs.victoriametrics.com/victoriametrics/#prominent-features
Version: VictoriaMetrics documentation, retrieved 2026-10-31

> It can be used as long-term storage for Prometheus.

Contents: the long-term-storage-for-Prometheus claim, named and quoted (sourced-only — no VictoriaMetrics instance in this environment); used as the third example of the shared scaled-out pattern this topic names: the Prometheus block format, pushed out to object storage, behind a stateless query layer.
