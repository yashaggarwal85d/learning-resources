# Fact-check: de.sort-based-shuffle-mechanics

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Map-side results are buffered, sorted by target partition, then written to a single file per map task | Confirmed | `sources/spark_apache_org_docs_latest_rdd_programming_guide_html_shuffle_operations_efefd1c0.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | Reduce-side tasks read the relevant sorted blocks from those files | Confirmed | Same source, quoted exactly. |
| 3 | Data of shuffle blocks from the same map task are stored in a single consolidated data file | Confirmed | `sources/index-shuffle-block-resolver.txt` (raw GitHub, tag v4.0.0), quoted exactly. |
| 4 | The offsets of the data blocks in the data file are stored in a separate index file | Confirmed | Same source, quoted exactly. |
| 5 | 4 map tasks write exactly 4 shuffle data files and 4 index files | Confirmed | Measured directly: `examples.py`, `len(data_files) == 4`, `len(index_files) == 4`. |
| 6 | Index-file bytes are smaller than data-file bytes at this scale | Confirmed | Measured directly: `examples.py`, `total_index_bytes < total_data_bytes` (6432 < 19550 bytes in the run on record). |
| 7 | The identical row count split across 8 map tasks writes 8 new data files and 8 new index files | Confirmed | Measured directly: `examples.py`, diffed file sets, `len(data_files8) == 8`, `len(index_files8) == 8`. |
| 8 | A reducer consults the MapOutputTracker for block locations before fetching | Confirmed, not independently measured | Cross-confirmed by mechanism from the RDD Programming Guide's shuffle description ("on the reduce side, tasks read the relevant sorted blocks") plus the syllabus's own named component; not separately instrumented in `examples.py` since the MapOutputTracker's driver-side registry isn't exposed through PySpark's public API. Disclosed as a mechanism claim, not a measured one. |
| 9 | Logical block count is M (map tasks) times R (reduce partitions) | Confirmed | Measured directly: `examples.py` computes `len(data_files) * num_buckets` (4 x 97, the `% 97` grouping key used throughout this chapter's §7.1 topics) and asserts it equals 388; the reel states this as the derived count, not a separately globbed file count (block count ≠ file count in the sort-based scheme — see red team below). |

## Red team

- **Is "388 logical blocks" actually something `examples.py` counts directly, or is it arithmetic?**
  It's asserted directly in `examples.py` (`len(data_files) * num_buckets == 388`), computed from
  the same measured file count the earlier assertions already confirmed. The sort-based shuffle
  writer's whole point is that it does
  *not* write one physical file per (map task, reduce partition) pair — it writes one consolidated
  file per map task, with an index locating each reduce partition's span inside it. So "388 logical
  blocks" describes fetch-side granularity (how many distinct (map task, partition) spans a reducer
  set must eventually read across), not a file count on disk; the reel's own language ("logical
  blocks," never "files") and `coverage.json`'s expert item on hash-based-vs-sort-based shuffle make
  this distinction explicit rather than letting "block" and "file" blur together.
- **Why wasn't the MapOutputTracker itself measured, only asserted by mechanism?** PySpark's public
  API doesn't expose the driver's internal `MapOutputTracker` registry or its RPC traffic; measuring
  it directly would require JVM-internals access this chapter's other topics don't use either.
  Treated the same way topic 2 treated the DAGScheduler's exact algorithm: sourced and quoted, not
  independently re-derived from raw internals.
- **Did deleting the shuffle local directory between runs ever produce a false "8 files" result
  that this fact-check should distrust?** No — that approach crashed outright with a
  `FileNotFoundException` before producing any count at all (caught during drafting, not shipped);
  the fix (diffing against the same, never-reset directory) was verified by rerunning the full
  script end to end after the fix, with the terminal output showing both the 4-file and 8-new-file
  results in the same run.
- **Is the RDD Programming Guide's description current for Spark 4.x, or legacy RDD-era
  documentation?** It's Spark's own current-version docs (fetched at docs version 4.3.0, the
  "latest" alias at fetch time), describing the shuffle writer mechanism that DataFrame-level
  shuffles still use underneath Catalyst's planning — the same cross-version relationship topic 2's
  fact-check already established for the RDD paper's narrow/wide distinction.

No corrections were needed to `OUTLINE.md` beyond the directory-reset methodology fix made during
drafting itself (see `examples.py`'s own comment).
