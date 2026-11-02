# Fact-check — de.iceberg-metadata-tree-scan

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | A manifest list stores metadata about manifests, including partition stats and data file counts, used to avoid reading manifests not required for an operation | Iceberg spec | Verified |
| 2 | All manifests, data files, and delete files created for a snapshot inherit the snapshot's sequence number | Iceberg spec | Verified |
| 3 | A manifest is an immutable file tracking a subset of table metadata for a given snapshot; leaf manifests track data or delete files along with each file's partition data, metrics, and tracking information | Iceberg spec | Verified |
| 4 | Manifest list files store a `manifest_file` struct (per-manifest fields, including partition summaries) | Iceberg spec | Verified |
| 5 | Table metadata (`metadata.json`) consists of a defined set of fields (schemas, partition specs, sort orders, snapshot log, refs, among others) | Iceberg spec | Verified |
| 6 | The sequence number is a monotonically increasing long that tracks the order of changes to a table | Iceberg spec | Verified |
| 7 | A reader plans a scan by producing live data files from the snapshot root file and any live leaf manifests referenced by the root | Iceberg spec | Verified |
| 8 | Manifests that contain no matching files, determined using file counts, partition summaries, or column stats, may be skipped | Iceberg spec | Verified |
| 9 | Using content stats, a manifest is filtered by evaluating scan predicates against the column bounds and counts of each tracked file | Iceberg spec | Verified |
| 10 | v1-v3 manifests are filtered using scan predicates converted to partition predicates, which select relevant data files, delete files, and deletion vector metadata | Iceberg spec | Verified |
| 11 | Data files that match the query filter must be read by the scan | Iceberg spec | Verified |
| 12 | The metadata tree (manifest list and manifest files) functions as an index over a table's data, speeding up query planning and pruning unnecessary data files | Iceberg maintenance docs | Verified |
| 13 | Manifests are automatically compacted in the order they are added, which is fastest when the write pattern aligns with read filters (e.g. hourly-partitioned writes aligned with time-range query filters) | Iceberg maintenance docs | Verified |
| 14 | When write pattern doesn't align with query pattern, `rewriteManifests` (or Spark's `rewriteManifests` action) re-groups data files into manifests | Iceberg maintenance docs | Verified |

## Red-team

- **Is this a real Iceberg table, or a simulation?** Real. `examples.py` builds an actual table
  with the real `pyiceberg` library (0.12.0): a real `SqlCatalog` backed by a real SQLite
  catalog database, real Avro manifest and manifest-list files, a real `metadata.json`, written
  to a local filesystem warehouse. Every demo reads that table's real on-disk structures via
  `table.metadata` and `table.inspect`, the same interfaces any Iceberg reader uses — not a
  model of the format. File paths and UUIDs are real-system randomness (every writer, including
  a production cluster, assigns a fresh UUID per file), so the script asserts and prints counts
  and structure rather than literal paths; this is disclosed in the script's own docstring and
  confirmed by running it three times with byte-for-byte identical output.
- **The `rewrite_manifests` demo does not call a method named `rewrite_manifests`.** pyiceberg
  0.12.0 has no public `rewrite_manifests` action (unlike Spark's `rewriteManifests`, which the
  maintenance source describes). The demo instead reproduces the mechanism from pyiceberg's own
  real, lower-level primitives: `write_manifest`/`write_manifest_list` (the same Avro manifest
  and manifest-list writers any pyiceberg action would use) to merge every live manifest entry
  into one new manifest and manifest list, then a real `Snapshot`/`Summary` object committed via
  `AddSnapshotUpdate`/`SetSnapshotRefUpdate` through `table.transaction()._apply(...)` — the same
  catalog commit path a public action would take. This is functionally equivalent to
  `rewriteManifests` (same formats, same commit mechanism) but methodologically distinct from
  calling a canned high-level action, and is disclosed as such in `examples.py`'s docstring and
  in `post-notes.md`. The result is verified for real: 5 manifests before, 1 after, and all 20
  original rows still readable from a freshly reloaded table (`catalog.load_table`), not merely
  asserted from the in-memory object.
- **Does partition pruning in the demo reflect a real planning decision, or a filter applied
  after the fact?** Real. `table.scan(row_filter=EqualTo(...)).plan_files()` is pyiceberg's own
  planning entry point; the test compares the file count it returns for a filtered vs.
  unfiltered scan (1 vs. 5) rather than inspecting which code path ran internally, which is the
  externally observable proof the source material itself describes (manifests filtered by
  partition summaries before the files inside them are opened).
- **Scope boundary.** This topic does not build or demonstrate column-level (content-stats)
  pruning within a single partition, equality/position delete files, or deletion vectors —
  those are introduced by name from the spec quotes but not exercised by `examples.py`, since
  the table built here has no deletes. Out of scope here, not claimed as demonstrated.
