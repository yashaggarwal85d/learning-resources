# Sources — de.data-quality-frameworks

## dbt — Data tests

URL: https://docs.getdbt.com/docs/build/data-tests

> Like almost everything in dbt, data tests are SQL queries. In particular, they are select statements that seek to grab "failing" records, ones that disprove your assertion.

> A singular data test, in its simplest form, is when you write a SQL query that returns failing rows, you can save that query in a .sql file within your test directory.

> A generic data test is a parameterized query that accepts arguments.

## dbt — Unit tests

URL: https://docs.getdbt.com/docs/build/unit-tests

> Unit tests allow you to validate your SQL modeling logic on a small set of static inputs before you materialize your full model in production.

> Because unit tests use static fixtures instead of real data, they don't need to necessarily run on your data platform.

## Great Expectations — GX Core overview

URL: https://docs.greatexpectations.io/docs/core/introduction/gx_overview

> An Expectation is a verifiable assertion about data.

> An Expectation Suite is a collection of Expectations.

## Great Expectations — An Update for the Great Expectations Community

URL: https://greatexpectations.io/blog/an-update-from-great-expectations/

> Fivetran will become the new steward of the Great Expectations open source community and the GX Core project, supporting the continued development of one of the industry's most widely used open source data quality frameworks.

> Great Expectations (GX) and Fair Isaac Corporation (FICO) have completed a definitive agreement to acquire GX Cloud and incorporate it into the FICO platform as the foundation for its next-generation data quality!

> Under the planned transition, GX Core will continue as an open source, community-driven project.

## Soda — Contract Language Reference

URL: https://docs.soda.io/soda-documentation/developer-tools/contract-language-reference.md

> A Soda data contract is a YAML document that contains data quality checks. The checks in a Soda data contract are similar to unit tests for testing software.

## Deequ — README (awslabs/deequ)

URL: https://raw.githubusercontent.com/awslabs/deequ/master/README.md

> Deequ is a library built on top of Apache Spark for defining "unit tests for data", which measure data quality in large datasets.

## Databricks DQX — project site

URL: https://databrickslabs.github.io/dqx/

> DQX is the data quality framework for Databricks — define, monitor, and act on data quality issues across your lakehouse.

> Define and run checks in your PySpark pipelines and notebooks — batch and streaming.
