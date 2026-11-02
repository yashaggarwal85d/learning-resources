## Apache Iceberg, Table Spec (metadata tree)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> In v1-v3, the manifests that make up a snapshot are stored in a manifest list file. Each manifest list stores metadata about manifests, including partition stats and data file counts. These stats are used to avoid reading manifests that are not required for an operation.

> All manifests, data files, and delete files created for a snapshot inherit the snapshot's sequence number.

> A table's metadata tree is composed of manifests. A manifest is an immutable file that tracks a subset of a table metadata for a given snapshot. Leaf manifests are the lowest level of the metadata tree and track data or delete files, along with each file's partition data, metrics, and tracking information.

> Manifest list files store manifest_file, a struct with the following fields:

> Table metadata consists of the following fields:

> A monotonically increasing long that tracks the order of changes to a table

> A reader plans a scan by producing live data files from the snapshot root file and any live leaf manifests referenced by the root.

> Manifests that contain no matching files, determined using file counts, partition summaries, or column stats, may be skipped.

> Using content stats, a manifest is filtered by evaluating scan predicates against the column bounds and counts of each tracked file.

> v1-v3 manifests are filtered using scan predicates converted to partition predicates, which filter partition tuples. These partition predicates are used to select relevant data files, delete files, and deletion vector metadata.

> Data files that match the query filter must be read by the scan.

Contents: the real shape of the metadata tree this topic reads by hand — metadata.json points at
a manifest list, whose rows carry per-manifest partition summaries used to skip whole manifests
before any file is touched; the surviving manifests carry per-file partition tuples and column
metrics, which prune individual files the same way. Every manifest, data file and delete file
inherits its snapshot's sequence number, giving every commit a total order.

## Apache Iceberg, Maintenance (rewrite manifests)

URL: https://iceberg.apache.org/docs/latest/maintenance/
Version: latest (fetched 2026-11-02)

> Iceberg uses metadata in its manifest list and manifest files to speed up query planning and to prune unnecessary data files. The metadata tree functions as an index over a table's data.

> Manifests in the metadata tree are automatically compacted in the order they are added, which makes queries faster when the write pattern aligns with read filters. For example, writing hourly-partitioned data as it arrives is aligned with time range query filters.

> When a table's write pattern doesn't align with the query pattern, metadata can be rewritten to re-group data files into manifests using rewriteManifests or the rewriteManifests action (for parallel rewrites using Spark).

Contents: many small commits (one manifest apiece, inherited from write pattern) leave a table
with as many manifests as commits — the same "metadata bloat" small-files-compaction topic 18
showed for data files, here at the manifest level. `rewriteManifests` re-groups them, same idea
as a data-file compaction, applied one level up the tree.
