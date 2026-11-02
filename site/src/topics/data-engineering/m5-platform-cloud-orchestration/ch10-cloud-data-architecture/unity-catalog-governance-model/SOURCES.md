## Databricks: What is Unity Catalog?

URL: https://docs.databricks.com/en/data-governance/unity-catalog/index.html
Version: fetched 2026-10-31

> Every asset you govern in Unity Catalog is modeled as a securable object, an object on which you can grant permissions to users, service principals, or groups. Data and AI assets such as tables, views, volumes, functions, models, and services (model services and MCP services) follow a three-level namespace (catalog.schema.object).

> Tables and volumes can be managed, where Unity Catalog handles both governance and the underlying file storage lifecycle, or external, where Unity Catalog handles governance only.

> Unity Catalog is also available as an open-source implementation.

## Databricks: What are catalogs in Databricks?

URL: https://docs.databricks.com/en/catalogs/index.html
Version: fetched 2026-10-31

> Catalogs are the first layer in Unity Catalog's three-level namespace (catalog.schema.table-etc). They contain schemas, which in turn can contain tables, views, volumes, models, and functions. Catalogs are registered in a Unity Catalog metastore in your Databricks account.

> Each catalog typically has its own managed storage location to store managed tables and volumes, providing physical data isolation at the catalog level.

> Because your Databricks account has one metastore per region, catalogs are inherently isolated by region.

## Databricks: Unity Catalog privileges reference

URL: https://docs.databricks.com/en/data-governance/unity-catalog/manage-privileges/privileges.html
Version: fetched 2026-10-31

> Due to privilege inheritance, you can grant SELECT on a schema to automatically grant SELECT on all current and future tables and views in the schema. Similarly, you can grant SELECT on a catalog to automatically grant SELECT on all current and future tables and views in the catalog.

## Databricks: Row filters and column masks

URL: https://docs.databricks.com/en/data-governance/unity-catalog/row-and-column-filters.html
Version: fetched 2026-10-31

> ABAC policiesTables and columns matched by tag conditionsCREATE POLICY attached to a catalog, schema, or table by its owner or a user with MANAGECentralized rules applied automatically across many tables

## Databricks: Lineage in Unity Catalog

URL: https://docs.databricks.com/en/data-governance/unity-catalog/data-lineage.html
Version: fetched 2026-10-31

> Unity Catalog captures lineage automatically for queries run on Databricks, down to the column level, and aggregates it across all workspaces attached to the metastore.

## Databricks: Audit log system table reference

URL: https://docs.databricks.com/en/admin/system-tables/audit-logs.html
Version: fetched 2026-10-31

> This article outlines the audit log table schema and has sample queries you can use with the audit log system table to answer common account activity questions.

## Databricks: Connect to external databases and catalogs

URL: https://docs.databricks.com/en/query-federation/index.html
Version: fetched 2026-10-31

> Lakehouse Federation is the Databricks query federation platform. It provides governed, read-only access to external data through Unity Catalog foreign catalogs, with automatic query pushdown and fine-grained access controls at the table level.

> Catalog federationConnect external catalog platforms (such as Hive Metastore, AWS Glue, or Snowflake) so you can query their data directly in object storage.Runs directly against object storage on Databricks compute only.

## Delta Sharing: open protocol (delta.io)

URL: https://delta.io/sharing/
Version: fetched 2026-10-31

> Delta Sharing is the industry's first open protocol for secure data sharing, making it simple to share data with other organizations regardless of which computing platforms they use.

> Easily share live data in your Delta Lake without copying it to another system.

## Delta Sharing Protocol specification

URL: https://raw.githubusercontent.com/delta-io/delta-sharing/main/PROTOCOL.md
Version: fetched 2026-10-31

> Recipient: A principal that has a bearer token to access shared tables.

> the server returns pre-signed URLs for individual data files and the client fetches them via the

> Here are the list of APIs used by Delta Sharing Protocol.

## Unity Catalog (open source) README

URL: https://raw.githubusercontent.com/unitycatalog/unitycatalog/main/README.md
Version: fetched 2026-10-31

> OpenAPI spec and OSS implementation (Apache 2.0 license). It is also compatible with Apache Hive's metastore API and Apache Iceberg's REST catalog API. Unity Catalog is currently a sandbox project with LF AI and Data Foundation (part of the Linux Foundation).

> Unity Catalog is proud to be hosted by the LF AI & Data Foundation.
