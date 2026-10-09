# Change log — de-m6m7 (Data Engineering Milestone 6 + Milestone 7, original.md lines 678–900)

Counting rule: a topic is a bullet in the original (nested sub-bullets in §17.1.5 counted as leaves; their three group-header parents and all *Lab* lines excluded). After: every `- **…**` bullet, Systems-in-Production (SiP) entries included, labs excluded.

## Corrections
- §16.2 time-series compression: the original said TS-aware codecs compress telemetry "far better than generic columnar". That overstates it. Gorilla's ~12× (1.37 B per point vs 16 B raw) is measured against raw points, and the ALP paper (SIGMOD 2024) benchmarks show Gorilla/Chimp-class float codecs compress no better than Zstd. The topic now says the real gains are regular timestamps, decimal-aware encoding (ALP) and fast streaming decode. Source: https://ir.cwi.nl/pub/33334/33334.pdf , https://duckdb.org/library/alp/
- §17.1.5 "Catastrophic forgetting (new documents don't appear)" was misnamed. Catastrophic forgetting is an ML-training term. The real issue is ingestion lag, now covered under **Incremental ingestion and freshness**.
- §17.1.5 "citation tracking (grounding each LLM output token to a source span)" overstated what production systems do. Attribution works per claim or sentence, not per token. Rewritten as claim-level citations to source spans.
- §17.1.5 "chain-of-thought grounding" as a post-retrieval step was vague and not a data mechanism. Removed. Grounding now lives in **Context assembly and citation grounding**.
- §17.1.5 "reranking (BM25 + dense)" mixed up hybrid retrieval with reranking. They are now two topics: **Hybrid lexical–dense retrieval** (§17.1.1) and **Reranking stage** (cross-encoders / late interaction).
- Ch.14 "Why this theory underlies Kafka ISR, ZooKeeper/KRaft…" lacked precision. ISR is now explained as a non-majority quorum whose membership a consensus-backed controller decides, and ZooKeeper is described as removed in Kafka 4.0 (see Currency).
- M6 SiP Spanner: F1 named precisely as the AdWords backend. Commit-wait cost (≈2ε) and "relies on rare partitions rather than beating CAP" added. The old line "most companies solve by weakening consistency instead" was replaced with the CockroachDB alternative.
- M7 SiP Michelangelo: fixed against the primary source. Near-real-time features ran on Samza over Kafka (not Flink), batch on Spark/Hive over HDFS, online store Cassandra, with a Scala-subset feature DSL. Source: https://www.uber.com/blog/michelangelo-machine-learning-platform/
- M7 SiP vector search: "HNSW (logarithmic-ish search)" was replaced by concrete systems (FAISS, DiskANN) whose complexity and memory claims come from their papers.

