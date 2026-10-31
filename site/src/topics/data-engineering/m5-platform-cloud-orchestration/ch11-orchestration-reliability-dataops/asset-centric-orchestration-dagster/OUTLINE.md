# Outline: Asset-centric orchestration (Dagster model)

## Engagement arc

1. **Hook** — a team hand-maintains a lineage spreadsheet for its Airflow DAG (nobody trusts it); Dagster's asset graph answers the same "what feeds this" question by asking the asset itself.
2. **Reveal: the same pipeline, two shapes, measured** — the real experiment: the shop's `orders` pipeline expressed as a Dagster asset graph (3 dependency-wiring lines) vs. the equivalent Airflow TaskFlow DAG (4 dependency-wiring lines), counted directly from both files.
3. **Predict: does a failing check stop the pipeline?** — before the reveal, ask whether an asset check that fails blocks the rest of the graph from materializing.
4. **Reveal: an asset check, run live** — the real experiment: the three-asset pipeline materialized with a planted bad row (check fails, run still succeeds, bad row caught), then materialized again with the row fixed (check passes).
5. **Predict: does Dagster need separate lineage tooling?** — before the reveal, ask whether a lineage graph has to be built and maintained on the side.
6. **Reveal: lineage, asked for rather than hand-maintained** — the real experiment: Dagster's own asset graph answers `fct_orders`'s full transitive upstream with zero extra tooling.
7. **Reveal: Components, the `dg` CLI, and where the model fits poorly** — Components/`dg` reaching GA in 1.12 per Dagster's own changelog; imperative side effects and operational workflows as the two kinds of work the asset model doesn't fit.
8. **Recap** — a task graph's nodes are actions; an asset graph's nodes are the data products themselves, and lineage falls out of that choice for free, at the cost of a model that doesn't fit every kind of work.
9. **Prove it** — back to the hook's spreadsheet team: does adding a fourth stage to the pipeline change how its lineage is derived?

## Deep dives

- **Internals**: the four asset decorator shapes (`@asset`, `@multi_asset`, `@graph_asset`, `@graph_multi_asset`); the `Definitions` object as the thing Dagster actually resolves a graph from; asset checks via `@asset_check`/`@multi_asset_check`, run by default alongside the asset's own job.
- **Frontier**: Components and the `dg` CLI's GA status (1.12, previously Release Candidate) as Dagster's packaging/scaffolding layer; FreshnessPolicy's own GA status in the same release, noted but not this topic's main thread (topic 7 already covers it).
