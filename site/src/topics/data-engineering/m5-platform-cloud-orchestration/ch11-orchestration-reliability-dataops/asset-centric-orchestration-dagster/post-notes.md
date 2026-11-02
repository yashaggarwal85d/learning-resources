<section data-section="outcomes">

## Outcomes

By the end of this topic you can: express a pipeline as a software-defined asset graph and compare its dependency-wiring cost against the same pipeline as a task DAG; attach an asset check and show it failing a bad materialization without stopping the run; read a lineage graph Dagster derived without extra tooling; name two kinds of work the asset model fits poorly and why.

</section>

<section data-section="internals">

## Internals

Dagster has four shapes of asset decorator, not just the plain `@asset`: `@multi_asset` outputs several assets from one function (useful when one API call updates several tables at once); `@graph_asset` and `@graph_multi_asset` let several operations compose into what the graph still sees as one asset (or several), hiding the intermediate steps. All four end up contributing `AssetKey`s and declared upstream dependencies to the same underlying graph.

An asset or a check only becomes part of what Dagster resolves if it's passed into a `Definitions` object: "Asset checks must be added to Definitions for Dagster to recognize them." By default, materializing an asset also runs every check attached to it in the same job — "all jobs targeting an asset will also run associated checks" — though the UI can run a check on its own.

</section>

<section data-section="lab">

## Lab

Three experiments, run against a real Dagster 1.13.28 install:

The shop's `raw_orders` → `stg_orders` → `fct_orders` pipeline, materialized twice: once with a planted bad row (a negative order amount), once with it fixed. The first run succeeds overall, but `no_negative_amounts`, the asset check attached directly to `stg_orders`, reports `passed=False` with `bad_rows=1`. The second, identical pipeline with the row corrected, passes the same check.

The same pipeline's own asset graph, asked directly for `fct_orders`'s transitive upstream via `resolve_asset_graph().get_ancestor_asset_keys()`: `['raw_orders', 'stg_orders']`, with no separate lineage tool built or queried.

The same pipeline counted twice for dependency-wiring lines: 3 for the asset graph (each `deps=[...]` or `asset=...` declaration) against 4 for the equivalent Airflow TaskFlow DAG in `airflow_equivalent.py` -- one of the DAG's four lines exists only to force the check into the run order, which the asset graph needed no equivalent of.

Reproduce: `pip install dagster`; define assets with `@dg.asset(deps=[...])` and a check with `@dg.asset_check(asset=...)`; call `dg.materialize([...])` with the check function included directly in the list (not a separate `asset_checks=` kwarg, which raises `TypeError` in 1.13.28); read `result.get_asset_check_evaluations()` for the check's own verdict.

</section>

<section data-section="production">

## Production

The dependency-wiring comparison (3 lines vs. 4) is small on purpose -- it isolates exactly one cost, the code needed to tell the system what feeds what, and nothing about data volume or scheduling complexity. The real-world version of that gap doesn't stay small: a lakehouse with a hundred tables wired as explicit task-to-task edges accumulates wiring code roughly in step with the number of edges, while an asset graph's wiring cost per table stays the same three-or-so lines regardless of how many other tables exist, because each asset only ever declares its own upstream.

The asset check result in this lab is the realistic case, not a contrived one: Dagster's own docs describe checks as typically verifying "a particular column doesn't contain null values" or that "a tabular asset adheres to a specified schema" -- exactly the kind of row-level validation that catches bad data without being coupled to how the pipeline that produced it is scheduled.

</section>

<section data-section="frontier">

## Frontier

Components and the `dg` CLI -- Dagster's scaffolding and packaging layer, letting a project define reusable asset-producing components rather than hand-writing every asset -- reached GA status in release 1.12, "previously Release Candidate," per Dagster's own changelog, and are now "the recommended defaults for new Dagster projects." The asset model's own limits are just as real: an imperative side effect like sending an email or calling a payment API has no data product to name as its output, and a purely operational workflow (a deploy step, a cleanup job) isn't modeling a table or a file either -- both are usually left to Dagster's own ops jobs or to a task orchestrator instead, rather than forced into the asset shape.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Two orchestration philosophies -- task-first and asset-first -- have each earned their place by now, and durable, long-lived workflows are a third shape again. Choosing among a wider field of named tools, rather than building up the mental models one at a time, is next.

</section>
