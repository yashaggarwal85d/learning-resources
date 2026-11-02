Last verified: 2 November 2026. Every structural and scan-planning claim demonstrated on screen
is executed and asserted directly against a real Apache Iceberg table built in this sandbox with
the real `pyiceberg` library (a real SQL catalog, real Avro manifest and manifest-list files, a
real `metadata.json`); the `rewrite_manifests` reproduction is built from pyiceberg's own
real manifest-writing and snapshot-commit primitives, since pyiceberg 0.12.0 has no public
high-level action for it.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. The table specification's own metadata-tree and scan-planning sections.
- Apache Iceberg, "Maintenance": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/maintenance/). Fetched 2026-11-02. The metadata tree as an index; manifest compaction order; rewriteManifests.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=iceberg-metadata-tree-scan:%20).
