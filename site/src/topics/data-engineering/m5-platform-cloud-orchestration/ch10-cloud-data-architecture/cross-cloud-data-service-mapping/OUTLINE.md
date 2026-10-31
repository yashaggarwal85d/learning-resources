# Outline — de.cross-cloud-data-service-mapping

**Kind:** refresher, §10.2. About 5 minutes.

## Scope (full syllabus line)

"one compact table across AWS / Azure / GCP: object storage, catalog/governance, Spark, streaming,
warehouse, orchestration, identity; lock-in lives in the catalog and identity layers, not the
compute"

- Clause 1: the table itself (seven rows: object storage, catalog/governance, Spark, streaming,
  warehouse, orchestration, identity, each named per vendor).
- Clause 2: why lock-in lives in catalog and identity, not compute.

## Outcomes

Translate a mechanism named on one cloud into its product name on the other two. Say, for a given
migration, which layer (compute vs catalog/identity) actually carries the switching cost.

## Changes from the chapter plan

GCP's Dataplex Universal Catalog was renamed to Knowledge Catalog on April 10, 2026 (confirmed
directly from Google's own documentation, fetched at research time — see SOURCES.md). CHAPTER.md
was written against the older name. This topic teaches the current name (Knowledge Catalog) and
names the rename itself as a live example of the exact point the topic is making: these product
names are not stable, which is part of why the mechanism underneath them is what actually matters.

This topic names products from each vendor's own current documentation rather than teaching any
one of them in depth (per the chapter plan's own "Leaves out"); it does not reproduce any
mechanism locally, consistent with being a 5-minute refresher with no lab of its own.

## Engagement arc

- Hook: step 1 — a job posting asking for "OneLake and Knowledge Catalog experience" looks
  unrelated to anything an AWS-only engineer knows, until the table reveals it's two rows they
  already understand under AWS's names.
- Early prediction: step 2 — which layer of a cross-cloud migration actually carries the
  switching cost: compute, or catalog/identity?
- Teaching: steps 3-5 — the table built up in grouped rows (storage/identity, catalog/governance,
  compute/warehouse/streaming/orchestration), one group highlighted at a time.
- Recap: step 6, closing on why catalog and identity, specifically, carry the lock-in.

## Concept ledger

**Introduces:** `cross-cloud-service-rosetta`.
**Uses:** none.
**Declared:** the service names used so far in this chapter (object storage, identity).

## Bridge / handoff (verbatim from CHAPTER.md)

**Bridge:** "Section 10.1 was true everywhere, under generic names. From here the chapter has to
say which vendor's product actually does each job — this topic is the one table that makes every
later cross-cloud reference make sense."

**Handoff:** "Four of this table's cells — catalog, storage, Spark, identity — all converge on one
mechanism that every governed lakehouse now uses, under four different product names. That
mechanism is next."

## Claims to fact-check

1. GCP's object storage (Cloud Storage), AWS's S3 and Azure's Blob Storage are named as
   equivalents in Google's own comparison documentation.
2. GCP's Pub/Sub, AWS's Kinesis Data Streams and Azure's Event Hubs are named as equivalents for
   stream ingest; Google's own Managed Service for Apache Airflow, AWS's Managed Workflows for
   Apache Airflow and Azure Data Factory's orchestration manager are all built on Apache Airflow.
3. Microsoft names Azure Blob Storage against Amazon S3, and Azure Synapse/Microsoft Fabric
   against Amazon Redshift, in its own AWS-to-Azure comparison documentation.
4. Microsoft Fabric names OneLake as its storage layer and OneLake Catalog (plus Microsoft
   Purview) as its governance layer, and Fabric Spark as its Apache Spark compute offering.
5. GCP's Dataplex Universal Catalog was renamed Knowledge Catalog on April 10, 2026.
6. BigLake moves GCP's access control from the file level to the table level — the same role as
   AWS's Lake Formation and Azure/Databricks' Unity Catalog.
7. Unity Catalog is Databricks' own governance layer, usable across both AWS- and Azure-hosted
   Databricks workspaces — one catalog product that is itself cross-cloud.
