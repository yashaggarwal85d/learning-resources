Last verified: 30 October 2026. Expert sign-off: pending. Two real tools run against the same
five-row synthetic `orders` table (`examples.py`): a complete `dbt-core` 1.12.6 / `dbt-duckdb`
1.11.1 project (`dbt build`, real `run_results.json`) and a real Great Expectations Core 1.24.1
`ExpectationSuite` validated against a pandas DataFrame. Deequ/PyDeequ and Databricks DQX are not
run — both need Apache Spark, and `import pyspark` fails in this sandbox (checked directly); Soda's
checks need a connected data platform, which this sandbox also doesn't have. All three are named
and sourced from their own documentation only, per `CHAPTER.md`'s own lab table.

- dbt, "Data tests": [docs.getdbt.com](https://docs.getdbt.com/docs/build/data-tests). Singular and generic data tests as SQL queries for failing rows.
- dbt, "Unit tests": [docs.getdbt.com](https://docs.getdbt.com/docs/build/unit-tests). Logic checks against static, mocked fixtures.
- Great Expectations, "GX Core overview": [docs.greatexpectations.io](https://docs.greatexpectations.io/docs/core/introduction/gx_overview). An Expectation and an Expectation Suite.
- Great Expectations, "An Update for the Great Expectations Community": [greatexpectations.io](https://greatexpectations.io/blog/an-update-from-great-expectations/). Fivetran's stewardship of GX Core, 6 May 2026.
- Soda, "Contract Language Reference": [docs.soda.io](https://docs.soda.io/soda-documentation/developer-tools/contract-language-reference.md). A data contract as a YAML document of checks.
- Deequ README: [raw.githubusercontent.com](https://raw.githubusercontent.com/awslabs/deequ/master/README.md) (the `github.com/awslabs/deequ` page itself 403s to this session's scoped GitHub access, same limitation topic 10 hit on Amundsen; the raw-content mirror is the same README, machine-verified). "Unit tests for data," built on Apache Spark.
- Databricks DQX: [databrickslabs.github.io](https://databrickslabs.github.io/dqx/). The data quality framework for Databricks' PySpark pipelines.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-quality-frameworks:%20).
