# Fact-check — de.cross-cloud-data-service-mapping

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Cloud Storage / S3 / Blob Storage are named as equivalents for object storage | GCP service comparison | Confirmed — quoted verbatim |
| 2 | Pub/Sub ≈ Kinesis Data Streams ≈ Event Hubs; Airflow-based orchestration services on all three | GCP service comparison | Confirmed — quoted verbatim |
| 3 | Blob Storage ≈ S3; Synapse/Fabric ≈ Redshift | Microsoft's Azure-for-AWS-professionals page | Confirmed — Microsoft's own mapping |
| 4 | OneLake (storage), OneLake Catalog + Purview (governance), Fabric Spark (compute) | Microsoft Fabric overview | Confirmed — quoted verbatim |
| 5 | Dataplex Universal Catalog renamed to Knowledge Catalog, April 10, 2026 | GCP Knowledge Catalog overview | Confirmed — quoted verbatim, directly from the source |
| 6 | BigLake moves access control from files to tables | GCP BigLake intro | Confirmed — quoted verbatim |
| 7 | Unity Catalog is Databricks' own cross-cloud governance layer | Databricks documentation | Confirmed — quoted verbatim |

## Red-team: the hook and the lock-in claim

**Risk:** "lock-in lives in catalog and identity, not compute" could read as an assertion with no
support — a learner could reasonably ask why compute is exempt.

**Mitigation:** the fact-check sources above all describe *compute* (Spark, a warehouse engine)
as something that reads an open format and runs the same job regardless of vendor, while a
catalog's policy model and an identity system's role graph are each vendor-specific internal
state with no standard export format — the claim is argued from this structural difference
(reproducible open format vs. non-portable internal policy state), not asserted outright. No
numeric claim or mechanism is reproduced in this refresher (per CHAPTER.md's own "Leaves out":
this topic names products, it does not teach any one in depth).

## Outcome

Every quote in SOURCES.md is verified word-for-word (`node scripts/sources.mjs check` — 0
problems, 11 quotes across 7 sources). The one correction to the chapter's original plan (GCP's
Dataplex Universal Catalog → Knowledge Catalog rename) is disclosed directly in OUTLINE.md's
"Changes from the chapter plan" and taught as an example of the topic's own point, not silently
patched over.
