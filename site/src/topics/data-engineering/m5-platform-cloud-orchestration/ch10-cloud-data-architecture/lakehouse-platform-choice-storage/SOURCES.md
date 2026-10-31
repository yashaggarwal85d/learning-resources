## Databricks: Create a Unity Catalog metastore

URL: https://docs.databricks.com/en/data-governance/unity-catalog/create-metastore.html
Version: fetched 2026-10-31

> In this step, which is optional, you create the S3 bucket required by Unity Catalog to store managed table and volume data at the metastore level. You create the S3 bucket in your own AWS account.

## Databricks: Read Delta Lake tables with Iceberg clients

URL: https://docs.databricks.com/en/delta/uniform.html
Version: fetched 2026-10-31

> Both Delta Lake and Apache Iceberg consist of Parquet data files and a metadata layer. When you enable Iceberg reads, Databricks configures your tables to use the Universal Format (UniForm) for the metadata layer. UniForm automatically generates Iceberg metadata asynchronously alongside the Delta Lake metadata, without rewriting the Parquet data files. A single copy of the data files supports both Delta and Iceberg clients.

## Snowflake: Snowflake key concepts and architecture

URL: https://docs.snowflake.com/en/user-guide/intro-key-concepts
Version: fetched 2026-10-31

> When data is loaded into a Snowflake table, Snowflake reorganizes that data into its internally optimized, compressed, columnar format. Snowflake stores this optimized data in cloud storage.

> Snowflake manages all aspects of how this data is stored — including the organization, file size, structure, compression, metadata, and statistics.

> Apache Iceberg™ tables for Snowflake combine the performance and query semantics of typical Snowflake tables with external cloud storage that you manage.

> Iceberg tables store their data and metadata files in an external cloud storage location; for example, Amazon S3, Google Cloud Storage, or Microsoft Azure Storage. The external storage isn't part of Snowflake.

## Snowflake: Apache Iceberg tables

URL: https://docs.snowflake.com/en/user-guide/tables-iceberg
Version: fetched 2026-10-31

> Snowflake storage (EXTERNAL_VOLUME = SNOWFLAKE_MANAGED):

> Fail-safe. Snowflake bills you for this storage.

> External volume storage: The files are in an external cloud storage location that you manage (Amazon S3, Google Cloud Storage, or Azure Storage). You're responsible for data protection and recovery.

> Snowflake doesn't provide Fail-safe for these tables, and your cloud provider bills you for storage.

## Snowflake: Understanding overall cost

URL: https://docs.snowflake.com/en/user-guide/credits
Version: fetched 2026-10-31

> The total cost of using Snowflake is the aggregate of the cost of using data transfer, storage, and compute resources.

> Using compute resources within Snowflake consumes Snowflake credits. The billed cost of using compute resources is calculated by multiplying the number of consumed credits by the price of a credit.

## Snowflake: About Secure Data Sharing

URL: https://docs.snowflake.com/en/user-guide/data-sharing-intro
Version: fetched 2026-10-31

> Snowflake enables the sharing of databases through shares, which are created by data providers and "imported" by data consumers.

> All database objects shared between accounts are read-only (i.e. the objects cannot be modified or deleted, including adding or
> modifying table data).

> With Secure Data Sharing, no actual data is copied or transferred between accounts. All sharing uses Snowflake's
> services layer and metadata store. Shared data does not take up any storage in a consumer account and therefore does not contribute to the
> consumer's monthly data storage charges.

## Microsoft Fabric: Unify data sources with OneLake shortcuts

URL: https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts
Version: fetched 2026-10-31

> Shortcuts are objects in OneLake that point to other storage locations. The location can be internal or external to OneLake. The location that a shortcut points to is the target path of the shortcut. The location where the shortcut appears is the shortcut path.

> Shortcuts appear as folders in OneLake and any workload or service that has access to OneLake can use them. Shortcuts behave like symbolic links. They're an independent object from the target. If you delete a shortcut, the target remains unaffected. If you move, rename, or delete a target path, the shortcut can break.

> Additionally, you can use shortcuts to eliminate edge copies of data and reduce process latency associated with data copies and staging. Shortcuts also maintain synchronization with the source data, including automatic schema updates for shortcut tables.

## Microsoft Fabric: Mirroring overview

URL: https://learn.microsoft.com/en-us/fabric/mirroring/overview
Version: fetched 2026-10-31

> Mirroring in Fabric is a low-cost and low-latency solution that brings data from various systems together into a single analytics platform. You can continuously replicate your existing data estate directly into Fabric's OneLake from various Azure databases and external data sources.

> You enable mirroring by creating a secure connection to your operational data source. You choose whether to replicate an entire database or individual tables, and Mirroring automatically keeps your data in sync. Once set up, data continuously replicates into OneLake for analytics consumption.

> Metadata mirroring - Metadata mirroring in Fabric synchronizes metadata (such as catalog names, schemas, and tables) instead of physically moving the data. This approach uses shortcuts, ensuring the data remains in its source while still being easily accessible within Fabric.

## Microsoft: Save costs with Microsoft Fabric Capacity reservations

URL: https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/fabric-capacity
Version: fetched 2026-10-31

> Smoothing is a feature of Fabric and allows spikes in usage to be spread out over time. Smoothing spreads background process like Spark jobs and semantic model refreshes over a 24-hour interval. Interactive process like Power BI reports, KQL, and SQL queries are spread out of a 10-minute interval. For more information, see the detailed explanation at Smoothing.

> You purchase a Fabric capacity reservation of two CUs, and assume that your usage spikes to 4 CUs for an hour. The process runs and consumes 4 CUs, however, the CU usage is spread out of the 24 hours. This feature allows you to purchase for average workload rather than the peak.

## Google Cloud: Apache Iceberg managed tables (BigQuery)

URL: https://cloud.google.com/bigquery/docs/managed-tables
Version: fetched 2026-10-31

> Apache Iceberg managed tables for Apache Iceberg in BigQuery let you build open-format lakehouses on Google Cloud. They offer the same fully managed experience as standard BigQuery tables, but store data in storage buckets that you own.

> Because Iceberg managed tables use the open Iceberg table format, open source and third-party compute engines can work with a single copy of your data.

> Iceberg managed tables bring the convenience of BigQuery resource management to tables that reside in your own cloud buckets. You can use BigQuery and open-source compute engines on these tables without moving the data out of the buckets that you control. You must configure a Cloud Storage bucket before you start using Iceberg managed tables.

## Google Cloud: Understand BigQuery editions

URL: https://cloud.google.com/bigquery/docs/editions-intro
Version: fetched 2026-10-31

> BigQuery also provides an on-demand (per TiB processed) model. You can choose to use editions and the on-demand model at the same time on a per-project basis.

> Because BigQuery editions are a property of compute power, not storage, you can query datasets regardless of how they are stored provided your edition supports the capabilities that you want to use.
