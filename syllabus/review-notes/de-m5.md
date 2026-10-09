# Change log — de-m5 (Data Engineering Milestone 5: Ch.10–13 + Systems in Production; original.md lines 490–677)

Counting rule for "before": every top-level and nested bullet in lines 490–677, minus labs (4) and minus group-header bullets that only carried sub-bullets (10.5 ×4, 11.2 ×2). Each "What it is / Architecture / Trade-off" triplet (Glue, Lake Formation, Step Functions, CloudWatch) counts as one topic. Systems-in-Production entries are counted separately.

## Corrections
- **Odd numbering fixed.** 10.2.1 (Glue), 10.2.2 (Lake Formation), 11.1.5 (Step Functions) and 13.3.5 (CloudWatch) removed as sections; their content is folded into mechanism-level topics (§10.2 "Catalog-enforced access and credential vending", "Serverless vs provisioned compute economics"; §11.1 "Orchestrator landscape and selection"; §13.1 "Metric cardinality and observability cost").
- **Temporal error-handling semantics.** Original: "activities are retryable, workflows are not". Corrected: activities carry retry policies and must be idempotent; workflow-*task* failures are retried automatically, while workflow-*execution* retries exist but are opt-in and rarely appropriate (§11.2 "Workflow determinism and versioning").
- **Monarch/Borgmon case study.** Original said Borgmon/Monarch used "push-based collection" and that the query language was PromQL's predecessor. Corrected against the Monarch paper (Adams et al., PVLDB 13(12), 2020, https://www.vldb.org/pvldb/vol13/p3181-adams.pdf): *Monarch* uses push-based collection (early Monarch versions pulled, and the paper says pushing simplified the architecture); Borgmon was per-team, unschematised and manually sharded; Prometheus is described as inspired by Borgmon, not by Monarch. Added venue/authors.
- **HITRUST** was listed as if it were a regulation; it is a certifiable control framework, now labelled as such (§13.2).
- **Airflow critique.** Original framed the metadata-DB bottleneck as current; now dated: Airflow 3.0 (Apr 2025) re-architected it, and Airflow 2 is end-of-life (22 Apr 2026).
- **Azure Synapse** listed as a current stack component; now noted as maintained-but-not-invested (Microsoft: no retirement plans; next-gen capabilities are in Fabric).
- **Lake Formation "trade-off"** framed lock-in only; corrected to the actual mechanism (trusted-engine enforcement + credential vending) and its bypass failure mode, which applies equally to Unity Catalog, Polaris, BigLake and OneLake security.
- **Chaos Monkey case study** given dates, the IEEE Software 2016 paper (Basiri et al.) and its evolution into controlled experiments (ChAP).

