# Fact-check — de.small-files-compaction-file

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | Small data files cause unnecessary metadata and less efficient queries from file open costs | Iceberg, Maintenance | SOURCES.md quote 1 |
| 2 | `rewriteDataFiles` combines small files into larger files to reduce metadata overhead and runtime file open cost | Iceberg, Maintenance | SOURCES.md quote 2 |
| 3 | The `files` metadata table is useful for inspecting data file sizes and determining when to compact | Iceberg, Maintenance | SOURCES.md quote 3 |
| 4 | Delta's OPTIMIZE coalesces small files into larger ones to speed read queries | Delta Lake, Optimizations | SOURCES.md quote 4 |
| 5 | Bin-packing is idempotent: a second run on the same dataset has no effect | Delta Lake, Optimizations | SOURCES.md quote 5 |
| 6 | Bin-packing targets evenly-balanced file size on disk, not tuple count | Delta Lake, Optimizations | SOURCES.md quote 6 |
| 7 | Delta auto compaction defaults to 128 MB target file size | Delta Lake, Optimizations | SOURCES.md quote 7 |
| 8 | Auto compaction only triggers once a partition/table has at least a certain number of small files | Delta Lake, Optimizations | SOURCES.md quote 8 |
| 9 | Output file size for auto compaction is controlled by `spark.databricks.delta.autoCompact.maxFileSize` | Delta Lake, Optimizations | SOURCES.md quote 9 |
| 10 | Many small files force many small reads, each with fixed per-request overhead, hurting downstream query performance | AWS, S3 Tables compaction post | SOURCES.md quote 10 |
| 11 | S3 Tables automatically performs compaction alongside snapshot management and orphan-file removal | AWS, S3 Tables compaction post | SOURCES.md quote 11 |
| 12 | S3 Tables' default target file size is 512MB, adjustable between 64MB and 512MB | AWS, S3 Tables compaction post | SOURCES.md quote 12 |
| 13 | Uncompacted 1MB-object queries needed 8.5x more read requests than compacted 512MB-object queries in AWS's own benchmark | AWS, S3 Tables compaction post | SOURCES.md quote 13 |
| 14 | S3 Tables runs compaction with no manual intervention | AWS, S3 Tables compaction post | SOURCES.md quote 14 |
| 15 | Databricks predictive optimization automatically runs OPTIMIZE, VACUUM, and ANALYZE on Unity Catalog managed tables, eliminating manual maintenance | Databricks, Predictive optimization docs | SOURCES.md quote 15 |
| 16 | Predictive optimization is enabled by default for accounts created on or after 2024-11-11 | Databricks, Predictive optimization docs | SOURCES.md quote 16 |
| 17 | Predictive optimization only supports Unity Catalog managed tables | Databricks, Predictive optimization docs | SOURCES.md quote 17 |

**Currency note.** All four sources fetched 2026-11-02 against their current ("latest"/live docs)
pages; no version-pinned archive needed since none of the quoted figures are release-specific
beyond what's quoted (Delta's 128 MB auto-compaction default and S3 Tables' 512MB/64MB-512MB range
are both the current documented defaults as of the fetch date).

## Red-team

1. **The directory of real files in `examples.py` is a simplified stand-in for a table's real
   Parquet data files and Iceberg/Delta manifest format**, disclosed in the script's own docstring
   and in `coverage.json`'s expert items. What transfers is the real mechanism the sources
   describe: file count itself (independent of total data volume) drives manifest metadata size
   and per-file open/LIST overhead, and a bin-pack compaction collapses both without touching the
   data. Real Parquet/Iceberg manifests are not literally fixed-width JSON-lines records; the
   fixed-width entry here exists so the measured manifest-byte reduction is exact and
   reproducible, not an approximation of Iceberg's actual manifest-file binary layout.

2. **The "open/LIST overhead" figure (`OPEN_COST_UNITS_PER_FILE = 50`, applied per file touched)
   is a deterministic cost-model proxy, not a measured wall-clock LIST or open() latency.** A real
   wall-clock measurement of `os.listdir`/`open()` on 200 files versus 10 files in this sandbox
   would be too small and too noisy to assert on reliably (consistent with the project's standing
   no-flaky-timing rule). The proxy is sourced directly from Iceberg's own documented reason
   ("file open costs") and the AWS S3 Tables post's own measured real-world number (8.5x more read
   requests for 1MB objects versus 512MB objects) — the real mechanism (per-request/per-open fixed
   overhead, independent of bytes transferred) is what's reproduced, not a specific company's
   exact multiplier.

3. **The zlib compression comparison (demonstration 4) is a real, measured stand-in for "worse
   compression," not a reproduction of Parquet's actual column-level dictionary/RLE encoding or
   page-level compression.** Splitting the same bytes into independently-compressed streams versus
   one stream is a real, general compression mechanism (less context for the compressor to exploit
   across a split), and it genuinely measures worse here (5400 bytes split vs. 1084 bytes whole,
   confirmed deterministic across 3 runs) — but Parquet's real compression loss from small files
   comes from smaller row groups and more per-file overhead (headers, footers, dictionary resets),
   not from zlib specifically. This is disclosed in `coverage.json`.

4. **The scheduling trade-off (step 9) is stated from the sources, not demonstrated by a new
   measurement in `examples.py`.** None of the four sources gives a reproducible, sandbox-safe way
   to demonstrate a live conflict between an in-flight streaming writer and a concurrent compaction
   job (that would require two real concurrent processes racing on the same files, which is exactly
   the flaky-timing risk this chapter's prior topic already flagged and avoided). The claim itself
   — that compacting a partition is a real scheduling decision, not a free action — is sourced
   directly from Iceberg's `rewriteDataFiles` partial-progress option and the very existence of
   managed/scheduled compaction offerings (S3 Tables, Databricks predictive optimization) existing
   specifically to take that scheduling decision away from a human.

5. **Scope boundary.** This topic does not cover row-group or page-level target sizing inside a
   single Parquet file (covered by topic 7's Parquet-anatomy material), nor Spark-side output
   control over file counts at write time (deferred explicitly to §7.2 per CHAPTER.md). It also
   does not demonstrate MOR delete/log-file accumulation as a small-file source in depth — named in
   the hook/outcomes list as one real source of small files, but not separately measured, since
   deletion-vector/MOR mechanics were already covered for real in topic 15.

**Problem-solving notes.** All four demonstrations in `examples.py` are deterministic (fixed-seed
byte patterns, no timing assertions, no randomness), verified byte-identical across 3 consecutive
runs. The 20x reduction in both manifest bytes and open/LIST overhead is exact by construction
(both scale linearly with file count, and file count drops from 200 to 10 by design), not an
approximation.
