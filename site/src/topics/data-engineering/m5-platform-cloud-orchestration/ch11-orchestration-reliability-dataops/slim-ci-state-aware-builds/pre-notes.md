# Before you watch

- **`state:modified`** — a dbt selector that finds every model changed since a stored manifest, plus (`+`) everything downstream.
- **`--defer`** — lets an unselected, not-yet-built model resolve to its production relation instead of being rebuilt.
- **SQLMesh plan** — a preview of exactly what a change would affect, computed before anything actually runs.
- **Virtual environment** — SQLMesh's mechanism for promoting an already-built output to production with no recomputation.
- **Column-level breaking change** — a rename or type change on one column, breaking even when the model's own contract looks unchanged.
- **Seeded synthetic data** — a small, fixed sample used in CI in place of full-scale production data.
- **SLA regression gate** — a CI check that fails a build on a measured latency breach, not only on a wrong value.