## Currency updates (with source URLs)
- Airflow 3.1 (human-in-the-loop, deadline alerts) — https://airflow.apache.org/blog/airflow-3.1.0/
- Airflow 3.2 (asset partitions, CronPartitionTimetable, experimental multi-team, sync deadline callbacks) — https://airflow.apache.org/blog/airflow-3.2.0/ ; 3.3 partition mappers — https://airflow.apache.org/docs/apache-airflow/stable/release_notes.html
- Airflow 2 end of life 22 Apr 2026 — https://endoflife.date/apache-airflow ; https://www.astronomer.io/airflow-2-eol/
- MWAA Serverless (Nov 2025, Airflow 3) — https://aws.amazon.com/about-aws/whats-new/2025/11/mwaa-serverless-deployment-apache-airflow-workflows/
- Dagster Components / `dg` CLI GA, FreshnessPolicies (1.12, Oct 2025) — https://dagster.io/blog/dagster-1-12-monster-mash
- Temporal Worker Versioning GA and legacy version sets removed; Nexus GA (2025); Replay 2026 announcements — https://temporal.io/blog/replay-2026-product-announcements ; secondary: https://www.youngju.dev/split/2026-07-17-temporal-worker-versioning-ga-replay-deploy-problem
- AWS Lambda durable functions (Dec 2025; 15-min invocations, executions up to 1 year) — https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html
- Delta Live Tables → Lakeflow Spark Declarative Pipelines; core donated to Apache Spark as Spark Declarative Pipelines (Spark 4.1); AUTO CDC/expectations not portable — https://docs.databricks.com/aws/en/ldp/concepts/spark-declarative-pipelines
- Databricks Workflows → Lakeflow Jobs; Databricks Asset Bundles → Declarative Automation Bundles (Mar 2026, non-breaking) — https://docs.databricks.com/aws/en/dev-tools/bundles/faqs
- Unity Catalog ABAC row-filter/column-mask policies, governed tags, data classification GA — https://www.databricks.com/blog/abac-row-filtering-and-column-masking-policies-governed-tags-and-data-classification-are-now
- Unity Catalog OSS under LF AI & Data — https://www.databricks.com/company/newsroom/press-releases/databricks-open-sources-unity-catalog-creating-industrys-only-open
- S3 Tables (table buckets, managed Iceberg maintenance, Iceberg REST endpoint) — https://aws.amazon.com/blogs/aws/new-amazon-s3-tables-storage-optimized-for-analytics-workloads/ ; https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables-integrating-open-source.html
- AWS Glue 5.1 (Spark 3.5.6, Iceberg v3, Lake Formation Spark-native FGAC writes; Athena v3 read caveat) — https://aws.amazon.com/about-aws/whats-new/2025/11/aws-glue-5-1 ; https://aws.amazon.com/blogs/big-data/introducing-aws-glue-5-1-for-apache-spark
- S3 conditional writes (If-None-Match Aug 2024; If-Match + policy enforcement Nov 2024; CopyObject Oct 2025) — https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes ; https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-functionality-conditional-writes ; https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-s3-conditional-write-functionality-copy-operations
- Azure Synapse status vs Fabric — https://community.fabric.microsoft.com/t5/Fabric-Updates-Blog/Microsoft-Fabric-explained-for-existing-Synapse-users/ba-p/5172113
- Fabric OneLake shortcuts/mirroring/OneLake security — https://blog.fabric.microsoft.com/en-us/blog/fabcon-and-sqlcon-2026-whats-new-in-microsoft-onelake/
- BigLake metastore Iceberg REST catalog GA (Nov 2025, credential vending); Dataplex Universal Catalog integration — https://cloud.google.com/blog/products/data-analytics/biglake-metastore-now-supports-iceberg-rest-catalog/ ; https://docs.cloud.google.com/biglake/docs/about-blms
- Apache Polaris top-level project (Feb 2026) — https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/
- AWS European Sovereign Cloud GA (Jan 2026, Brandenburg) — https://press.aboutamazon.com/2026/1/aws-launches-aws-european-sovereign-cloud-and-announces-expansion-across-europe
- EU Data Act applicable 12 Sept 2025; switching charges at cost until 11 Jan 2027, banned from 12 Jan 2027; product-design obligations 12 Sept 2026 — https://www.eubelius.com/en/news/the-eu-data-act-in-force-what-changes-on-12-september-2025 ; https://www.mccannfitzgerald.com/knowledge/data-privacy-and-cyber-risk/eu-data-act-switching-cloud-provider ; https://www.stevens-bolton.com/insights/102l4r1/the-eu-data-act-takes-effect/
- EU AI Act: AI Omnibus formally adopted mid-2026; Annex III high-risk → 2 Dec 2027, Annex I → 2 Aug 2028; GPAI/prohibitions unchanged; special-category data for bias detection broadened — https://www.addleshawgoddard.com/en/insights/insights-briefings/2026/technology/eu-ai-act-ai-omnibus-formally-adopted/
- Digital Omnibus (GDPR part) still in Council negotiation Sept 2026; Art. 4(1) definition change dropped in Council text — https://edri.org/wp-content/uploads/2026/09/Letter-to-Council-Digital-Omibus-Data.pdf
- EU–US DPF upheld by General Court (*Latombe*, 3 Sept 2025), appeal C‑703/25 P — https://iapp.org/news/a/european-general-court-dismisses-latombe-challenge-upholds-eu-us-data-privacy-framework ; https://www.wilmerhale.com/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework
- CJEU *EDPS v SRB* (C‑413/23 P, 4 Sept 2025) relative concept of personal data — https://www.jonesday.com/de/insights/2025/09/cjeu-clarifies-scope-of-personal-data-in-edps-v-srb-decision ; https://cm.twobirds.com/en/insights/2025/eu-the-srb-decision-a-new-era-for-personal-data-and-data-processing-agreements
- Germany NIS2UmsuCG in force 6 Dec 2025 (~29,500 entities) — https://www.reedsmith.com/our-insights/blogs/technology-law-dispatch/102lxfr/finally-germany-enacts-its-nis2-law/
- Cloud and AI Development Act proposal (3 June 2026, four assurance levels) — https://www.hoganlovells.com/en/publications/the-eus-cloud-and-ai-development-act-cada-towards-a-sovereigntyfocused-framework-for-cloud
- Gaia-X "Season 2.0" / data spaces; EDC on the Dataspace Protocol — https://gaia-x.eu/gaia-x-ordinary-general-assembly-2026-key-highlights/ ; https://catena-x.net/en/offers/edc-the-central-component
- SAP Note 3255746 (ODP RFC use by third parties not permitted, Feb 2024; Datasphere recommended) — https://theobald-software.com/en/?p=53836 ; https://www.matillion.com/blog/evolving-your-sap-data-strategy-responding-to-sap-note-3255746
- SAP Business Data Cloud + SAP Databricks (Feb 2025) — https://www.databricks.com/de/company/newsroom/press-releases/databricks-announces-launch-sap-databricks
- Kubernetes: sidecars and per-index backoff GA 1.33 — https://kubernetes.io/blog/2025/04/23/Kubernetes-v1-33-Release/ ; DRA GA 1.34 — https://kubernetes.io/blog/2025/09/01/kubernetes-v1-34-dra-updates/ ; in-place pod resize GA 1.35 — https://kubernetes.io/blog/2025/12/19/Kubernetes-v1-35-in-place-pod-resize-ga/ ; Workload API / gang scheduling alpha 1.35 — https://www.cncf.io/blog/2026/02/23/kubernetes-as-ais-operating-system-1-35-release-signals/ ; current releases 1.36 (Apr 2026) and 1.37 (Aug 2026) — https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/ ; https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/
- Apache Spark Kubernetes Operator subproject (SparkApp/SparkCluster CRDs) — https://github.com/apache/spark-kubernetes-operator ; Kueue + Kubeflow Spark Operator — https://kueue.sigs.k8s.io/docs/tasks/run/kubeflow/sparkapplications/
- Strimzi KRaft-only from 0.46 — https://issues.redhat.com/browse/DBZ-9095 ; https://github.com/strimzi/strimzi-kafka-operator/blob/main/CHANGELOG.md
- Open Data Contract Standard v3.1.0 (Bitol) — https://bitol.io/bitol-announces-odcs-v3-1-0-stronger-smarter-and-stricter/
- OpenLineage Airflow provider (built in since 2.7, active 2026 releases); explicit-lineage facet proposal — https://airflow.apache.org/docs/apache-airflow-providers-openlineage/stable/changelog.html ; https://openlineage.io/blog/explicit-lineage
- FOCUS 1.3 (Dec 2025: split-cost allocation, contract-commitment dataset, recency/completeness) — https://finops.org/insights/introducing-focus-1-3/ ; https://www.linuxfoundation.org/press/finops-foundation-launches-focus-1.3-to-deepen-cloud-and-saas-billing-transparency-announces-expanded-vendor-support-for-focus-1.2
- Soda 4 contracts-first engine (Jan 2026) — https://docs.soda.io/release-notes/soda-core-release-notes
- GX Cloud → FICO; GX Core stewardship → Fivetran (May 2026) — https://www.greatexpectations.io/blog/an-update-from-great-expectations ; https://www.fivetran.com/press/fivetran-to-become-steward-of-the-great-expectations-open-source-community-and-gx-core-project
- NIST SP 800-38G Rev.1 2nd public draft (Feb 2025) drops FF3/FF3-1 — https://csrc.nist.gov/pubs/sp/800/38/g/r1/2pd
- India DPDP Rules notified 13 Nov 2025, phased to May 2027 — https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-
- Netflix Maestro open-sourced Jul 2024 — https://thenewstack.io/netflix-open-sources-maestro-a-next-gen-data-workflow-engine/

