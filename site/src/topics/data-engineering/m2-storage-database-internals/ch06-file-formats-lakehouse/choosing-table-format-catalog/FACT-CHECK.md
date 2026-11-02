# FACT-CHECK — de.choosing-table-format-catalog

## Claims

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | Spark writes Iceberg DataFrames via its v2 DataFrame write API | Apache Iceberg, Spark getting started | Yes, quoted verbatim |
| 2 | Flink supports both the DataStream API and Table API for Iceberg | Apache Iceberg, Flink getting started | Yes, quoted verbatim |
| 3 | The Delta Flink connector enables reading from and writing to Delta tables | Delta Lake, Apache Flink connector | Yes, quoted verbatim |
| 4 | Trino's Iceberg connector provides read and write access to data and metadata | Trino, Iceberg connector | Yes, quoted verbatim |
| 5 | Trino's Delta Lake connector supports INSERT, DELETE, UPDATE, and MERGE | Trino, Delta Lake connector | Yes, quoted verbatim |
| 6 | DuckDB's direct (non-catalog) Iceberg access is read-only; catalog access unlocks writing | DuckDB, Iceberg extension | Yes, quoted verbatim |
| 7 | DuckDB's Delta extension writes via create and append only, not replace/update/merge | DuckDB, Delta extension | Yes, quoted verbatim |
| 8 | Snowflake-managed Iceberg tables get full read and write support | Snowflake, Apache Iceberg tables | Yes, quoted verbatim |
| 9 | Snowflake supports writes to externally managed Iceberg tables via a REST catalog | Snowflake, Apache Iceberg tables | Yes, quoted verbatim |
| 10 | Snowflake's own Delta Lake docs describe reading Delta table files, never writing them | Snowflake, Apache Iceberg tables | Yes, absence-of-write-language confirmed by direct read of the page |
| 11 | BigQuery's managed Iceberg tables support real DML table mutations | Google BigQuery, Apache Iceberg managed tables | Yes, quoted verbatim |
| 12 | BigQuery's load/LOAD DATA path for Iceberg managed tables is append-only | Google BigQuery, Apache Iceberg managed tables | Yes, quoted verbatim |
| 13 | Redshift can query Iceberg tables cataloged in AWS Glue | Amazon Redshift, Using Apache Iceberg tables | Yes, quoted verbatim |
| 14 | Redshift's own docs reference writing to Iceberg tables as a current capability | Amazon Redshift, Using Apache Iceberg tables | Yes, quoted verbatim |
| 15 | Redshift Spectrum reads Delta Lake tables via manifest files; no write path described | AWS, Redshift Spectrum Hudi/Delta announcement | Yes, quoted verbatim |
| 16 | Databricks announced its agreement to acquire Tabular, citing the Delta/Iceberg format split | Databricks, Databricks Agrees to Acquire Tabular | Yes, quoted verbatim, dated June 2024 |
| 17 | Databricks open-sourced Unity Catalog | Databricks, Databricks Open Sources Unity Catalog | Yes, quoted verbatim, dated June 2024 |
| 18 | Snowflake unveiled Polaris Catalog, committing to open-source it | Snowflake, Snowflake Unveils Polaris Catalog | Yes, quoted verbatim, dated June 2024 |
| 19 | More named engines can write Iceberg today than can write Delta | This script, computed from the sourced matrix | Yes, executed and asserted |
| 20 | Given analytics.events' real writer engines (Snowflake, BigQuery, DuckDB) and an upsert-heavy workload, only Iceberg survives the decision framework | This script, run and asserted | Yes, executed |

## Red team

- Running seven real query engines in this sandbox isn't feasible, so the support matrix itself
  is sourced, literal data, not an executed engine call -- disclosed up front. The decision
  framework that runs over that data IS real, executed Python, asserted against a known outcome.
- Redshift's exact GA date for Iceberg write support could not be independently re-fetched and
  quoted (the AWS "What's New" post naming it only appeared in search results, not a direct
  fetch); this topic states that Redshift's own current docs reference writing to Iceberg tables
  as a real capability (quoted directly), without pinning an exact GA date.
- The three "June 2024" events are each the vendor's own announcement date (confirmed June 3, 4,
  and 12 in the fetched press releases), not rounded from a nearby month.
- Snowflake's "cannot write Delta" conclusion is drawn from the absence of any write-capable
  language on Snowflake's own Delta Lake documentation page, not from a direct "Snowflake does not
  support writing Delta" quote -- the page describes reading Delta table files via an
  Iceberg-table conversion path and nothing else.
- The BigQuery and DuckDB findings each correct an easy rounding: BigQuery's managed Iceberg
  tables are not merely read-only external tables (they support real DML and streaming writes);
  DuckDB's write paths for the two formats are asymmetric in opposite directions (Iceberg needs a
  catalog but then has no write limit; Delta needs no catalog but stays append-only).

## Scope boundary

This topic builds a real, sourced engine support matrix and a real decision framework that runs
over it, applied to the `analytics.events` table this chapter built across topics 19-32. It does
not run any of the seven named query engines, does not re-verify every vendor's current GA dates
for every feature, and does not claim the specific workload characteristics assigned to
`analytics.events` here (its writer engines, its upsert-heaviness) are canonical -- they are this
script's own illustrative choice, applying real support-matrix data to a concrete, chapter-
consistent example.
