# FACT-CHECK — de.object-storage-query-economics

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Object storage bills storage, requests, and data transfer as separate, independent dimensions. | Confirmed | AWS S3 pricing, direct quote: "Amazon S3 cost components are storage pricing, request and data retrieval pricing, data transfer and transfer acceleration pricing, data management and insights feature pricing, replication pricing, and transform and query feature pricing." The page's exact current $ rates render client-side (JavaScript price tokens) and are not reproducible as static quoted numbers; only the billing structure is quoted, disclosed in SOURCES.md. |
| 2 | On-demand query pricing charges for bytes scanned regardless of runtime; flat-rate/capacity pricing charges for reserved compute time regardless of bytes scanned. | Confirmed | BigQuery pricing, direct quotes: "On-demand pricing (per TiB)... you are charged for the number of bytes processed by each query" and "When you use the flat-rate compute pricing model, you purchase dedicated query processing capacity, measured in BigQuery slots... you are not billed for bytes processed." Same page, same disclosure as claim 1 for exact current rates. |
| 3 | The same query reads far more bytes from a JSON file than from a Parquet file holding the same data. | Confirmed, measured | `examples.py`: a fixed 96,000-row synthetic orders dataset written as JSON and as a single Parquet file; the same `SELECT sum(amount) WHERE month = 3` query's `io.total_bytes_read` (DuckDB's own profiler, not an estimate) is more than five times larger against the JSON file. Asserted as a ratio, not an exact figure, since the measured byte counts are real runtime values and vary slightly run to run. |
| 4 | A narrow query against a layout partitioned by the filtered column reads far fewer bytes than against one unpartitioned file. | Confirmed, measured | `examples.py`: the same query against a Hive-partitioned-by-month Parquet directory reads measurably fewer bytes than against the single unpartitioned Parquet file holding the identical rows, because only the one matching month's file is opened. |
| 5 | A broad query against that same partitioned layout reads more bytes than against one large unpartitioned file holding the same data. | Confirmed, measured | `examples.py`: a query with no month filter, against the Hive-partitioned directory (twelve separate files), reads more total bytes than the identical query against the single Parquet file — the per-file footer/metadata overhead of twelve small files outweighs reading one large file once. |
| 6 | An unpartitioned Iceberg table's bytes-scanned numbers track the bare Parquet file it wraps almost exactly; the format wrapper by itself does not change bytes-scanned. | Confirmed, measured, with a disclosed limitation | `examples.py`: an Iceberg table built from the same dataset (unpartitioned, since this sandbox's DuckDB build writes one data file per table regardless of a `PARTITION_BY` clause) reads within ten percent of the bare Parquet file's bytes for both the narrow and the broad query. The claim is about the unpartitioned case only; a genuinely partitioned Iceberg table (built with a real catalog, outside this sandbox) would be expected to behave like the Hive-partitioned case instead, but that is not measured here and is disclosed as such. |

## Currency

AWS S3 and BigQuery pricing pages are both live, maintained pricing references, re-fetched 2026-10-22; their billing *structure* (the claims actually quoted) is stable even though exact per-unit rates change over time, which is why no specific dollar figure is quoted as a number.

## Red team

**Predict 1 (step 3): does the format that's cheapest to write also cost the least to query?**
The plausible wrong answer treats "simple to produce" (JSON needs no schema, no special writer) as "cheap overall." The reveal at step 4 measures the opposite directly: JSON's lack of columnar structure means every query re-reads and re-parses the whole row, every column, every time — the write-time simplicity is exactly what costs more at query time.

**Predict 2 (step 6): does splitting one file into many smaller files by month always lower the bill?**
The plausible wrong answer generalizes from the narrow-query result (step 7, where partitioning clearly wins) to "more partitioning is strictly better." Step 8 measures the counterexample on the same data: a broad query that touches every partition pays a real, measured cost in per-file overhead that a single large file doesn't — the right answer depends on which query shape actually dominates.

**Predict 3 (step 10): does wrapping the data in an open table format change its bytes-scanned numbers, by itself?**
The plausible wrong answer imports the transactional story from `de.from-warehouse-lake-lakehouse` and assumes a lakehouse's format wrapper is itself what changes read efficiency. Step 11 measures directly that an unpartitioned Iceberg table's bytes-scanned is statistically indistinguishable from the Parquet file underneath it — the lakehouse's transactions and the file layout that drives bytes-scanned are two separate properties, confirmed to be separate by measurement, not simply asserted as different.

No claim required inferring beyond what is either directly quoted or directly measured in this topic's own lab; claim 6 carries an explicit, disclosed limitation rather than overclaiming what a partitioned Iceberg table would do.
