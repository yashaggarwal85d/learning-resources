# Sources

## Node selection methods: state (dbt Developer Hub)

URL: https://docs.getdbt.com/reference/node-selection/methods
Version: dbt Developer Hub (fetched 2026-10-31)

> The state method is used to select nodes by comparing them against a previous version of the same project, which is represented by a manifest.

> state:modified: All new nodes, plus any changes to existing nodes.

## Defer (dbt Developer Hub)

URL: https://docs.getdbt.com/reference/node-selection/defer
Version: dbt Developer Hub (fetched 2026-10-31)

> Because model_a is unselected, dbt will check to see if dev_alice.model_a exists. If it doesn't exist, dbt will resolve all instances of {{ ref('model_a') }} to prod.model_a instead.

## Overview (SQLMesh documentation)

URL: https://sqlmesh.readthedocs.io/en/stable/concepts/overview/
Version: SQLMesh documentation (fetched 2026-10-31)

> SQLMesh automatically identifies all affected models and the computations a change entails by creating a "SQLMesh plan."

> It effectively promotes views and tables from non-production to production, but without computation or data movement.

## Get to know the new dbt Fusion engine and VS Code extension (dbt Labs blog)

URL: https://www.getdbt.com/blog/get-to-know-the-new-dbt-fusion-engine-and-vs-code-extension
Version: dbt Labs blog (fetched 2026-10-31)

> Even smarter CI/CD with column-aware change detection.
