<section data-section="outcomes">

## Outcomes

Object storage bills storage, requests and retrievals, and data transfer as separate, independent meters, and the storage meter itself splits further by size, duration, and storage class. Query compute is billed on one of two different axes: bytes scanned, regardless of runtime, or reserved compute capacity, regardless of bytes scanned. File format and file layout drive those bytes-scanned numbers very differently: JSON costs far more to query than Parquet holding the same data, and partitioning a dataset by a filtered column helps a narrow query while measurably hurting a broad one on the exact same rows — the right layout depends on which query shape actually dominates, not on a universal "more partitioning is better" rule. Wrapping data in an open table format changes its transactions and governance, not its bytes-scanned numbers by itself; physical layout does that.

</section>

<section data-section="internals">

## Internals: how DuckDB's profiler actually counts bytes read

`PRAGMA enable_profiling='json'` makes DuckDB record, per query, the number of bytes its storage layer actually requested from the operating system while executing that query — not an estimate derived from a file's total size on disk. For a Parquet file, that number reflects which row groups and columns the scan operator actually opened, after the query planner's filter and projection pushdown decided what could be skipped; for a JSON file, there's no row-group or column structure to skip, so the reader's bytes read tracks much closer to the whole file (plus the read-ahead buffering a streaming JSON parser uses, which can report more bytes read than the file's own size on disk). This is the same mechanism a real cloud query engine's billing meter is built on, just measured locally instead of on a vendor's own infrastructure.

</section>

<section data-section="lab">

## Lab

This topic hosts the §3.3 chapter lab (`CHAPTER.md`): the same synthetic dataset, generated fresh on every run, stored as JSON, as a single Parquet file, as a Hive-partitioned-by-month Parquet directory, and as an Iceberg table — then a narrow query (one month) and a broad query (every month) run against each, with bytes read, on-disk storage, and files touched all measured for real via DuckDB (`examples.py`). The Iceberg table built here is unpartitioned, because this sandbox's DuckDB build writes a single data file per table regardless of a `PARTITION_BY` clause; that limitation is disclosed in the file itself rather than papered over.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking one file layout for one dominant query shape, forever.** A layout chosen to serve today's narrow, filtered dashboard queries can quietly become the most expensive possible choice the day a broad, full-scan batch job starts running against the same data — the cost didn't change because anything broke; it changed because the query shape changed and nobody re-measured the layout against it.

**Treating "an open table format" as a performance upgrade by itself.** Moving to Iceberg or Delta buys transactions, schema evolution, and a catalog — not, by itself, fewer bytes scanned. A table that's still effectively one large unpartitioned file pays exactly the same bytes-scanned bill it would as a bare Parquet file, format wrapper or not.

</section>

<section data-section="frontier">

## Frontier

The broad-query cost measured in this topic — many small files costing more per-file overhead than one large file — is exactly what accumulates over time in any actively written lakehouse table, as each small append or upsert lands as yet another small file. Iceberg and Delta both treat this as an operational problem with its own name, compaction (Iceberg's rewrite/`OPTIMIZE` procedures, Delta's `OPTIMIZE`), a maintenance job that periodically merges many small files back into fewer large ones — trading the file-layout cost this topic measured against the cost of actually running that compaction job.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This billing model is exactly what made separating storage from compute economically attractive in the first place. Next: compute-storage separation itself, the architectural consequence of this topic's own economics.

</section>
