---
id: de.cross-cloud-data-service-mapping
title: 'Cross-cloud data-service mapping'
---

<section data-section="outcomes">

## Outcomes

- Translate a mechanism named on one cloud into its product name on the other two.
- Say, for a given migration, which layer (compute vs catalog/identity) actually carries the switching cost.

</section>

<section data-section="internals">

## Internals

- **Google's own comparison page does the naming for all three clouds at once.** Its documentation names Cloud Storage against S3 and Blob Storage, Pub/Sub against Kinesis Data Streams and Event Hubs, and its own Managed Service for Apache Airflow against AWS's Managed Workflows for Apache Airflow and Azure Data Factory's orchestration manager — all three literally built on the same open-source Airflow underneath.
- **Microsoft's own AWS-to-Azure mapping independently confirms the same rows** (Blob Storage against S3, Synapse/Fabric against Redshift), from a different vendor's own documentation rather than Google's — the same seven-row structure recurring regardless of who's doing the naming.
- **Microsoft Fabric names three of the seven rows in one product.** OneLake is Fabric's storage layer (built on ADLS Gen2); OneLake Catalog, alongside Microsoft Purview, is its governance layer; Fabric Spark is its Apache Spark compute offering — three rows, one SaaS platform, three separate underlying services still doing three separate jobs.
- **A product name can change mid-chapter.** GCP's Dataplex Universal Catalog became Knowledge Catalog on April 10, 2026 — confirmed directly from Google's own current documentation during this chapter's own research, after the chapter plan had already been written against the older name.
- **Unity Catalog doesn't belong to one cloud.** It's Databricks' own governance layer, usable identically whether that Databricks workspace runs on AWS or Azure — the one catalog product in this table that is itself cross-cloud rather than tied to a single vendor.

</section>

<section data-section="production">

## Production

An engineer moving from an AWS-only team to a company running Microsoft Fabric spends their first week assuming nothing they know applies. The actual translation takes an afternoon: OneLake is their object store, OneLake Catalog plus Purview is their access-control layer, Fabric Spark is the exact same Spark they already write jobs against. What doesn't translate in an afternoon is the policy already encoded in their old AWS account's Lake Formation grants and IAM roles — that has to be rebuilt by hand, row by row, because no export format carries it across.

</section>

<section data-section="frontier">

## Frontier

This topic's table is referenced by name throughout the rest of the chapter whenever a mechanism is introduced once and then named under all three vendors' products — it is the vocabulary the chapter lab assumes a learner already has.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Four of this table's cells — catalog, storage, Spark, identity — all converge on one mechanism that every governed lakehouse now uses, under four different product names. That mechanism is next.

</section>
