## AWS documentation — Zero-ETL integrations (Amazon Redshift)

URL: https://docs.aws.amazon.com/redshift/latest/mgmt/zero-etl-using.html

> The following sources are currently supported for zero-ETL integrations:

> Amazon Aurora MySQL (AMS)

> Amazon Aurora PostgreSQL (APG)

> Amazon DynamoDB

> Amazon RDS for MySQL

> Amazon RDS for Oracle

> Amazon RDS for PostgreSQL

> Oracle Database@AWS

> To create a zero-ETL integration, you specify an integration source and an Amazon Redshift data warehouse as the target. After an initial data load, the integration replicates data from the source to the target data warehouse.

## AWS documentation — DynamoDB zero-ETL integration with Amazon Redshift

URL: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/RedshiftforDynamoDB-zero-etl.html

> On activation, the integration exports the full DynamoDB table to populate the Amazon Redshift database. The time it takes for this initial process to complete depends on the DynamoDB table size. The zero-ETL integration then incrementally replicates updates from DynamoDB to Amazon Redshift every 15-30 minutes using DynamoDB incremental exports. This means the replicated DynamoDB data in Amazon Redshift is kept up-to-date automatically.

> A zero-ETL integration between Amazon DynamoDB and Amazon Redshift requires your source DynamoDB table to have Point-in-time recovery (PITR) enabled.

## Microsoft Fabric documentation — Overview of Mirroring for SQL database

URL: https://learn.microsoft.com/en-us/fabric/database/sql/mirroring-overview

> To facilitate analytics scenarios, SQL database in Fabric automatically mirrors its data into Fabric OneLake, to the same workspace where the database itself resides. Mirroring starts upon creation of your SQL database in Fabric with no user action required. There are no settings to configure mirroring: all supported tables and their supported columns are mirrored as soon as they're created.

> Mirrored data is stored as delta parquet files in OneLake.
