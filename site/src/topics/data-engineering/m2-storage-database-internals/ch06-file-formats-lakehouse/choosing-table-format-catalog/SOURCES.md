## Apache Iceberg, Spark getting started

URL: https://iceberg.apache.org/docs/latest/spark-getting-started/
Version: fetched 2026-11-02

> Iceberg supports writing DataFrames using the new v2 DataFrame write API

## Apache Iceberg, Flink getting started

URL: https://iceberg.apache.org/docs/latest/flink/
Version: fetched 2026-11-02

> Apache Iceberg supports both Apache Flink's DataStream API and Table API.

## Delta Lake, Apache Flink connector

URL: https://docs.delta.io/latest/flink-integration.html
Version: fetched 2026-11-02

> This integration enables reading from and writing to Delta tables from Apache Flink.

## Trino, Iceberg connector

URL: https://trino.io/docs/current/connector/iceberg.html
Version: fetched 2026-11-02

> This connector provides read access and write access to data and metadata in
Iceberg.

## Trino, Delta Lake connector

URL: https://trino.io/docs/current/connector/delta-lake.html
Version: fetched 2026-11-02

> You can use the connector to INSERT, DELETE,
UPDATE, and MERGE data in Delta Lake tables.

## DuckDB, Iceberg extension

URL: https://duckdb.org/docs/2.0/core_extensions/iceberg/overview.html
Version: fetched 2026-11-02

> This requires no catalog and is read-only

> unlocks the full feature set, including writing

## DuckDB, Delta extension

URL: https://duckdb.org/docs/2.0/core_extensions/delta.html
Version: fetched 2026-11-02

> reads Delta tables, local and remote, and writes them: it can create tables and append to them.

> CREATE OR REPLACE TABLE and CREATE TABLE ... AS SELECT are not supported

## Snowflake, Apache Iceberg tables

URL: https://docs.snowflake.com/en/user-guide/tables-iceberg
Version: fetched 2026-11-02

> An Iceberg table that uses Snowflake as the Iceberg catalog (Snowflake-managed Iceberg table) provides full Snowflake platform support with
read and write access.

> Snowflake supports writes to externally managed tables that use a remote Iceberg REST catalog.

> Snowflake supports minReaderVersion 3 and can read all tables written by engines that use the latest version of Delta Lake,
which is 4.0.0.

## Google BigQuery, Apache Iceberg managed tables

URL: https://docs.cloud.google.com/bigquery/docs/iceberg-tables
Version: fetched 2026-11-02

> Table mutations using GoogleSQL data manipulation language (DML).

> Batch loading and LOAD DATA
statements only
support appending data to existing Iceberg managed tables.

## Amazon Redshift, Using Apache Iceberg tables

URL: https://docs.aws.amazon.com/redshift/latest/dg/querying-iceberg.html
Version: fetched 2026-11-02

> You can query Apache Iceberg tables cataloged in the AWS Glue Data Catalog with Amazon Redshift.

> Federated identity is not supported when writing to Apache Iceberg tables.

## AWS, Amazon Redshift Spectrum adds support for querying Apache Hudi and Delta Lake

URL: https://aws.amazon.com/about-aws/whats-new/2020/09/amazon-redshift-spectrum-adds-support-for-querying-open-source-apache-hudi-and-delta-lake/
Version: fetched 2026-11-02

> You can now use Amazon Redshift to run read queries against tables in your Amazon S3 data lake with open source Apache Hudi or Delta Lake.

## Databricks, Databricks Agrees to Acquire Tabular

URL: https://www.databricks.com/company/newsroom/press-releases/databricks-agrees-acquire-tabular-company-founded-original-creators
Version: fetched 2026-11-02

> the lakehouse paradigm has been split between the two most popular formats: Delta Lake and Iceberg.

## Databricks, Databricks Open Sources Unity Catalog

URL: https://www.databricks.com/company/newsroom/press-releases/databricks-open-sources-unity-catalog-creating-industrys-only-open
Version: fetched 2026-11-02

> We’re excited to open source Unity Catalog and release the code.

## Snowflake, Snowflake Unveils Polaris Catalog

URL: https://www.snowflake.com/en/news/press-releases/snowflake-unveils-polaris-catalog-and-emphasizes-commitment-to-interoperability-with-aws-google-cloud-microsoft-azure-salesforce-and-more-2
Version: fetched 2026-11-02

> Organizations want open storage and interoperable query engines without lock-in.

> Polaris Catalog will be open sourced in the next 90 days

### Red team

- No Spark/Flink/Trino/DuckDB session is actually started in this script -- the support matrix is
  built as literal, sourced data, not executed against real engine installs (unlike the chapter's
  other topics, which build real local mechanisms). Running seven real query engines in this
  sandbox is not feasible; the decision framework applied to this chapter's own table IS real
  code, executed and asserted.
- The BigQuery Iceberg write-support finding corrects an easy assumption: BigLake managed Iceberg
  tables support real DML writes and Storage Write API streaming, not merely read-only external
  tables -- a genuine, sourced correction, not a rounding to a clean "read-only" answer.
- DuckDB's two formats are asymmetric in a way worth stating precisely: Iceberg write needs a
  catalog (no catalog means read-only); Delta write exists without a catalog but is limited to
  create+append, with no update/delete/merge/replace/alter.
- Snowflake's Delta Lake page states what Snowflake can read from Delta table files (via an
  Iceberg-table conversion path) and never once mentions writing to a Delta table -- the absence
  of any write-capable language, not a direct "Snowflake cannot write Delta" quote, is what
  establishes Delta write is unsupported.
- Redshift's own 2020 Spectrum announcement is the most current primary-source page this script
  could independently verify for Delta Lake support, and it describes read queries only; a later,
  current Redshift-Iceberg-write-GA date exists per AWS's own "What's New" series but could not be
  independently re-fetched and quoted for this topic, so Iceberg write support for Redshift is
  stated in this topic as directional (write support exists, GA date not quoted) rather than
  pinned to an exact date.
- All three "June 2024" consolidation events are the vendor's own press-release dates (Databricks
  Tabular: June 4; Databricks Unity Catalog OSS: June 12; Snowflake Polaris: June 3) -- genuinely
  the same month, not rounded from a nearby date.
