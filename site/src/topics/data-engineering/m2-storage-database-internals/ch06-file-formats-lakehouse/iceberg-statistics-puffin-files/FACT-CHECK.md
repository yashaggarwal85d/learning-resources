# FACT-CHECK — de.iceberg-statistics-puffin-files

## Claims table

| # | Claim | Step | Source | Status |
|---|---|---|---|---|
| 1 | A real pyiceberg-written manifest's string column bounds are truncated to 16 bytes | 3 | Executed: `examples.py` `demo_manifest_bounds_are_truncated` asserts `len(lower_bound) == 16` and `len(upper_bound) == 16` against real `table.inspect.data_files()` output | Verified |
| 2 | The truncated upper bound is not the real max value, but a value that still sorts above it (last byte incremented) | 3 | Executed: asserted `upper_bound[:15] == true_max[:15]` and `upper_bound[15] == true_max[15] + 1` | Verified |
| 3 | The spec states string/binary bounds are never tight because they may be truncated when written | 4 | Apache Iceberg Table Spec, quoted in SOURCES.md | Verified, sourced |
| 4 | Table statistics files are valid Puffin files, informational, and a reader may ignore them | 6 | Apache Iceberg Table Spec, quoted in SOURCES.md | Verified, sourced |
| 5 | A real Puffin file was built in this sandbox, byte-exact to the Magic/Blob/Footer structure the spec defines | 6 | Executed: `examples.py` `write_puffin_sketch_file` constructs `PUFFIN_MAGIC + blob + PUFFIN_MAGIC + footer_payload + size + flags + PUFFIN_MAGIC`, matching the spec's `Magic FooterPayload FooterPayloadSize Flags Magic` footer layout exactly, with the real four magic bytes `0x50 0x46 0x41 0x31` | Verified |
| 6 | The Puffin file was registered on the table through pyiceberg's own public API | 6 | Executed: `table.update_statistics().set_statistics(statistics_file=StatisticsFile(...))`, a real, documented pyiceberg API (`pyiceberg.table.UpdateStatistics`), not a low-level workaround | Verified |
| 7 | The sketch itself was read back by parsing the raw Puffin bytes independently of pyiceberg | 7 | Executed: `demo_statistics_registered_and_read_back` opens the file directly, locates the footer from the file's last bytes per the spec's footer layout, and deserializes the blob | Verified |
| 8 | The sketch's distinct-count estimate is close to, but not exactly, the table's true distinct count | 7 | Executed: printed error percentage, consistently ~0.3% across 3 runs on 20,000 rows | Verified |
| 9 | Partition statistics files are the partition-level equivalent, equally optional | 8 | Apache Iceberg Table Spec, quoted in SOURCES.md | Sourced only, not built (see scope boundary) |
| 10 | Trino's cost-based join enumeration uses connector-supplied table statistics to pick join order | 9 | Trino, Cost-based optimizations, quoted in SOURCES.md | Verified, sourced |
| 11 | Missing or uncomputable statistics fall back to a weaker join strategy (ELIMINATE_CROSS_JOINS) | 9 | Trino, Cost-based optimizations, quoted in SOURCES.md | Verified, sourced |
| 12 | Misestimated statistics risk a genuinely bad plan, not just a suboptimal one | 9 | Trino, Cost-based optimizations, quoted in SOURCES.md ("prevent bad plans when the cost-based optimizer misestimates the size of the joined tables") | Verified, sourced |
| 13 | Trino's Iceberg connector collects column statistics via `ANALYZE`, recommended only on columns actually used for joins/predicates/grouping | deep (Frontier) | Trino, Iceberg connector, quoted in SOURCES.md | Verified, sourced |
| 14 | The Puffin spec names the Apache DataSketches library's own Alpha-family Theta sketch as the real `apache-datasketches-theta-v1` blob payload | 6 | Apache Iceberg Puffin Spec, quoted in SOURCES.md | Verified, sourced |
| 15 | This topic's own sketch payload bytes are NOT the real Apache DataSketches wire format | 6 | Disclosed directly in `examples.py`'s docstring and red-team #1 below | Disclosed |

