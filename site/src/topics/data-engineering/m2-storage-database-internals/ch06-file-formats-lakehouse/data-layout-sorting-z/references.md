Last verified: 2 November 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real 256-row
dataset laid out three real ways, real row-group bounds, a real two-column predicate measured
against each layout, and a real incremental-vs-full reclustering measured by rows rewritten.

- Delta Lake, "Use liquid clustering for Delta tables": [docs.delta.io](https://docs.delta.io/delta-clustering/). Fetched 2026-11-02. Incremental vs. full reclustering, the mechanism this topic reproduces.
- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. The table specification's own Sorting section.
- Databricks, "Data skipping": [docs.databricks.com](https://docs.databricks.com/en/delta/data-skipping.html). Fetched 2026-11-02. Per-file statistics and Z-ordering.
- Apache Hudi, "Clustering": [hudi.apache.org](https://hudi.apache.org/docs/clustering). Fetched 2026-11-02. Stitching small files and sorting by clustering columns.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-layout-sorting-z:%20).