## Currency updates (with source URLs)
- Kafka 4.0 (March 2025) removed ZooKeeper; KRaft only (§14.6). https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/
- MCP: donated to the Agentic AI Foundation under the Linux Foundation (9 Dec 2025). Current spec revision 2026-07-28: stateless per-request model, client elicitation, opt-in extensions such as Tasks and MCP Apps (§17.6). https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation , https://modelcontextprotocol.io/specification/2026-07-28 , https://aaif.io/blog/mcp-2026-07-28-whats-changing-and-how-to-migrate
- AutoGen and Semantic Kernel → Microsoft Agent Framework (RC Feb 2026, GA April 2026). Now named as a durable agent runtime in §17.6. https://devblogs.microsoft.com/semantic-kernel/migrate-your-semantic-kernel-and-autogen-projects-to-microsoft-agent-framework-release-candidate/
- LangGraph 1.0 (Oct 2025) with checkpointer-based durable execution (§17.6). https://changelog.langchain.com/announcements/ann_lxOZRCoFw2Qn9
- Tecton acquired by Databricks (Aug 2025) (§17.1 feature stores). https://blogs.perficient.com/2025/09/26/databricks-acquires-tecton/
- Census acquired by Fivetran (announced 1 May 2025) (§17.2). https://www.techtarget.com/searchdatamanagement/news/366623554/Fivetran-adds-reverse-ETL-with-acquisition-of-Census
- Amazon S3 Vectors GA (2 Dec 2025): object-storage-native vector indexes (§17.1.1). https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-vectors-generally-available/
- pgvector 0.8 iterative index scans for filtered ANN (§17.1.1). https://www.postgresql.org/about/news/pgvector-080-released-2952/
- MLflow 3 (LoggedModel, GenAI tracing, LLM-judge evaluation) (§17.1, §17.1.5). https://mlflow.org/releases/3
- Timescale renamed TigerData (June 2025); the OSS project is still TimescaleDB (§16.2). https://www.tigerdata.com/blog/timescale-becomes-tigerdata
- InfluxDB 3 Core/Enterprise GA (15 Apr 2025) on the FDAP stack (Flight, DataFusion, Arrow, Parquet) (§16.2). https://www.influxdata.com/blog/influxdata-announces-influxdb-3-OSS-GA , https://influxdata.com/blog/flight-datafusion-arrow-parquet-fdap-architecture-influxdb
- Prometheus 3.0 (Nov 2024): OTLP ingestion, UTF-8 names, Remote Write 2.0, native histograms. Informs the §16.2 storage-engine topic. https://prometheus.io/blog/2024/11/14/prometheus-3-0/
- ALP float compression (SIGMOD 2024), DuckDB's default float codec (§16.2). https://duckdb.org/library/alp/
- Sparkplug 3.0 published as ISO/IEC 20237 (Nov 2023) (§16.3). https://newsroom.eclipse.org/node/39754
- Asset Administration Shell standardized as IEC 63278 (§16.3). https://r-stahl.com/en/global/digital-twin/the-asset-administration-shell/
- ISO GQL (ISO/IEC 39075:2024, April 2024) and SQL/PGQ (SQL:2023 Part 16) (§17.3). https://en.wikipedia.org/wiki/Graph_Query_Language
- EU AI Act GPAI obligations in force since 2 Aug 2025. Mandatory training-content summary template published 24 Jul 2025 (§17.8). https://wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/european-commission-releases-mandatory-template-for-public-disclosure-of-ai-training-data
- Iceberg v3 (deletion vectors, row lineage, variant) generally released with Iceberg 1.10 (§17.9 cross-ref §6.3). https://dremio.com/blog/apache-iceberg-v3
- Spark Declarative Pipelines donated June 2025 and shipped in Apache Spark 4.1; Lakeflow is the managed version (§17.9). https://www.databricks.com/company/newsroom/press-releases/databricks-donates-declarative-pipelines-apache-sparktm-open-source
- Confluent Tableflow GA (Iceberg, March 2025) (§17.9). https://confluent.io/blog/tableflow-is-now-generally-available
- KIP-1150 Diskless Topics accepted 2 Mar 2026 (umbrella KIP only; implementation KIPs still in progress) (§17.9). https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead
- Apache Fluss entered the ASF Incubator in June 2025; tiers into Paimon/Iceberg/Lance (§17.9). https://incubator.apache.org/clutch/fluss.html
- Aurora PostgreSQL zero-ETL to Redshift GA (Oct 2024) (§17.9). https://aws.amazon.com/about-aws/whats-new/2024/10/amazon-aurora-postgresql-zero-etl-integration-redshift-generally-available/
- Databricks Lakebase (Neon-based Postgres) GA on AWS (Feb 2026) (§17.9). https://databricks.com/blog/databricks-lakebase-generally-available
- Snowflake acquired Crunchy Data → Snowflake Postgres (June 2025) (§17.9). https://snowflake.com/en/news/press-releases/snowflake-acquires-crunchy-data-to-bring-enterprise-ready-postgres-offering-to-the-ai-data-cloud/
- Warehouse AI SQL functions (Databricks `ai_query`, Snowflake `AI_COMPLETE`, BigQuery `AI.GENERATE`) (§17.6). https://docs.databricks.com/aws/en/large-language-models/ai-query , https://docs.snowflake.com/developer-guide/snowflake-ml/inference/inference-overview
- OpenTelemetry GenAI semantic conventions for agent/tool spans (§17.6). https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans
- Power BI Direct Lake mode (§17.7). https://learn.microsoft.com/en-us/power-bi/enterprise/directlake-overview
- Uber Schemaless evolved into Docstore (Raft-replicated MySQL, 2021) (M6 SiP). https://www.uber.com/blog/schemaless-sql-database/
- Uber QueryGPT (Sept 2024) as a new M7 SiP. https://www.uber.com/blog/query-gpt/