## Added topics
- §10.1: Object storage semantics for data engineers; Storage classes and lifecycle economics; Workload identity and least privilege; Private networking and exfiltration control (expanded); Cloud cost anatomy for data workloads (expanded from a one-liner). New lab (conditional-write commit log + SlowDown).
- §10.2: Catalog-enforced access and credential vending; Managed table services on object storage (S3 Tables et al.); Serverless vs provisioned compute economics. New lab.
- §10.3: Lakehouse platform choice: storage, format, pricing (Databricks/Snowflake/Fabric/BigQuery at mechanism level). New lab (SDP vs hand-orchestrated streaming).
- §10.4: Cost attribution and showback with FOCUS; Compute cost controls and commitments. New lab.
- §10.5: Residency, transfers and extraterritorial access; EU Data Act for data platforms; EU AI Act duties for data engineers; NIS2, DORA and CRA obligations; Sovereign cloud and data spaces (expanded from "Gaia-X" line). New lab (Art. 30 from lineage + residency CI test).
- §10.6: IT/OT integration without blocking production (ISA-95/Purdue, OPC UA, MQTT/Sparkplug B, OT DMZ).
- §11.1: Deferrable tasks and the triggerer; Data-aware and event-driven scheduling; Asset-centric orchestration (Dagster model); Orchestrator landscape and selection. New lab.
- §11.2: Workflow determinism and versioning; Signals, timers and human-in-the-loop sagas; Durable execution landscape (Restate, DBOS, Lambda durable functions).
- §11.3: New game-day lab.
- §11.4: Data-diff regression testing (own reel); Slim CI and state-aware builds; Zero-copy environments: clones and branches. New lab.
- §12.1: Reproducible, minimal, signed images; Container resource limits: cgroups and OOM. New lab.
- §12.2: Requests, limits, QoS and eviction; Jobs and CronJobs for batch pipelines; Batch scheduling: queues and gang scheduling; Spark on Kubernetes internals; Stateful streaming on Kubernetes; Autoscaling data workloads. Lab extended (spot decommissioning, Kueue).
- §12.3 (new section): GitOps reconciliation for data platforms + lab.
- §13.1: OpenTelemetry across batch and streaming; SLO burn-rate alerting. New lab.
- §13.2: Audit logging and tamper evidence (own reel); new erasure/re-identification lab.
- §13.3: Data observability: anomaly detection on metadata (own reel). New lab.
- Systems in Production: Borg (EuroSys 2015), Cadence → Temporal, Netflix Maestro (2024), LinkedIn DataHub (2019).

