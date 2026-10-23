# Sources — de.dbt-models-tests-lineage

All quotes verified word for word against the fetched text in `sources/` via
`node scripts/sources.mjs check`.

## dbt Developer Hub, "SQL models"
URL: https://docs.getdbt.com/docs/build/sql-models

> A SQL model is a select statement.

> You can build dependencies between models by using the ref function in place of table names in a query.

> Determine the order to run the models by creating a dependent acyclic graph (DAG).

## dbt Developer Hub, "Jinja and macros"
URL: https://docs.getdbt.com/docs/build/jinja-macros

> Macros in Jinja are pieces of code that can be reused multiple times – they are analogous to "functions" in other programming languages, and are extremely useful if you find yourself repeating code across multiple models.

## dbt Developer Hub, "Add data tests to your DAG"
URL: https://docs.getdbt.com/docs/build/data-tests

> Data tests are assertions you make about your models and other resources in your dbt project (for example, sources, seeds, and snapshots).

> If the data test returns zero failing rows, it passes, and your assertion has been validated.

> Out of the box, dbt ships with four generic data tests already defined: unique, not_null, accepted_values, and relationships.

## dbt Developer Hub, "Unit tests"
URL: https://docs.getdbt.com/docs/build/unit-tests

> Unit tests allow you to validate your SQL modeling logic on a small set of static inputs before you materialize your full model in production.

## dbt Developer Hub, "Add Exposures to your DAG"
URL: https://docs.getdbt.com/docs/build/exposures

> Exposures make it possible to define and describe a downstream use of your dbt project, such as in a dashboard, application, or data science pipeline.

## dbt Developer Hub, "About documentation"
URL: https://docs.getdbt.com/docs/collaborate/documentation

> Information about your project: including model code, a DAG of your project, any tests you've added to a column, and more.

## dbt Developer Hub, "Intro to dbt Mesh"
URL: https://docs.getdbt.com/best-practices/how-we-mesh/mesh-1-intro

> Cross-project references - this is the foundational feature that enables the multi-project deployments.

## dbt Developer Hub, "Model contracts"
URL: https://docs.getdbt.com/docs/collaborate/govern/model-contracts

> To enforce a model's contract, set enforced: true under the contract configuration.

> When enforced, your contract must include every column's name and data_type (where data_type matches one that your data platform understands).

## dbt Developer Hub, "Model versions"
URL: https://docs.getdbt.com/docs/collaborate/govern/model-versions

> Model versions — A dbt Mesh feature that enables better governance and data model management by allowing you to track changes and updates to models over time.

## dbt Developer Hub, "Model access"
URL: https://docs.getdbt.com/docs/collaborate/govern/model-access

> Models can set an access modifier to indicate their intended level of accessibility.

## dbt Developer Hub, "Project dependencies"
URL: https://docs.getdbt.com/docs/collaborate/govern/project-dependencies

> Available in dbt Enterprise or Enterprise+. To use it, designate a public model and add a cross-project ref.

### Disclosure

This topic's hands-on dbt-core project (`lab/shop_dbt/`) was built and run against a local
DuckDB target in this session: `dbt seed`, `dbt build` (models, data tests, the one unit test,
the exposure), and `dbt docs generate` all ran for real, not merely described. The `ref()`-built
DAG shown in `examples.py` is read directly from the project's own `target/manifest.json` after a
real build, not hand-drawn. A failing `relationships` data test was deliberately introduced
(a dangling `customer_id`) and shown to block `fct_orders`, `mart_revenue_by_region`, and the
exposure from building (all `SKIP`), then reverted; both the failing and the clean run are
documented in `lab/README.md`.

dbt Mesh's own cross-project, model-contract, model-version, and model-access mechanics are
named and sourced from dbt's own documentation above, not built hands-on: dbt Mesh's
cross-project `ref()` requires an Enterprise or Enterprise+ plan and a second project, which this
session's single local DuckDB project cannot stand up — exactly as CHAPTER.md's own scope
distinguishes ("named and sourced... with the single-project mechanics above built hands-on
first").