## Added topics
- Ch.14 (now nine sections, 14.1–14.9, all with labs): Timing and failure models; Two Generals and common knowledge; Physical clocks and why they lie; Hybrid logical clocks; TrueTime and commit wait; Linearizability; Sequential and causal consistency; Serializability vs strict serializability; Isolation anomalies as dependency cycles (Adya, SI anomalies, SSI); Checking histories for consistency (Jepsen/Elle); CAP stated precisely and PACELC; Failure detectors and their guarantees (φ-accrual); Gray failures and metastable failures; The consensus problem and quorum systems; Paxos and Multi-Paxos; Raft at the conceptual level; Leases, fencing tokens and split brain; Coordination services and replicated logs; Two-phase commit and its blocking problem; Transaction architectures beyond 2PC (Percolator/Calvin/FoundationDB); CALM and coordination avoidance; Formal specification with TLA+; Deterministic simulation testing.
- Ch.15: Requirements into SLOs; Back-of-envelope capacity estimation (with reference numbers); Trade-off articulation and decision records (incl. 45-min pacing); Distributed job scheduler; ad-click aggregation folded into the clickstream problem. Labs added for §15.1 and §15.2.
- §16.1 Energy and utility metering (counter resets); IT/OT boundary (Purdue model). §16.2 As-of alignment as its own topic; Time-series storage engine internals; Sensor data quality. New §16.3 Industrial connectivity and historians: OPC UA; MQTT/Sparkplug/UNS; Process historians and swinging-door compression; Edge buffering and store-and-forward; Asset Administration Shell. Labs added for §16.1–§16.3.
- §17.1 Inference logging and log-and-wait features; lab added.
- §17.1.1 (vector search internals, rebuilt): Similarity metrics and exact search; HNSW graph index; IVF partitioning; Vector quantization (incl. RaBitQ); Disk and object-storage vector indexes (DiskANN, S3 Vectors, Lance); Filtered vector search (pgvector iterative scans, ACORN); Vector index freshness and compaction; Choosing a vector store; Embedding models and versioning (Matryoshka); lab added.
- §17.1.5: Permission-aware retrieval (ACLs); Agentic multi-step retrieval; Retrieval evaluation metrics and Generation evaluation and LLM judges as separate topics; Reranking stage.
- §17.3 Knowledge graph construction; Pregel-style processing made explicit; GQL/SQL-PGQ.
- §17.6 (rebuilt around learnable mechanisms): Model Context Protocol mechanics; Securing agent access to data; Text-to-SQL over a semantic layer; LLM inference as a batch transform; Agent telemetry and evaluation data; Durable execution for agents; lab added.
- New §17.8 Data for foundation-model training and fine-tuning: Pretraining corpus dedup and filtering; PII scrubbing and benchmark decontamination; Fine-tuning and preference datasets; Training-data provenance and transparency (EU AI Act); Feeding accelerators with data; lab.
- New §17.9 Convergence: zero-ETL and the streaming lakehouse: Zero-ETL replication; Serverless Postgres beside the lakehouse; Streams as tables; Declarative incremental tables; lab.
- SiP M6: Chubby / Paxos Made Live; CockroachDB; FoundationDB. Schemaless entry extended with Docstore.
- SiP M7: Gorilla; Pregel; FAISS; DiskANN; QueryGPT.

