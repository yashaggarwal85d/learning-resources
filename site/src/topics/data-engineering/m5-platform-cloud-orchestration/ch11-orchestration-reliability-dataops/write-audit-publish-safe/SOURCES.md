# Sources

## Branching and Tagging (Apache Iceberg Documentation)

URL: https://iceberg.apache.org/docs/latest/branching/
Version: Apache Iceberg docs, Java latest (1.12.0) (fetched 2026-10-31)

> Writes are performed on a separate audit-branch independent from the main table history.

> A validation workflow can validate (e.g. data quality) the state of audit-branch.

> After validation, the main branch can be fastForward to the head of audit-branch to update the main table state.

## Build write-audit-publish pattern with Apache Iceberg branching and AWS Glue Data Quality (AWS Big Data Blog)

URL: https://aws.amazon.com/blogs/big-data/build-write-audit-publish-pattern-with-apache-iceberg-branching-and-aws-glue-data-quality/
Version: AWS Big Data Blog (fetched 2026-10-31)

> Data is initially written to a staging branch

> Quality checks are performed on the staging branch

> Validated data is merged into the main branch for consumption

> these updates aren't accessible to downstream users who can only access the main branch
