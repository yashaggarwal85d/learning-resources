## AWS: Lake Formation — How it works

URL: https://docs.aws.amazon.com/lake-formation/latest/dg/how-it-works.html
Version: fetched 2026-10-31

> AWS Lake Formation provides a relational database management system (RDBMS) permissions model to grant or revoke access to

> Data Catalog resources such as databases, tables, and columns with underlying data in Amazon S3.

> Get metadata – A principal (user) submits a query or an

> ETL script to an integrated analytical

> engine such as Amazon Athena, AWS Glue, Amazon EMR, or Amazon Redshift Spectrum.

> Check permissions – The Data Catalog checks

> user's permissions with Lake Formation, and if the user is authorized to access the table,

> returns the metadata that the user is allowed to see to the engine.

> If the underlying data is

> registered with Lake Formation, the analytical engine requests Lake Formation to provide data access

> by granting temporary access.

> Using the temporary access, the analytical engine

> fetches the data from Amazon S3, and performs necessary filtering such as column,

> row, or cell filtering.

> This process is called credential

> vending.

Contents: the four-step flow by name (get metadata, check permissions, get credentials, get data) that is this topic's own "catalog-and-vending diagram" drawn once generically; the engine never gets the underlying S3 data directly from IAM — the catalog checks permissions first, then hands back temporary (short-lived) access scoped to what the query is allowed to see, with the catalog's own documentation using the exact phrase "credential vending" for this step.

## AWS: Lake Formation tag-based access control

URL: https://docs.aws.amazon.com/lake-formation/latest/dg/tag-based-access-control.html
Version: fetched 2026-10-31

> permissions based on attributes. In Lake Formation, these attributes are called LF-Tags. You can attach LF-Tags to Data Catalog resources, and grant

> permissions to Lake Formation principals on those resources using these LF-Tags.

> IAM tags are not the same as LF-Tags. These tags are not interchangeable. LF-Tags

> Each LF-Tag is a key-value pair, such as department=sales or

Contents: a grant expressed on an LF-Tag (a key-value attribute attached to a database or table) rather than on the object itself, so a new table that inherits the tag inherits the grant automatically; LF-Tags explicitly distinguished from IAM tags, which are a different, non-interchangeable mechanism.

## Databricks: What is Unity Catalog?

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/
Version: fetched 2026-10-31

> Unity Catalog is the unified governance layer for data and AI built into Databricks. When enabled for a workspace, Unity Catalog operates beneath every data and AI interaction in your workspaces automatically: enforcing access control when you query a table or call a model, tracking lineage as data and AI assets are used, logging activity for auditing, and more.

Contents: Unity Catalog named as the layer that sits beneath every query, enforcing access control automatically rather than per-engine — the same job Lake Formation's credential-vending flow does, under a different product and a different cloud.

## Google Cloud: Introduction to BigLake tables

URL: https://cloud.google.com/bigquery/docs/biglake-intro
Version: fetched 2026-10-31

> For data lake administrators, BigLake lets you set access controls on tables rather than files, which gives you finer-grained options when setting user access to data in the data lake.

Contents: BigLake named as GCP's own table-level (not file-level) access-control layer sitting between an engine and the underlying object store.

## Google Cloud: Introduction to BigQuery row-level security

URL: https://cloud.google.com/bigquery/docs/row-level-security-intro
Version: fetched 2026-10-31

> Row-level security lets you filter data and enables access to

> specific rows in a table based on qualifying user conditions.

Contents: a row access policy named directly as a filter applied based on the querying principal's own identity — the row-filter primitive this topic reproduces against a local Postgres view.

## Google Cloud: Introduction to data masking

URL: https://cloud.google.com/bigquery/docs/column-data-masking-intro
Version: fetched 2026-10-31

> Data masking workflow

> Set a data policy directly on a column. Map a data masking rule to your

> data masking rule and specify the principals in one step.

Contents: a data masking rule applied directly to a column and bound to specific principals — the column-mask primitive this topic reproduces against the same local Postgres view.

## Apache Polaris: home page

URL: https://polaris.apache.org/
Version: fetched 2026-10-31

