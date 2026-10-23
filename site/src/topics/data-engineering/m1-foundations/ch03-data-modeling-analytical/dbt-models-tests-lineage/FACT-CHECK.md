# Fact-check — de.dbt-models-tests-lineage

| # | Claim | Status | Basis |
|---|---|---|---|
| 1 | A dbt SQL model is just a `select` statement; dbt wraps it in the DDL/DML for the target warehouse | Confirmed | SOURCES.md, "SQL models": "A SQL model is a select statement." |
| 2 | `ref()` is how dependencies between models are declared, in place of hardcoded table names | Confirmed | SOURCES.md, "SQL models": "You can build dependencies between models by using the ref function in place of table names in a query." |
| 3 | dbt uses `ref()` to compute build order via a DAG | Confirmed | SOURCES.md, "SQL models": "Determine the order to run the models by creating a dependent acyclic graph (DAG)." |
| 4 | A Jinja macro lets repeated SQL logic be written once and reused across models | Confirmed | SOURCES.md, "Jinja and macros" |
| 5 | Data tests are assertions about models, expressed as `select` queries that return failing rows | Confirmed | SOURCES.md, "Add data tests to your DAG" |
| 6 | dbt ships four built-in generic data tests: `unique`, `not_null`, `accepted_values`, `relationships` | Confirmed | SOURCES.md, same page |
| 7 | Unit tests validate modeling logic against fixed static inputs, before real data is materialized | Confirmed | SOURCES.md, "Unit tests" |
| 8 | Exposures declare a downstream consumer (dashboard, application, pipeline) of a dbt project | Confirmed | SOURCES.md, "Add Exposures to your DAG" |
| 9 | dbt's generated documentation includes model code, the project's DAG, and column-level tests | Confirmed | SOURCES.md, "About documentation" |
| 10 | dbt Mesh's cross-project `ref()` is its foundational multi-project feature | Confirmed | SOURCES.md, "Intro to dbt Mesh" |
| 11 | An enforced model contract must declare every column's name and type | Confirmed | SOURCES.md, "Model contracts" |
| 12 | Model versions are a dbt Mesh governance feature for tracking changes to a model over time | Confirmed | SOURCES.md, "Model versions" |
| 13 | Models carry an access modifier (private/protected/public) governing who can `ref()` them | Confirmed | SOURCES.md, "Model access" |
| 14 | Cross-project `ref()` requires an Enterprise or Enterprise+ plan and designating a public model | Confirmed | SOURCES.md, "Project dependencies" |

## Lab claims (executed, not just sourced)

- **The `ref()`-built DAG is dbt's own output, not a hand-drawn diagram.** `lab/manifest-dag.json`
  is a frozen snapshot of `target/manifest.json`'s `depends_on` field, written by a real
  `dbt build` in this session. `examples.py` asserts against it directly.
- **A failing data test actually blocks downstream models.** A dangling `customer_id` (99,
  absent from `raw_customers`) was inserted into `raw_orders.csv`, and
  `dbt build --select stg_orders+` failed the `relationships` test and `SKIP`ped `fct_orders`,
  `mart_revenue_by_region`, and the exposure — not merely reported a warning. Reverted and
  re-verified clean (`lab/README.md`).
- **The unit test runs without touching any seeded data.** `dbt test --select test_type:unit`
  passes by feeding two fabricated rows straight into `stg_orders`'s compiled logic.
- **Skipping `ref()` for a plain table name breaks the DAG, not just the diagram.** A model
  selecting from `main.stg_orders` directly (no `ref()`) was run with `dbt build --threads 8`
  against a freshly emptied database and failed with `Catalog Error: Table with name stg_orders
  does not exist!` — dbt scheduled it concurrently with `stg_orders` because no dependency edge
  existed, and it lost the race. This is the reel's own "Prove it" scenario, executed for real.

## Red-team analysis of the three predicts

- **Predict 1 (step 3):** the wrong answer ("writing the literal table name also creates a
  dependency dbt can see") is directly refuted by the reveal — dbt only sees `ref()`, confirmed
  by the Prove-It failure above happening to the exact same mistake.
- **Predict 2 (step 6):** the wrong answer ("the macro has to be edited in every model that uses
  it") is refuted by construction — `cents_to_dollars()` is defined once and called once in this
  lab; a change to its own body would change every caller without touching caller code.
- **Predict 3 (step 8):** the wrong answer ("dbt will still try to build on top of failing data,
  just with a warning") is directly refuted by the real `SKIP` results shown above.
