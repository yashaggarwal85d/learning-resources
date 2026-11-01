# Outline: On-prem data platforms after Hadoop

**Syllabus line (syllabus/data-engineering.md):** "what an on-prem stack looks like now: legacy HDFS/YARN estates vs S3-compatible object storage + Kubernetes + Spark/Trino + Iceberg; private-cloud and virtualisation-licensing pressure; when on-prem wins (data gravity, OT proximity, sovereignty, steady utilisation) and the operational bill it carries."

## Claims to fact-check

1. MinIO AIStor is an exascale data store natively supporting the S3 API for objects and Iceberg for tables, deployable onto Kubernetes infrastructure through a first-party operator model (MinIO).
2. Trino is a distributed SQL query engine designed to query large data sets distributed over one or more heterogeneous data sources, with no storage of its own (Trino documentation).
3. Less than a month after Broadcom's acquisition of VMware closed, Broadcom ended perpetual licenses in favor of subscription-based billing and radically pared the VMware portfolio down to two primary offerings, a decision that reverberated across an ecosystem where roughly eighty percent of organizations use VMware infrastructure products (CIO Dive, citing Forrester).
4. The business-model shift from perpetual to subscription licensing, not the technology itself, was the specific change industry sources describe as the source of customer anger and re-evaluation of private-cloud platforms (CIO Dive).
5. Data Gravity, a term coined by Dave McCrory, describes how data that has accumulated attracts services and applications to itself, implying that data is ideally processed where it is stored and generated, since moving it carries real cost and latency (Dremio).

## Changes from the chapter plan

CHAPTER.md's own scope quote matches the real syllabus line in full — no discrepancy to disclose this time, consistent with topic 18's handling (the first topic in this chapter where the chapter plan's paraphrase matched exactly).

This topic is the one topic in this chapter the builder can actually run end to end locally, not just simulate structurally, for its storage-and-table-format layer: a real S3-compatible object store (`moto`'s local S3 server, since MinIO's own open-source server/`mc` release channel returns HTTP 410 in this sandbox — the same substitution already established for an earlier chapter's object-storage topics) and a real Apache Iceberg table (via `pyiceberg`, writing real Parquet data files, Avro manifests and JSON metadata against that S3-compatible endpoint, producing a real snapshot). Kubernetes itself and Spark/Trino as a JVM process are not run in this sandbox — too heavy for this environment — and are disclosed as named, described, and reasoned about rather than orchestrated or executed; `pyiceberg` stands in as the query/write engine actually touching the table format, which is the more evidentiary half of the pattern anyway.

## Engagement arc

Hook: an organisation moves a steady, around-the-clock, multi-petabyte analytics workload to the cloud expecting savings, and the bill is higher every month than the fully-depreciated on-prem cluster it replaced — because the workload never had an idle period for elasticity to ever pay for itself. Teaching: the legacy HDFS/YARN estate versus the modern on-prem pattern (S3-compatible object storage, Kubernetes, Spark/Trino, Iceberg), demonstrated for real against a local S3-compatible store and a real Iceberg table; the VMware/Broadcom licensing shock as a named, dated pressure pushing organisations to re-evaluate private-cloud platforms; the four falsifiable reasons on-prem can win (data gravity, OT proximity from topic 20, sovereignty from topic 18, steady utilisation); the operational bill on-prem accepts in exchange. Recap + takeaways. Predict step: given a described workload, which of the four reasons (if any) actually applies.

## Concept ledger

**Introduces:** `on-prem-modern-stack`, `data-gravity-on-prem-tradeoff`.
**Uses:** `object-store-consistency-guarantee`, `ot-edge-buffer-backpressure-isolation`, `residency-sovereignty-localisation`, `cloud-cost-four-dimensions`.
**Declared:** none beyond topic 20.

## Bridge / handoff

**Bridge:** "SAP and the plant floor are two real systems with their own rules about where they live. This topic is the platform question underneath both of them: what running a data platform entirely on an organisation's own hardware actually looks like today, and the real, falsifiable reasons that can still beat the cloud."

**Handoff:** "Very few real platforms are purely on-prem or purely cloud. The closing topic of this chapter is the connection between them — what it costs, how fast it is, and what happens to a pipeline when that connection goes down for hours."