## Removed or merged (with reason)
- Ch.14 "For implementation-level grounding … see Ch.25-E" bullet: moved into the chapter purpose line as → *Rust Systems Engineering* M5 (navigation, not a topic).
- Ch.14 "Idempotency and exactly-once as an architectural property" → **Exactly-once as an end-to-end property** (now explicitly about the end-to-end argument; mechanics stay in §9.2).
- Ch.14 "Why this theory underlies Kafka ISR, ZooKeeper/KRaft, distributed DBs, consistent hashing" → **Coordination services and replicated logs in data systems**. Consistent hashing is cross-referenced to §5.3.
- Ch.14 "Consensus: Raft and Paxos-family reasoning, leader election, quorum writes/reads": split, see Split topics.
- M6 SiP "Dynamo's quorum (R/W/N), revisited" → Ch.14 topic **Quorum intersection is not linearizability**. It duplicated the Milestone-2 Dynamo case study; the theory point now lives where it is taught, with a cross-ref to the M2 case study and → *Rust Systems Engineering* Ch.25.
- Ch.15 design method: 14 checklist steps merged into 9 reel-sized phases (e.g. "Identify source systems and ownership" → requirements; "Choose processing engine" + "Choose serving layer" → one; "Define partitioning, indexing, data lifecycle" + "Choose durable storage and layout" → one; "Add security, governance, observability" folded into storage/failure/destination phases).
- Ch.15 requirements checklist: 15 question bullets merged into **Source-side interrogation** and **Destination-side interrogation**. They were questions, not mechanisms.
- Ch.15 duplicates merged: "CDC from Oracle/PostgreSQL into a lakehouse" + "CDC pipeline … exactly-once-effect"; "Five-year historical backfill" + "idempotent, resumable multi-TB backfill"; "Enterprise DW with incremental loads" + "DW for a large e-commerce company"; "ML feature-generation platform" + "feature store with PIT correctness" + "near-real-time recommendation feature pipeline"; "Data-quality monitoring platform" + "data-quality / anomaly-detection platform"; "Multi-tenant SaaS analytics" + "cost-attribution system"; "Global manufacturing telemetry platform" + "100k+ sensor events/sec ingestion"; "Near-real-time production-quality dashboard" + "Real-time anomaly detection pipeline".
- Ch.15 removed as duplicates of labs elsewhere: "Data platform for a German manufacturing plant (SAP, GDPR, hybrid)" (kept as the §10.5 lab); "Long-running approval-gated workflow in Temporal" (kept as the §11.2 lab); "Operational supply-chain-provenance graph" (kept as the §17.4 lab).
- §16.1 "Plant → line → machine → sensor hierarchy" + "ERP/MES/SCADA/IoT conceptual boundaries" → **ISA-95 hierarchy and the automation pyramid**. "Maintenance and failure events" → **OEE and downtime event modeling**. "Operational vs analytical ownership" → **IT/OT boundary and data ownership**.
- §16.2 "Compression" + "Gorilla-style compression" → **Time-series compression**. "Downsampling and rollups" + "Retention tiers" → one topic. "Windowing and resampling" → **Resampling and gap filling** (windowing cross-referenced to §9.2).
- §17.1 "The data engineer's role in the ML lifecycle" → chapter purpose line (framing, not testable). "Experiment/metadata tracking" → merged into **Training-set versioning and lineage**. "Pitfalls: train/serve skew, leakage, silent schema drift" → spread into the feature-store, PIT and drift topics. "Class balancing" dropped (a modeling concern, not data engineering).
- §17.1.1 "Data pipelines for agentic systems" → §17.6 (agent telemetry, MCP). "Data pipelines for model fine-tuning" → new §17.8. "GraphRAG" → §17.1.5. Product list "Pinecone, Weaviate, Milvus, pgvector" → **Choosing a vector store** (selection criteria instead of a vendor list).
- §17.1.5: 15 sub-bullets regrouped into 11 mechanism topics. "Spurious high-rank results / feedback loops" and "Cold start / synthetic data" → evaluation topics. "Domain drift (embedding model changes)" → **Embedding models and versioning** (§17.1.1). "Hallucination mitigation" → **Context assembly and citation grounding**. "Deduplication and canonicalization" → **Document parsing and normalization**. Cost and latency SLO bullets → **RAG cost and latency budgets**.
- §17.2 two bullets → one topic, **Reverse ETL sync mechanics** (each was too small for a reel).
- §17.3 "Materialized view generation from graphs" → merged into **Graph algorithms for analytics**.
- §17.4 "Property graphs" → moved to §17.3 (prerequisite). "vs. traditional relational" → **Graph-native storage vs relational joins**. "Operational graphs" + "Real-time graph update semantics" → one topic.
- §17.5 Data product and platform thinking: section removed. Both bullets duplicate §3.4 (data mesh, data products, self-serve platform), §13.4 (ownership model, contracts) and §10.4 (platform engineering). The number 17.5 is left unused so other sections keep their numbers.
- §17.6 removed as non-mechanism hype: "State of the art: early-stage; watch LangGraph…". "Agents for data quality decision-making" + "LLM-based agents orchestrating pipelines" + "Cautions" → **LLM-assisted pipeline operations** (with guardrails). "Agent-as-ETL-state-machine" → **Durable execution for agents**.
- §17.7 "Serving/consumption contract" + "DE ↔ analyst handoff" → **Serving contract and ownership handoff**.
- M7 SiP "RAG as a data pipeline, not a prompt": not a system. Its lesson moved into the Ch.17 purpose line. M7 SiP "The agentic frontier": not a system and duplicated the §17.6 cautions; replaced by QueryGPT, a documented production system. M7 SiP "The ANN index is the whole engine" replaced by FAISS and DiskANN.

