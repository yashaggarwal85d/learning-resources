# Before you watch

- **Software-defined asset** — Dagster's unit of work: a Python function whose output is a data product (a table, a file, a model), with an `AssetKey` and a declared set of upstream asset keys.
- **Materialization** — one asset's computed-and-stored instance, produced by running its function.
- **Asset check** — a declared quality gate attached to an asset itself, run alongside its materialization rather than wired in as a separate task.
- **Definitions** — the object Dagster actually resolves an asset graph from; assets and checks only count once they're passed into it.
- **Lineage** — the record of what an asset transitively depends on; in Dagster this is derived from the declared asset graph rather than hand-maintained.
- **Components / `dg` CLI** — Dagster's packaging and scaffolding layer for new projects.
- **Imperative side effect** — an action (sending an email, calling a payment API) with no data product to name as its result.