## Removed or merged (with reason)
- 10.1 "Managed compute vs self-managed compute" → merged into §10.2 "Serverless vs provisioned compute economics" (same decision, one reel).
- 10.2 AWS/Azure/GCP service lists and "mapping … across providers" → one compact *(refresher)* mapping topic (vendor catalogs are de-emphasised per Ch.23; mechanisms are taught in the reels that follow). "Managed-service trade-offs and vendor lock-in" merged into the mapping and platform-choice topics.
- 10.2.1 Glue (3 bullets) → split across §10.2 credential-vending (catalog) and serverless-economics (DPU billing, job bookmarks) topics.
- 10.2.2 Lake Formation (3 bullets) → §10.2 "Catalog-enforced access and credential vending".
- 10.3 "Delta-on-Databricks operations" → removed; already taught in §6.3 (OPTIMIZE/Z-ORDER, liquid clustering, VACUUM, CDF, deletion vectors); cross-referenced.
- 10.3 "Databricks SQL" → merged into "Databricks compute model and Photon" (BI boundary is §17.7).
- 10.3 "Cost/performance tuning (DBU economics)" → merged into the compute-model topic and §10.2 economics.
- 10.3 "Notebooks vs production code / DABs" → moved into §11.4 "Zero-copy environments…" (promotion) — notebook anti-pattern already in Ch.23.
- 10.4 "GitOps for data platforms" → §12.3 GitOps reconciliation (in-cluster) and §10.4 IaC (cloud resources).
- 10.4 storage tiering → §10.1 storage classes.
- 10.5 "SuccessFactors (HR) → analytics" → merged into §10.6 "SAP extraction paths and their limits" (too small for a reel).
- 10.5 "Master data governance" → removed; home is §8.3 MDM (which already cross-references here).
- 10.5 "Time-zone and multi-currency considerations" → removed; covered by §8.3 (conflicting units/currencies/time zones) and §16.2 (event time and time zones).
- 10.5 "Language/localization in data catalogs" → removed as filler (not a learnable mechanism).
- 10.5 "On-prem Hadoop/Spark clusters" + "Private cloud" → merged into §10.7 "On-prem data platforms after Hadoop"; "Hybrid architectures" + "Network latency between on-prem and cloud" → merged into §10.7 "Hybrid connectivity, egress and latency".
- 10.5 "Regulatory and compliance layer" (GDPR) → split/rewritten into §10.5 GDPR-by-design and Residency/transfers topics; PII detection/masking moved to §13.2.
- 11.1 "Scheduler/executor/worker" + "Metadata database and operational concerns" → one reel "Orchestrator architecture…".
- 11.1 "Task retries and idempotency" + "Task-level vs workflow-level failure" → one reel "Idempotent tasks and failure semantics".
- 11.1 "Pools, queues, concurrency controls" → "Concurrency controls: pools, queues, priorities".
- 11.1 "Alternatives and trade-offs" + 11.1.5 Step Functions (3 bullets) → "Orchestrator landscape and selection" (compact) and §11.2 "Choosing DAG, asset or durable models".
- 11.2 "When DAG-based orchestration isn't enough" (4 sub-bullets) + "Temporal architecture" + "Durable execution semantics" → "Durable execution: event history and replay" and "Workflow determinism and versioning".
- 11.2 comparison table (4 sub-bullets) + "Trade-offs" → "Choosing DAG, asset or durable models".
- 11.3 "Freshness, completeness, validity…" + "SLIs/SLOs and error budgets" → one reel "Data SLIs, SLOs and error budgets".
- 11.3 "Data incidents and blast radius" + "Runbooks and ownership; on-call" → "Data incident response and blast radius".
- 11.3 "Backfills and replay; idempotent, resumable backfill design" → merged into §11.1 "Data intervals, catchup and backfills" (duplicate of 11.1 backfills).
- 11.4 "Data-contract enforcement in CI" + 13.4 "Data contracts" → single home §11.4 "Contract enforcement in CI" (§3.4 and §13.4 cross-reference it).
- 11.4 "GitOps and reproducibility" → removed; covered by §10.4 IaC, §12.1 reproducible images, §12.3 GitOps.
- 12.1 "Images, layers, volumes, networks" + "Multi-container environments" + "Secrets/configuration" → one *(refresher)* reel; "Resource limits and health checks" → "Container resource limits: cgroups and OOM"; "Reproducible builds" → "Reproducible, minimal, signed images".
- 12.2 "Pods, deployments…", "Services and networking", "ConfigMaps and Secrets", "Persistent volumes", "Schedulers and node pools", "Failure/restart behavior" → one *(refresher)* primitives reel plus the mechanism reels listed under Added.
- 13.1 "Structured logging" + "Metrics…" → "Telemetry for pipelines: logs, metrics, traces"; "Tracing concepts (OpenTelemetry)" → own reel; "High-cardinality dimensions" + 13.3.5 CloudWatch (3 bullets) → "Metric cardinality and observability cost"; "Alert fatigue…" → "SLO burn-rate alerting"; "Pipeline lineage and dependency visualization" → §13.3 OpenLineage.
- 13.2 "Data catalogs and lineage" → §13.3 (duplicate).
- 13.2 "Dynamic data masking…" + "Column/row-level security" + 13.4 "Access control at scale" → "Row/column security and dynamic masking in-engine"; 13.2 "RBAC/ABAC concepts" + 13.4 IAM federation → "Access-control models: RBAC, ABAC, policy-as-code".
- 13.2 "Retention and deletion policies; right-to-erasure" → "Right to erasure in immutable lakehouses"; "Auditability" → "Audit logging and tamper evidence".
- 13.4 "Ownership model" + "Stewardship vs pure automation" → "Federated governance operating model".