## Split topics
- Ch.14 "Consistency models revisited: linearizability, sequential, causal" → **Linearizability**; **Sequential and causal consistency**; plus new **Serializability vs strict serializability**.
- Ch.14 "Consensus: Raft and Paxos-family reasoning, leader election, quorum writes/reads" → **The consensus problem and quorum systems**; **Paxos and Multi-Paxos**; **Raft at the conceptual level**; **Leases, fencing tokens and split brain**.
- Ch.14 "Failure detection, gossip protocols" → **Failure detectors and their guarantees**; **Gossip and SWIM membership**.
- §16.2 "Gap filling and interpolation … and as-of alignment" → **Resampling and gap filling**; **As-of alignment of unsynchronized streams**.
- §16.2 "TSDB vs warehouse/lake trade-offs (InfluxDB, TimescaleDB, Prometheus)" → **Time-series storage engine internals**; **TSDB vs warehouse vs lakehouse**.
- §17.1.1 "Vector databases … indexing (HNSW, IVF), quantization, hybrid search and reranking, Lance" → HNSW; IVF; quantization; disk/object-storage indexes; filtered search; hybrid retrieval; freshness; choosing a store.
- §17.1.1 "Embedding pipelines: chunking, model selection, re-indexing" → **Embedding models and versioning**; **Chunking strategies**; **Embedding pipelines at scale**.
- §17.1.5 "Correctness: retrieval quality metrics; evaluation dataset maintenance; drift detection" → **Retrieval evaluation metrics**; **Generation evaluation and LLM judges**.

## Moved
- Ch.15 sections given numbers (§15.1–§15.5; the original sections had none). Design exercises and the question catalog regrouped by problem shape (analytical platforms; real-time/ML serving; distributed building blocks) instead of "exercise" vs "interview question".
- Property graphs §17.4 → §17.3. GraphRAG §17.1.1 → §17.1.5. Agent data pipelines and MCP §17.1.1 → §17.6. Fine-tuning data pipelines §17.1.1 → new §17.8.
- §17.1.1 repurposed as "Embeddings and vector search internals" and §17.1.5 kept as "Production RAG systems" so existing numbers stay put.
- Dynamo quorum theory: M6 SiP → §14.6.

## Refresher-tagged
- §17.7 **BI tools as warehouse consumers** *(refresher)*: recognition-level tool knowledge.

## Unverified
- MCP 2026-07-28 transport details (stdio and Streamable HTTP assumed to continue from 2025-06-18/2025-11-25). I only checked the spec overview page; the transport sub-page was not read.
- Snowflake Postgres GA status: only the acquisition and private preview are confirmed, so the slice names it without claiming GA.
- Prometheus native histograms reported "stable in v3.8" by a secondary source only. Not stated in the slice.
- Exact Microsoft Agent Framework GA date (April 2026) comes from secondary sources. The slice names the framework without a date.
- Tecton acquisition price: undisclosed. Not stated.

Topics: before 150 → after 154
