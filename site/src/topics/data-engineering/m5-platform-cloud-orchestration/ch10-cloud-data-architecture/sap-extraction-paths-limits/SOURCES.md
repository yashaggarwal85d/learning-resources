# Sources: SAP extraction paths and their limits

## Matillion: Tech note — SAP note 3255746 impact on SAP ODP data extraction

URL: https://docs.matillion.com/metl/docs/tech-note-sap-3255746/
Version: fetched 2026-10-31

> SAP Note 3255746 restricts third-party use of the RFC modules in the SAP Operational Data Provisioning (ODP) framework.

> SAP first published Note 3255746 in 2022, explaining that third parties could use SAP APIs for the ODP framework, but that these APIs were unsupported and intended for internal use only.

> On February 2, 2024, SAP updated the note (version 4) to state that customers and third-party applications are no longer permitted to use ODP APIs to access SAP ABAP sources. SAP also warned that it may restrict and audit non-permitted use of this feature.

> On July 7, 2024, SAP updated the note again, advising customers to use SAP Datasphere for data replication scenarios that move data from SAP sources into third-party applications and tools.

## Theobald Software: SAP Note 3255746: How to Achieve Data Integration Without ODP-RFC

URL: https://theobald-software.com/en/blog/sap-note-325574
Version: fetched 2026-10-31

> The RFC modules of the ODP Data Replication API (ODP-RFC) are exclusively designed for data transfer between SAP applications.

> Any use of ODP-RFC by customer or third-party applications to access SAP ABAP systems, whether on-premises or in private cloud, is prohibited.

> SAP Note 3255746 does not prohibit RFC as a communication protocol. RFC remains fully usable, for example for table/CDS view extractions, DeltaQ, BAPIs, or function modules. Only the use of the ODP Data Replication API via RFC in SAP-to-non-SAP scenarios is restricted.

## DEV Community: Core Data Services (CDS) and Their Integration with SAP Datasphere

URL: https://dev.to/alopez/core-data-services-cds-and-their-integration-with-sap-datasphere-3lg0
Version: fetched 2026-10-31

> Declarative: Written in a SQL-like language enriched with annotations and relationships.

> Semantic: Add meaning to data through annotations, hierarchies, and associations.

> Exposable: Can be published as OData services for consumption by other tools or applications

## Databricks: Databricks Announces Launch of SAP Databricks

URL: https://www.databricks.com/company/newsroom/press-releases/databricks-announces-launch-sap-databricks
Version: fetched 2026-10-31

> SAN FRANCISCO — February 13, 2025 — Databricks, the Data and AI company, today announced the launch of SAP Databricks, a strategic product and go-to-market partnership with SAP that natively integrates the Databricks Data + AI Platform within the newly launched SAP Business Data Cloud.

> Through bi-directional sharing of data via Delta Sharing between their SAP Databricks environment and their native Databricks (non-SAP) environment, they can unify all their data without complicated data engineering.

> The new offering, SAP Databricks, is sold by SAP as part of SAP Business Data Cloud, and will be available in a staged rollout on AWS, Azure and Google Cloud.

## SAP Knowledge Base Article 2853045: How effective-dating is handled in an OData API query

URL: https://userapps.support.sap.com/sap/support/knowledge/en/2853045
Version: fetched 2026-10-31

> You wish to understand how OData API query requests work with effective-dated entities;

> Future or past records of a given entity are not returned;

## Matillion: Tech note (SLT/trigger-based note)

URL: https://docs.matillion.com/metl/docs/tech-note-sap-3255746/
Version: fetched 2026-10-31

> SAP's rules also state that technologies such as SLT Replication Server, Master Data Integration ABAP Adapter, SAP HANA log-based replication, and SAP Database Trigger must not be used to move data out of SAP.

## SAP Knowledge Base Article 2148752: How to extract Employee Central historical/future dated records using SuccessFactors OData API

URL: https://userapps.support.sap.com/sap/support/knowledge/en/2148752
Version: fetched 2026-11-08 (public preview)

> You are trying to get data from SuccessFactors using OData API and it's not returning future or historical records in the output, only the recent time slice is being returned.

Note: replaces KBA 3774633, whose public page shrank to a preview on 2026-11-08 and no longer shows the quoted resolution text. This article states the same visibility failure: records outside the query's date are left out, not returned stale.