## Red-team

1. **The sketch payload is a disclosed substitute, not the real Apache DataSketches format.**
   The Puffin spec names the `apache-datasketches-theta-v1` blob type after the real Apache
   DataSketches library's own compact Theta sketch serialization. This repo's baseline Python
   environment (pyarrow + pyiceberg) has no dependency on that library, and this chapter's
   established house convention (see the Chapter 5 HyperLogLog topic) is to implement sketch
   algorithms from first principles in pure Python rather than add new pip dependencies with no
   install mechanism in this repo's build/check pipeline. `examples.py`'s `ThetaSketch` class is
   a real K Minimum Values Theta sketch — same family, same statistical behavior, same
   bounded-memory property the spec describes — serialized in this script's own binary format,
   not Apache DataSketches' actual wire bytes. A real Trino or Spark reader expecting the genuine
   library's serialization would not be able to parse this blob's contents, even though it would
   correctly parse the surrounding Puffin container (magic, footer JSON, offsets, lengths) and
   correctly read the `type`/`fields`/`snapshot-id`/`ndv` metadata, since those are built exactly
   per spec. This is disclosed directly in `examples.py`'s module docstring, not hidden.

2. **The Puffin container format is genuinely byte-exact, not approximated.** Every structural
   element — the 4-byte magic at the start and inside the footer, the blob placed directly after
   the opening magic with the footer's `offset`/`length` pointing at it correctly, the UTF-8 JSON
   footer payload, the little-endian signed 4-byte footer payload size, the 4-byte flags field —
   matches the spec's File structure and Footer structure sections exactly (SOURCES.md). The
   read-back in step 7 parses these raw bytes with no help from pyiceberg, proving the structure
   is actually conformant, not merely asserted to be.

3. **Registering the statistics file uses pyiceberg's real public API, not a workaround.** Unlike
   this chapter's earlier equality-delete and manifest-rewrite topics, which needed pyiceberg's
   low-level `write_manifest`/`AddSnapshotUpdate` primitives because no public writer existed,
   `pyiceberg.table.Transaction.update_statistics()` and `UpdateStatistics.set_statistics()` are
   real, documented, public methods — this is the same call path a real system computing its own
   Puffin file (any engine, using the real DataSketches library) would use to register it on an
   Iceberg table. The caller is always expected to supply the pre-computed blob metadata; pyiceberg
   itself never computes a sketch.

4. **Partition statistics files are named from the spec's text only, not built.** Building one
   would require implementing a second, differently-shaped Puffin sidecar (keyed by partition
   rather than by table) for a feature this topic's own CHAPTER.md scope says to name rather than
   demonstrate ("state concretely what 'stale stats' costs a query plan," not "build a partition
   statistics file"). The two quoted spec lines (SOURCES.md) are the full extent of what's claimed
   about it.

5. **The "stale stats" claim is Trino's own account of a fallback and a risk, not a measured
   benchmark.** No query plan is actually run against stale vs. fresh statistics in this sandbox;
   the claim is what the Trino documentation itself states happens (a weaker fallback strategy
   when statistics are missing, and the possibility of a bad plan when they're wrong), quoted
   directly rather than paraphrased into a stronger claim than the source supports.

## Scope boundary

Built and verified for real in this sandbox: manifest-level string bound truncation (read off a
real manifest), a byte-exact Puffin file container holding a real Theta/KMV sketch, registration
through pyiceberg's real public statistics API, and an independent re-read of the raw bytes
compared against ground truth. Named from sourced documentation only, not built: partition
statistics files, and the real Apache DataSketches library's own exact sketch serialization
(the sketch *algorithm* is real and built from scratch; its *wire bytes* are this script's own).
