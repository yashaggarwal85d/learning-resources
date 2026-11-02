# Outline: Databricks compute model and Photon

**Syllabus line (syllabus/data-engineering.md):** "classic (all-purpose vs job clusters, policies, pools, spot) vs serverless (vendor-managed fleet: fast start, different network/egress boundary), Photon's vectorised C++ execution (the Ch.1.3/§6.1 lesson behind Tungsten), SQL warehouses as the BI-serving boundary (§17.7), DBU accounting by SKU and when serverless is cheaper; table maintenance (OPTIMIZE, liquid clustering, VACUUM, deletion vectors) is taught once in §6.3."

## Claims to fact-check

1. All-purpose compute stays available (and billable while idle) after a job finishes; a new job compute terminates and can't be restarted once the job completes (Databricks: Manage classic compute).
2. A compute pool holds idle, ready-to-use instances so a new cluster's start and autoscaling time shrinks, and Databricks doesn't charge DBUs for an instance idling in the pool (Databricks: Connect to pools).
3. A spot-instance cluster's driver node is always on-demand; only the worker instances after it are spot (Databricks: Manage classic compute / Compute configuration reference).
4. A compute policy is an admin tool that limits who can create what kind of compute, including capping per-cluster cost (Databricks: Create and manage compute policies).
5. Serverless compute runs in a Databricks-managed compute plane, not the customer's own cloud account, which speeds up start and scaling and minimizes idle time (Databricks: Connect to serverless compute).
6. Photon is a vectorized execution engine written in C++, delivering a documented 2x speedup on the TPC-DS 1TB benchmark over the latest Databricks Runtime, with customers reporting 3x-8x on their own workloads (Databricks: Photon product page).
7. A SQL warehouse is its own compute type, purpose-built for querying, with Databricks recommending its serverless variant when available (Databricks: Connect to a SQL warehouse).
8. The DBU is a normalized unit, not a fixed hardware ratio, and Databricks publishes a distinct price list per SKU/cloud rather than one flat DBU rate (Databricks: Pricing).

## Changes from the chapter plan

CHAPTER.md's scope line drops two details the real syllabus line carries: the specific maintenance operations named at §6.3 ("OPTIMIZE, liquid clustering, VACUUM, deletion vectors" — CHAPTER.md just says "table maintenance ... is taught once in Ch.6.3"), and the §17.7 cross-reference after "SQL warehouses as the BI-serving boundary." Neither changes this topic's own content (both are forward pointers to other chapters, not claims this topic has to teach), but this topic cites the real syllabus line's fuller wording in coverage.json rather than CHAPTER.md's shorter paraphrase, since coverage checking requires an exact substring of the real syllabus text.

A second note: this topic cannot run a real Databricks workspace in this sandbox. Every claim about cluster behaviour, Photon's speedup figures, and DBU accounting is sourced directly from Databricks' own current documentation rather than reproduced locally — there is no local stand-in for a managed Spark platform the way earlier topics used local Postgres or moto for AWS services. The claims that follow each cite the vendor's own page, not an internal measurement.

## Engagement arc

Hook: the same aggregation query runs noticeably faster on a Photon-enabled SQL warehouse than on an equivalently-sized classic all-purpose cluster running plain Spark — the course's own earlier vectorised-execution lesson (Tungsten, abstractly) now with a name and a vendor behind it. Early prediction: before naming Photon, ask what's actually different about the faster run. Teaching: the compute-type menu (all-purpose, job, serverless, SQL warehouse) each with its own start-time/idle-billing behaviour; Photon's real mechanism; DBU accounting varying by SKU. Recap + takeaways. Second predict step: pick the right compute type for a stated workload shape.

## Concept ledger

**Introduces:** `databricks-compute-sku-model`, `photon-vectorized-execution`.
**Uses:** `cross-cloud-service-rosetta` (topic 7), `serverless-provisioned-breakeven` (topic 10), `billing-granularity-comparison` (topic 10).
**Declared:** basic familiarity with Apache Spark's cluster model (driver, executors).

## Bridge / handoff

**Bridge:** "This section mapped and priced the cloud's data services in general. One platform is common enough, and deep enough, to earn a section of its own — and it starts with what actually runs the code: classic clusters, serverless, and the vectorised engine that makes either one faster."

**Handoff:** "Compute is only useful once data actually arrives on it. Databricks' own answer to 'a file landed in object storage, now what' is next."