## Split topics
- 13.2 "Privacy-enhancing techniques" (one bullet) → four reels: Pseudonymisation vs anonymisation; k-anonymity, l-diversity, t-closeness; Differential privacy for aggregate release; (hashing/salting folded into pseudonymisation).
- 13.2 "Encryption at rest/in transit; envelope encryption…; tokenization and FPE" → Envelope encryption, KMS and key rotation; Tokenization and format-preserving encryption.
- 10.3 "Unity Catalog in depth" stays one reel, but "Orchestration and pipelines" split: declarative pipelines → own reel; Workflows → §11.1 landscape.
- 11.4 "Testing the transformation layer" → Testing pyramid for transformations; Data-diff regression testing.
- 11.4 "CI for data code" + "Environment promotion" → Slim CI and state-aware builds; Zero-copy environments: clones and branches.
- 12.2 "Spark-on-Kubernetes and Kafka-on-Kubernetes operational patterns" → Spark on Kubernetes internals; Stateful streaming on Kubernetes: Kafka, Flink.
- 10.5 (four long groups) → three sections: §10.5 EU regulatory architecture (7 reels), §10.6 SAP and industrial-system integration (2 reels), §10.7 Hybrid and on-prem architectures (2 reels + integrating lab). Decision: the old 10.5 was not reel-sized; regulation, SAP/OT integration and hybrid networking are independent mechanisms with different prerequisites.

