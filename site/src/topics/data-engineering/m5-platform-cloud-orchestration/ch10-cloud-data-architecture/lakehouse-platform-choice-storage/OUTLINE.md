# Outline: Lakehouse platform choice: storage, format, pricing

**Syllabus line (syllabus/data-engineering.md):** "mechanism-level comparison of Databricks, Snowflake, Microsoft Fabric and BigQuery: who owns the storage (your bucket vs vendor-managed vs OneLake), open-format posture (Delta/Iceberg/UniForm, managed Iceberg), zero-copy access (OneLake shortcuts vs mirroring copies, Delta Sharing, Snowflake data sharing), pricing model (DBUs vs credits vs Fabric capacity units with smoothing vs slots) and the exit cost of each."

## Claims to fact-check

1. Databricks stores managed table/volume data in an S3 bucket the customer creates in their own AWS account (Databricks: Create a Unity Catalog metastore).
2. Databricks' UniForm generates Iceberg metadata asynchronously alongside Delta metadata from the same Parquet files, so one copy of the data serves both Delta and Iceberg clients (Databricks: Read Delta Lake tables with Iceberg clients).
3. A plain Snowflake table has its storage fully managed by Snowflake (organization, file size, compression, metadata); an Iceberg table on Snowflake instead stores data in external cloud storage the customer manages, which Snowflake calls out as not being part of Snowflake (Snowflake: key concepts and architecture; Apache Iceberg tables).
4. Snowflake bills compute in credits, calculated as consumed credits times the price of a credit (Snowflake: Understanding overall cost).
5. Snowflake's Secure Data Sharing copies no data between accounts; a consumer's shared objects are read-only and consume no storage in the consumer's account (Snowflake: About Secure Data Sharing).
6. A OneLake shortcut is a pointer to another storage location (internal or external), behaving like a symbolic link, independent of its target — distinct from an actual copy (Microsoft Fabric: OneLake shortcuts).
7. Fabric database mirroring continuously replicates an entire source database into OneLake as an actual synced copy, while Fabric's own metadata mirroring instead uses shortcuts and moves no data (Microsoft Fabric: Mirroring overview).
8. Fabric capacity smoothing spreads a usage spike (e.g. a burst to 4 CUs on a 2-CU reservation) across a 24-hour window for background work or a shorter interactive window, billing for the average rather than the peak (Microsoft: Fabric Capacity reservations).
9. A BigQuery Iceberg managed table stores its data in a Cloud Storage bucket the customer owns and controls, configured before the table is created (Google Cloud: Apache Iceberg managed tables).
10. BigQuery offers both a reserved-slots (editions) model and a per-TiB-processed on-demand model, selectable per project, and slots are a property of compute, not storage (Google Cloud: Understand BigQuery editions).

## Changes from the chapter plan

CHAPTER.md's own scope line is a close paraphrase of the real syllabus line with no dropped clause; this topic teaches all five clauses (storage ownership, open-format posture, zero-copy access, pricing model, exit cost) exactly as the syllabus states them, across all four platforms.

A second note: this topic cannot provision real Databricks, Snowflake, Fabric or BigQuery accounts in this sandbox. Every claim about storage ownership, format support, zero-copy mechanics and pricing is sourced directly from each vendor's own current documentation. The worked example (`examples.py`) reproduces the actual, documented pricing formulas (BigQuery on-demand vs slots, Snowflake credits, Fabric smoothing) against a synthetic workload, rather than a live billing account.

## Engagement arc

Hook: a team picks Snowflake for its low operational burden, confident they can always export later — eighteen months on, their data sits in Snowflake's own internally-optimized storage format, and there is no bulk-export path back to an open format at a price anyone will approve; shown next to the same onboarding question (who actually owns this storage?) asked and glossed over the way it happened. Early prediction: before the four-platform comparison, ask which ownership model a team should expect to find hardest to exit. Teaching: storage ownership across all four (your bucket, Snowflake-managed, OneLake, your Cloud Storage bucket); open-format posture (UniForm, Iceberg-on-Snowflake, OneLake's native Delta, BigLake/Iceberg-managed); zero-copy access (shortcuts vs mirroring, Delta Sharing, Snowflake sharing); pricing model (DBUs vs credits vs Fabric CU-smoothing vs slots/on-demand) with a worked cost comparison; exit cost reasoning tying storage ownership back to the hook. Recap + takeaways. Second predict step: given a stated workload and exit-cost priority, which platform's storage model fits.

## Concept ledger

**Introduces:** `lakehouse-platform-tradeoff-matrix`.
**Uses:** `cross-cloud-service-rosetta` (topic 7), `databricks-compute-sku-model` (topic 11), `unity-catalog-namespace-securables` (topic 13), `delta-sharing-protocol` (topic 13), `serverless-provisioned-breakeven` (topic 10), `cloud-cost-four-dimensions` (topic 6).
**Declared:** none beyond topic 13.

## Bridge / handoff

**Bridge:** "Databricks is one lakehouse platform, taught here in real depth. This topic is the comparison a learner actually has to make in a real job: who owns the storage, how open the format really is underneath the marketing, what each pricing model actually charges for, and what it costs to leave each one."

**Handoff:** "Choosing a platform and its services is a decision made once, or rarely. Keeping that choice reproducible and affordable over hundreds of later changes is a discipline in its own right — infrastructure as code and FinOps, which open the next section."
