## Google Cloud: Compare AWS and Azure services to Google Cloud

URL: https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison
Version: fetched 2026-10-31

> Store any amount of data and retrieve it as often as you'd like, using Google Cloud's object storage offering.

> A highly scalable messaging service for publishing and subscribing.

> Unify stream and batch data processing that's serverless, fast, and cost-effective.

> Author, schedule, and monitor pipelines that span across hybrid and multi-cloud environments using this fully managed workflow orchestration service built on Apache Airflow.

> Provide fine-grained access control and visibility for centrally managing resources.

Contents: a row-by-row equivalence table naming Cloud Storage against Amazon S3 and Azure Blob Storage for object storage; Pub/Sub against Amazon Kinesis Data Streams and Azure Event Hubs for stream ingest, and Dataflow against Kinesis-with-Managed-Flink and Azure Stream Analytics for stream processing; Google's own Managed Service for Apache Airflow against AWS's Managed Workflows for Apache Airflow and Azure Data Factory's orchestration manager, all three literally built on the same open-source Airflow; IAM against AWS's and Azure's identity services as the same fine-grained-access-control job under three names.

## Microsoft Learn: Azure for AWS Professionals — service comparison

URL: https://learn.microsoft.com/en-us/azure/architecture/aws-professional/services
Version: fetched 2026-10-31

Contents: Microsoft's own AWS-to-Azure service mapping, naming Azure Blob Storage against Amazon S3, Azure Synapse Analytics and Microsoft Fabric against Amazon Redshift, and Azure Data Factory against AWS Glue and Step Functions — confirming, from Microsoft's own documentation rather than Google's, that the same compute and warehouse mechanisms recur under each vendor's own product name.

## Microsoft Learn: What is Microsoft Fabric

URL: https://learn.microsoft.com/en-us/fabric/get-started/microsoft-fabric-overview
Version: fetched 2026-10-31

> Fabric is delivered as a software‑as‑a‑service (SaaS) platform and uses OneLake as a centralized, logical data lake for storing and accessing data across all workloads.

> Microsoft Fabric centralizes governance and discovery within OneLake Catalog, where you can find, explore, secure, and use Fabric items, govern the data you own, assess governance state, and act on recommendations. Microsoft Purview provides information protection, data loss prevention, audit, and risk and compliance capabilities for supported Fabric data.

> Fabric Data Engineering provides Apache Spark for processing large datasets, with notebooks and tools for writing and scheduling data transformation jobs.

Contents: OneLake named directly as Fabric's object-storage layer (built on ADLS Gen2); OneLake Catalog named as Fabric's own governance/discovery layer, with Microsoft Purview as the separate compliance layer sitting alongside it — two distinct products answering to the single "catalog/governance" row; Fabric Spark named as Fabric's Apache Spark compute offering.

## Google Cloud: Knowledge Catalog overview (formerly Dataplex Universal Catalog)

URL: https://cloud.google.com/dataplex/docs/introduction
Version: fetched 2026-10-31

> As of April 10, 2026, Dataplex Universal Catalog is now called Knowledge Catalog. The API, client library, CLI, and IAM names remain unchanged.

Contents: the rename of Dataplex Universal Catalog to Knowledge Catalog, disclosed here because this chapter's own CHAPTER.md plan was written against the older name — a direct confirmation that cloud product names are a moving target even inside the writing of a single syllabus, which is this topic's own point made concrete.

## Google Cloud: Introduction to BigLake tables

URL: https://cloud.google.com/bigquery/docs/biglake-intro
Version: fetched 2026-10-31

> For data lake administrators, BigLake lets you set access controls on tables rather than files, which gives you finer-grained options when setting user access to data in the data lake.

Contents: BigLake named as the layer that moves GCP's access control from the file level to the table level — the same job AWS's Lake Formation and Azure's Unity Catalog each do, under a third name.

## Databricks: What is Unity Catalog?

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/
Version: fetched 2026-10-31

> Unity Catalog is the unified governance layer for data and AI built into Databricks. When enabled for a workspace, Unity Catalog operates beneath every data and AI interaction in your workspaces automatically: enforcing access control when you query a table or call a model, tracking lineage as data and AI assets are used, logging activity for auditing, and more.

Contents: Unity Catalog named directly as Databricks' own governance layer, running across both AWS- and Azure-hosted Databricks workspaces rather than being tied to one cloud's own catalog product — the one cell in this topic's table that is itself cross-cloud rather than per-vendor.
