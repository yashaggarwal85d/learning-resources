# Sources: Data quality frameworks (`de.data-quality-frameworks`)

dbt's own data-tests and unit-tests documentation, Great Expectations's own stewardship
announcement post, Soda's current documentation (contracts and CLI), and the Deequ and
Databricks Labs DQX projects' own README files.

## dbt — Data tests

URL: https://docs.getdbt.com/docs/build/data-tests
Retrieved 2026-11-02

> You can use data tests to improve the integrity of the SQL in each model by making assertions about the results generated. Out of the box, you can test whether a specified column in a model only contains non-null values, unique values, or values that have a corresponding value in another model (for example, a customer_id for an order corresponds to an id in the customers model), and values from a specified list.

> Like almost everything in dbt, data tests are SQL queries. In particular, they are select statements that seek to grab "failing" records, ones that disprove your assertion. If you assert that a column is unique in a model, the test query selects for duplicates; if you assert that a column is never null, the test seeks nulls. If the data test returns zero failing rows, it passes, and your assertion has been validated.

> Out of the box, dbt ships with four generic data tests already defined: unique, not_null, accepted_values, and relationships.

> Singular data tests placed in the tests directory are automatically executed when running dbt test. Don't reference singular tests in model_name.yml, as they are not treated as generic tests or macros, and doing so will result in an error.

Contents: generic and singular data tests, the four built-in generic tests, and the
select-for-failing-rows mechanism — the "dbt data tests" clause.

## dbt — Unit tests

URL: https://docs.getdbt.com/docs/build/unit-tests
Retrieved 2026-11-02

> There is an additional type of test in dbt: unit tests. In software programming, unit tests validate small portions of your functional code, and they work much the same way here. Unit tests allow you to validate your SQL modeling logic on a small set of static inputs before you materialize your full model in production.

> We currently only support unit testing SQL models.

Contents: the data-vs-logic distinction between dbt's data tests and its unit tests — the
"dbt unit tests" clause.

## Great Expectations's own stewardship announcement

URL: https://greatexpectations.io/blog/an-update-from-great-expectations/
Dated May 06, 2026, retrieved 2026-11-02

> Great Expectations (GX) and Fair Isaac Corporation (FICO) have completed a definitive agreement to acquire GX Cloud and incorporate it into the FICO platform as the foundation for its next-generation data quality!

> As part of this transition, GX Cloud will no longer be publicly available beginning June 1.

> Fivetran will become the new steward of the Great Expectations open source community and the GX Core project, supporting the continued development of one of the industry's most widely used open source data quality frameworks.

> Under the planned transition, GX Core will continue as an open source, community-driven project. Fivetran intends to support ongoing project maintenance, ecosystem integrations, and community engagement.

Contents: the exact GX stewardship facts and their date — the "GX Core expectation suites"
clause's ownership facts. The post itself (dated May 06, 2026) announces both the FICO/GX
Cloud transaction and the Fivetran stewardship, matching the syllabus clause's "May 2026".

## Soda — current documentation (Data Contracts overview)

URL: https://docs.soda.io/soda-documentation/get-started/readme.md
Retrieved 2026-11-02

> **Define data contracts,** making expectations explicit and enabling producers and consumers to collaborate on reliable data at the source.

> **Soda Core** | Open-source Python library (with commercial extensions) and CLI for running Data Contracts in your pipelines.

Note: the planning-time `soda-v4` docs path now 404s; the current docs tree lives at
`/soda-documentation/`, confirmed via `/soda-documentation/govern/migrate-from-v3-to-v4.md`.

## Soda — Contract Language reference

URL: https://docs.soda.io/soda-documentation/developer-tools/contract-language-reference.md
Retrieved 2026-11-02

> A Soda data contract is a YAML document that contains data quality checks. The checks in a Soda data contract are similar to unit tests for testing software. Verifying a contract means evaluating the checks against the actual data.

> A Soda data contract YAML must include the following blocks:

> A top-level `dataset:` key

> A `checks:` block, if you're defining dataset-wide checks

Contents: the YAML contract format, verified current — the "Soda 4 contracts-first engine"
clause's format.

## Soda — Git-managed Data Contracts

URL: https://docs.soda.io/soda-documentation/find/data-testing/git-managed-data-contracts.md
Retrieved 2026-11-02

> In this model, contracts are written in YAML and stored in your Git repository, right alongside your data models, transformation logic, and CI/CD workflows. You write, version, test, and promote contracts just like any other code artifact.

## Soda — PyPI release metadata (version verification)

URL: https://pypi.org/pypi/soda-core/4.29.0/json
Retrieved 2026-11-02; pinned to the 4.29.0 release record on 2026-11-08, after the unpinned URL moved on to 4.30.0

> "version":"4.29.0"

Contents: the current released version of the `soda-core` package, confirming "Soda 4" at
build time, since the planning-time page gave the product name and sections but not a
version.

## Deequ's own README (AWS Labs)

URL: https://raw.githubusercontent.com/awslabs/deequ/master/README.md
Retrieved 2026-11-02 (github.com/awslabs/deequ returns HTTP 403 to this sandbox's fetcher;
this is the identical README content, cross-confirmed against the rendered GitHub page via a
separate direct fetch)

> Deequ is a library built on top of Apache Spark for defining "unit tests for data", which measure data quality in large datasets.

> The main entry point for defining how you expect your data to look is the

> from which you can add

> that define constraints on attributes of the data.

Contents: the README also links a "Persistence and querying of computed metrics of the data
with a MetricsRepository" example and an "Incremental metrics computation on growing data and
metric updates on partitioned data" (advanced) example, naming the two mechanisms the
"Deequ/PyDeequ metric-based checks" and "incremental metrics" clauses rest on: a
VerificationSuite that evaluates Checks against computed metrics, and incremental computation
of those same metrics across partitions.

## Databricks Labs DQX's own README

URL: https://raw.githubusercontent.com/databrickslabs/dqx/main/README.md
Retrieved 2026-11-02 (github.com/databrickslabs/dqx returns HTTP 403 to this sandbox's
fetcher; this is the identical README content, cross-confirmed against the rendered GitHub
page via a separate direct fetch)

> Simplified Data Quality checking at Scale for PySpark Workloads on streaming and standard DataFrames.

> **Rule-based quality checks** — 80+ built-in checks (null, range, regex, referential, aggregate, geo, PII, and more) for row-level and column/dataset-level validation, with support for custom check functions.

> **Data format agnostic & streaming support** — works with PySpark DataFrames and applies checks to both batch and Spark Structured Streaming (including Lakeflow Pipelines / DLT) using the same API.

Contents: PySpark checks for batch and streaming — the "Databricks DQX" clause.

## This course's own measurement

URL: (none — this course's own code, not a fetched source)

`examples.py` implements a dbt-style generic data test (a not-null select-for-failures
query), a dbt-style unit test (asserting transformation logic on small fixed-input rows
before a full table is ever built), and an incremental-vs-full-recompute metric across
partitions with a sampling-miss demonstration, to verify the cost and correctness claims
against runnable code.
