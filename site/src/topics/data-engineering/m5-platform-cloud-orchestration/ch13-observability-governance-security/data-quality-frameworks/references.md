Last verified: 2 November 2026. Expert sign-off: pending. Three claims run in `examples.py`
against a toy dbt-style data test, a toy dbt-style unit test, an incremental metric, and a
sample-vs-full-scan comparison -- all asserts pass.

- dbt, "Add data tests to your DAG": [docs.getdbt.com](https://docs.getdbt.com/docs/build/data-tests). Generic and singular data tests.
- dbt, "Unit tests": [docs.getdbt.com](https://docs.getdbt.com/docs/build/unit-tests). Mocked-input logic tests.
- Great Expectations, "An Update for the Great Expectations Community": [greatexpectations.io](https://greatexpectations.io/blog/an-update-from-great-expectations/). The FICO/GX Cloud and Fivetran/GX Core stewardship facts, dated May 06, 2026.
- Soda, "Contract Language reference": [docs.soda.io](https://docs.soda.io/soda-documentation/developer-tools/contract-language-reference.md). The YAML contract format.
- Soda, "Git-managed Data Contracts": [docs.soda.io](https://docs.soda.io/soda-documentation/find/data-testing/git-managed-data-contracts.md). The code-first contract workflow.
- AWS Labs, Deequ README: [github.com](https://github.com/awslabs/deequ). VerificationSuite, Checks, computed metrics.
- Databricks Labs, DQX README: [github.com](https://github.com/databrickslabs/dqx). PySpark checks, batch and streaming.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-quality-frameworks:%20).