> Apache Polaris is an open-source, fully-featured catalog for Apache Iceberg™. It

> implements Iceberg's REST API, enabling seamless multi-engine interoperability across

> a wide range of platforms, including Apache Doris™, Apache Flink®, Apache Spark™,

> Dremio® OSS, StarRocks, and Trino.

Contents: Apache Polaris named directly as an open-source catalog implementing the Iceberg REST API — the concrete, vendor-neutral engine that runs the same catalog-and-vending protocol quoted from the Iceberg REST spec below, rather than one more proprietary name for the mechanism.

## Apache Iceberg: REST Catalog OpenAPI specification

URL: https://raw.githubusercontent.com/apache/iceberg/main/open-api/rest-catalog-open-api.yaml
Version: fetched 2026-10-31

> Specific properties and handling for `vended-credentials` and `remote-signing`

> are documented in the `LoadTableResult` schema section of this spec document.

> Optional signal to the server that the client supports delegated access

> via a comma-separated list of access mechanisms. The server may choose

> to supply access via any or none of the requested mechanisms.

> Credentials for ADLS / GCS / S3 / ... are provided through the `storage-credentials` field.

> Clients must first check whether the respective credentials exist in the `storage-credentials` field before checking the `config` for credentials.

Contents: the open-protocol version of credential vending, named precisely — a client signals it supports `vended-credentials` as an access-delegation mechanism, and the server's `LoadTableResult` response carries a `storage-credentials` field holding the scoped, short-lived credential for whichever object store backs that table, checked by the client before any other config.

## Microsoft Learn: Data security overview (Microsoft Fabric / OneLake)

URL: https://learn.microsoft.com/en-us/fabric/onelake/onelake-security
Version: fetched 2026-10-31

> OneLake enforces security on two planes:

> Data plane permissions: Govern what data you can see or change. For OneLake, this plane is OneLake security. Define these roles on an item and scope them down to folders, tables, schemas, rows, and columns.

Contents: OneLake's own two-plane security model — a control plane for who can manage an item, and a data plane (OneLake security) for who can see which rows and columns inside it — the same catalog-enforced row/column shape under Microsoft's own naming, enforced by OneLake itself rather than by a separate, per-engine storage credential.

## AWS: Lake Formation — Cross-account data sharing

URL: https://docs.aws.amazon.com/lake-formation/latest/dg/cross-account-permissions.html
Version: fetched 2026-10-31

> Lake Formation cross-account capabilities allow users to securely share distributed data lakes across multiple AWS accounts, AWS organizations or directly with IAM principals in another account providing fine-grained access to the Data Catalog metadata and underlying data.

> When you grant Lake Formation permissions on a Data Catalog resource to an external account or directly to an IAM principal in another account, Lake Formation uses the AWS Resource Access Manager (AWS RAM) service to share the resource.

Contents: a cross-account grant shares a database or table with another AWS account (or a principal inside it) through the same catalog permission model, without copying data or handing out a separate bucket-level IAM grant — the account boundary is enforced by the catalog's own grant, not by object-storage ACLs.

## AWS: Using AWS Glue with AWS Lake Formation for fine-grained access control

URL: https://docs.aws.amazon.com/glue/latest/dg/security-lf-enable.html
Version: fetched 2026-10-31

> With AWS Glue version 5.0 and higher, you can leverage AWS Lake Formation to apply fine-grained access controls on Data Catalog tables that are backed by S3. This capability lets you configure table, row, column, and cell level access controls for read queries within your AWS Glue for Apache Spark jobs.

> GlueContext-based table-level access control with AWS Lake Formation permissions supported in Glue 4.0 or before is not supported in Glue 5.0. Use the new Spark native fine-grained access control (FGAC) in Glue 5.0.

Contents: Spark-native fine-grained access control named directly — row, column and cell-level filtering enforced inside the Spark job itself (via a second, system-profile Spark driver that holds the Lake Formation-checked access, not the user's own driver), replacing the older `GlueContext`/DynamicFrame-only enforcement path. AWS's own current documentation states this for "Glue version 5.0 and higher" rather than naming 5.1 specifically — disclosed in OUTLINE.md.
