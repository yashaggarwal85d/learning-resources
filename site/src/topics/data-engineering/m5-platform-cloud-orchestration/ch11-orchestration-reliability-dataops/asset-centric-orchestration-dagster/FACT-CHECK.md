# Fact-check

1. **An asset definition has three parts: an `AssetKey`, a set of declared upstream asset keys, and a Python function that computes it.** Sourced directly, Dagster docs: "An asset definition includes the following: An AssetKey... A set of upstream asset keys... A Python function, which is responsible for computing the contents of the asset from its upstream dependencies and storing the results."

2. **Dagster has four shapes of asset decorator.** Sourced, Dagster docs: "Dagster has four types of asset decorators" — `@asset`, `@multi_asset`, `@graph_asset`, `@graph_multi_asset`, each described by name.

3. **An asset check is a declared quality gate attached to the asset itself, typically via `@asset_check` or `@multi_asset_check`.** Sourced, Dagster docs: "Asset checks are typically defined using the @asset_check or @multi_asset_check decorator and run either within an asset or separate from the asset."

4. **A check and the asset it targets both have to be passed into `Definitions` before Dagster recognizes them.** Sourced, Dagster docs: "Asset checks must be added to Definitions for Dagster to recognize them." Reproduced directly: `dg.Definitions(assets=[...], asset_checks=[no_negative_amounts])`, then `.resolve_asset_graph()`.

5. **By default, materializing an asset also runs its attached checks in the same job.** Sourced, Dagster docs: "By default, all jobs targeting an asset will also run associated checks."

6. **A failing asset check does not, by itself, stop the rest of a materialization from succeeding.** Reproduced directly: the shop's `raw_orders → stg_orders → fct_orders` pipeline, materialized with a planted bad row (a negative order amount), ran to completion (`result.success` is `True`) while the attached check reported `passed=False` and `bad_rows=1` (examples.py, `materialize_with_a_bad_row()`, real run against Dagster 1.13.28, 2026-10-31). The same pipeline with the row corrected passed the same check (`materialize_with_the_row_fixed()`).

7. **Dagster's asset graph can answer an asset's own transitive upstream directly, with no separate lineage tool.** Reproduced directly: `defs.resolve_asset_graph().get_ancestor_asset_keys(dg.AssetKey("fct_orders"))` returned exactly `['raw_orders', 'stg_orders']`, derived from the same `deps=[...]` declarations already written on the assets themselves (examples.py, `derive_lineage_with_no_extra_tooling()`).

8. **The same pipeline needs fewer explicit dependency-wiring lines as an asset graph than as an equivalent Airflow TaskFlow DAG.** Reproduced directly: counting lines matching `@dg.asset(deps=[...]` / `@dg.asset_check(asset=...)` in the asset-graph file gave 3; counting the equivalent output-to-input wiring lines in `airflow_equivalent.py` gave 4, one of which exists only to force the check into the TaskFlow DAG's run order (examples.py, `count_dependency_wiring_lines()`).

9. **Components and the `dg` CLI reached GA status in Dagster 1.12, having previously been a Release Candidate.** Sourced, Dagster's own changelog: "Components GA: The Components framework and the dg CLI are now marked as GA (previously Release Candidate). The APIs are fully supported throughout all parts of the product and remain the recommended defaults for new Dagster projects."

10. **Where the asset model fits poorly — imperative side effects and purely operational workflows — is this topic's own stated judgment, not a quoted claim.** It follows directly from the sourced definition of an asset (a computed, stored data product with a declared upstream): an action like sending an email or calling a payment API produces no such product, and an operational step like a deploy or a cleanup job isn't modeling one either, so neither maps naturally onto the asset graph's own unit of work. Dagster's own docs support the asset's definition this reasoning is built on, without making the "fits poorly" claim themselves.