## Moved
- **10.5 "German manufacturing plants data model (OEE, production scheduling, quality SPC)" → proposed for §16.1 (Manufacturing data model).** ACTION FOR COORDINATOR / Ch.16 owner: §16.1 has no OEE/SPC topic. Suggested paste-ready topic: `- **OEE and statistical process control** — OEE = availability × performance × quality and how each factor is computed from machine states, cycle times and scrap counts (the planned-downtime and ideal-cycle-time traps); SPC control charts (X̄-R, p-charts), control vs specification limits, Western Electric rules, Cp/Cpk; streaming vs batch computation and why OEE rollups across lines are not averages.`
- Databricks Asset Bundles (10.3) → §11.4 (environment promotion).
- PII detection/masking (10.5) → §13.2.
- Backfill design (11.3) → §11.1.
- Data contracts (13.4) → §11.4.
- Lineage visualization (13.1) and catalogs/lineage (13.2) → §13.3.
- GitOps (10.4, 11.4) → new §12.3.
- Cross-reference note for other slices: §3.4 bullet "Data contracts enforced in CI" should point to §11.4; §8.3 MDM note "cross-ref the SAP/master-data note in Ch.10.5" should now point to §10.6. Ch.20 "AWS advanced"/"Europe/Industrial" questions still match the new topics (Lake Formation → §10.2 credential vending; Step Functions → §11.1 landscape).

## Refresher-tagged
- Failure domains: regions, zones, cells (§10.1)
- Cross-cloud data-service mapping (§10.2)
- Images, layers and local environments (§12.1)
- Kubernetes workload primitives (§12.2)
- (The quality dimensions inside "Data SLIs, SLOs and error budgets" are flagged as refresher material within an otherwise expert reel.)

## Unverified
Web-search budget ran out before these could be checked against primary sources in this session. They are stated from well-established knowledge, and the wording is kept conservative:
- S3 strong read-after-write consistency since Dec 2020; per-prefix request-rate figures (left unquantified in the topic text).
- Terraform BSL relicensing (Aug 2023) and the OpenTofu fork.
- DORA applicability 17 Jan 2025; CRA reporting obligations from 11 Sept 2026 and full application 11 Dec 2027; NIS2 24h/72h/1-month reporting cadence; PCI DSS v4.0.1 future-dated requirements mandatory 31 Mar 2025.
- Microsoft EU Data Boundary (stated without a completion date for this reason).
- AI Omnibus regulation number and exact Official Journal / entry-into-force dates. One secondary source gives Reg. (EU) 2026/1744, in force 27 Jul 2026. The slice says only "2026 AI Omnibus".
- Temporal Worker Versioning GA date (the secondary source gives Mar 2026; server v1.31 removed version sets). The slice says "GA 2026".
- Soda Core v4 licence change to Elastic License 2.0 (from a competitor page only). Not stated in the slice.
- §87(1) No. 6 BetrVG co-determination (well-established German labour law; not re-checked).
- Airflow history (Airbnb 2014, Apache TLP 2019), Minerva (2021), DataHub (2019), Borg (EuroSys 2015), Basiri et al. IEEE Software 2016 and ChAP. These are standard bibliographic facts but were not re-fetched.
- Prefect 3, Kestra, Restate and DBOS are named as landscape examples without version claims.
- dbt unit tests (introduced in dbt 1.8), BigQuery differential-privacy clause and Delta Sharing protocol mechanics. These are standard features but were not re-checked this session.

Topics: before 116 → after 95 (topics 112 → 87; Systems in Production 4 → 8; refresher-tagged 4; labs 4 → 17)
