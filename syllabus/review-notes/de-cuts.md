# Data Engineering — shortlist of topics to cut (12 October 2026)

**Why.** The Data Engineering syllabus has 553 teaching topics (plus 71 Systems-in-Production cases); DSA has 257 and Rust 155. At one topic per routine run, the long tail is years of runs. This list names the topics that do not bear on the owner's goal: a Data Engineer role abroad (Germany, Austria, Netherlands, UK, Nordics, Switzerland; see the resumes repo, `_master/profile.md`) for a profile built on Python, SQL, Spark, Kafka, Flink, Airflow, Iceberg on MinIO, ClickHouse, Oracle/PostgreSQL/MySQL, YugabyteDB, Redis, Data Vault, Kubernetes/Docker/Helm/ArgoCD/Jenkins, Prometheus/Grafana, Power BI, with Databricks/Delta/dbt/AWS Glue/Terraform/Snowflake/BigQuery as the learnable extras, and semiconductor manufacturing + supply chain as the domain edge.

**Nothing is deleted by this file.** It is a proposal. Each line is a syllabus topic title, word for word, so it can be removed by title. Counts are per tier and per chapter.

**The test for each cut**, in order:
1. Does it appear in Data Engineer job descriptions or interviews in those markets? (Not: is it interesting.)
2. Does a sibling topic, the DSA domain or the Rust domain already teach it? (Rust M3 covers mmap, page cache, io_uring, fsync; Rust M4 the storage engine; Rust M5 Raft and the replicated log. DSA Ch.3 covers hash tables, B-trees and LSM; DSA Ch.11 Bloom/cuckoo/xor filters; DSA Ch.17 sketches, HLL, MinHash, reservoir sampling; DSA covers external merge sort.)
3. Is it a 2026 frontier item that the market has not asked for (agents, MCP, foundation-model data, LLM judges)?
4. Is it an SRE, backend or ML-platform topic wearing a data hat (rate limiters, notification fan-out, unique-ID generation, RAG evaluation)?

A topic that fails test 1 and passes test 2, 3 or 4 is in **Tier A** (cut). A topic that is real Data Engineering but deeper than any interview or JD goes, or is a vendor's second-tier feature, is in **Tier B** (cut if the goal is a syllabus the size of the other two). Everything else stays, including all of Chapter 16 (industrial and time-series data: the owner's edge), §10.6 (SAP and IT/OT: what German manufacturing JDs ask for), the Iceberg and Delta chapters, Kafka, Flink, Spark, orchestration, CDC, governance basics and the design method.

**Totals.** Tier A: 177 topics + 46 cases. Tier B: 82 topics. Cutting A alone leaves 376 topics; A and B leaves 294, in line with DSA.

**Chapter 1 is in production** (a `CHAPTER.md` plan is on `main`, six topics are live or held). A cut there changes a planned chapter: remove only topics no run has claimed (`node scripts/claim.mjs status`), and note the change in `CHAPTER.md` → the chapter's order list, or leave Chapter 1 as planned and apply the cuts from Chapter 2 on. Both are fine; the plan does not reference the cut topics' handoffs except where noted.

---

## Tier A — cut (177 topics + 46 cases)

### Chapter 1 — Prerequisites and Computer-Science Foundations (8)
Rust M1–M3 teach these at the depth the syllabus asks; a Data Engineer interview asks for the latency numbers and the I/O model, which stay.
- CPU caches, SIMD and vectorization
- Threads, context switches and synchronization cost
- Virtual memory, page cache and mmap
- Hash tables inside query engines
- TCP/IP layers and their costs *(refresher)*
- TCP handshakes, flow and congestion control
- DNS, load balancing and TLS costs
- Tail latency under fan-out

"Storage devices and fsync durability" and "Bandwidth, latency and data locality" stay.

### Chapter 2 — Advanced SQL and Query Execution (4)
- SQL standards and dialect portability
- Plan caching and plan regressions
- Inverted and generalized indexes (GIN/GiST)
- Mixed-workload interference

### Chapter 3 — Data Modeling and Analytical Architecture (4)
- Bitemporal modeling
- Wide-table and activity-schema alternatives
- dbt Fusion engine and SQL comprehension
- SQLMesh plans and virtual environments

### Chapter 4 — Advanced Python for Data Systems (4)
- Buffer protocol and zero-copy interchange
- Serialization costs in Python
- Choosing a DataFrame engine
- Reproducible environments with uv

### Chapter 5 — Database Internals and Distributed Storage (12)
- Sagas, compensation and the outbox pattern (the outbox is taught again in §8.2 "Transactional outbox pattern")
- Compute–storage disaggregated OLTP
- Inverted indexes and search segments
- Cache stampedes and thundering herds
- Count-Min Sketch and heavy hitters (DSA Ch.17)
- Stream sampling: reservoir and weighted (DSA Ch.17)
- MinHash, SimHash and LSH (DSA Ch.17)
- Sketches as stored, mergeable aggregates
- Leaderless quorums and anti-entropy
- Multi-leader replication and write conflicts
- Access-pattern-first NoSQL modeling
- NoSQL families and their fit

### Chapter 6 — File Formats, Lakehouse and Table Formats (20)
Iceberg is the owner's format; Delta is the learnable one. Hudi, Paimon, DuckLake, the catalog vendors and the composable-engine layer are not asked for in the target markets.
- Next-generation columnar file formats
- Iceberg v4 in development (not adopted; re-add when it ships)
- Hudi timeline and table types
- Hudi indexing for record-level upserts
- Hudi table services and concurrency control
- Apache Polaris
- Unity Catalog OSS
- Catalog landscape and multi-engine access
- Apache Paimon: LSM-based streaming lakehouse tables
- DuckLake: SQL database as catalog and metadata
- Metadata translation: UniForm and XTable
- Apache DataFusion as an embeddable engine (Rust domain)
- Arrow Flight, Flight SQL and ADBC
- Composable engines: Substrait, Velox, Gluten, Comet
- Snowflake compute, caching and cost
- BigQuery slots, editions and billing
- Warehouses on open table formats
- Row-oriented binary encodings: Avro and Protobuf (keep "Schema evolution rules across formats", which teaches what matters about them)
- Compression codecs and their trade-offs
- Apache Arrow columnar memory format (taught again in §4.2 "Arrow columnar memory format")

### Chapter 7 — Apache Spark and Distributed Batch Execution (10)
- Spark Connect client-server architecture
- Indeterminate stages and retry correctness
- Push-based and remote shuffle services
- Real-time mode in Structured Streaming
- Arbitrary state with transformWithState
- Python Data Source API and UDTFs
- Spark Declarative Pipelines
- Native engine offload: plan conversion and fallback
- Photon, Gluten+Velox, Comet and GPUs compared
- Ray Data streaming execution

### Chapter 8 — Data Ingestion, Integration and Change Data Capture (4)
- Webhook and event ingestion
- Record linkage: deterministic and probabilistic matching
- Blocking and candidate generation
- Clustering, survivorship and golden records

### Chapter 9 — Streaming Systems: Kafka, Flink, and Beyond (5)
- Share groups: queues on Kafka
- Diskless and object-store-native Kafka
- Apache Beam and the portable model
- Streaming databases and incremental view maintenance
- Pulsar and Redpanda as Kafka alternatives

### Chapter 10 — Cloud Data Architecture (8)
GDPR by design, residency, SAP, IT/OT and on-prem stay: they are what the German and Dutch JDs name.
- EU Data Act for data platforms
- EU AI Act duties for data engineers
- NIS2, DORA and CRA obligations
- Sovereign cloud and data spaces
- DPO, DPIA and works-council co-determination
- Declarative pipelines: Spark and Lakeflow
- Cost attribution and showback with FOCUS
- Private networking and exfiltration control

### Chapter 11 — Orchestration, Reliability and Data Operations (5)
Durable execution (Temporal) is a backend-engineering topic; one decision topic stays.
- Durable execution: event history and replay
- Workflow determinism and versioning
- Signals, timers and human-in-the-loop sagas
- Durable execution landscape
- Zero-copy environments: clones and branches

### Chapter 12 — Containers, Kubernetes and Delivery (3)
- Reproducible, minimal, signed images
- Batch scheduling: queues and gang scheduling
- Autoscaling data workloads

### Chapter 13 — Observability, Governance and Security (8)
- Metric cardinality and observability cost
- Tokenization and format-preserving encryption
- k-anonymity, l-diversity, t-closeness
- Differential privacy for aggregate release
- Global regulatory map for pipelines (US law; the EU topics in §10.5 that stay cover the target markets)
- Audit logging and tamper evidence
- Multi-tenant isolation and compliance
- Data observability: anomaly detection on metadata (keep "Data quality frameworks")

### Chapter 14 — Distributed Systems Theory (17)
What stays is what a senior Data Engineer loop asks: clocks and ordering, linearizability vs serializability, CAP/PACELC, Raft at the conceptual level, 2PC, leases and fencing, exactly-once end to end. The rest is a distributed-systems course, and Rust M5 builds the log and Raft for real.
- Two Generals and common knowledge
- Hybrid logical clocks
- TrueTime and commit wait
- Isolation anomalies as dependency cycles
- Checking histories for consistency
- FLP impossibility
- Failure detectors and their guarantees
- Gossip and SWIM membership
- Gray failures and metastable failures
- Quorum intersection is not linearizability
- Paxos and Multi-Paxos
- Transaction architectures beyond 2PC
- CRDTs
- CALM and coordination avoidance
- Formal specification with TLA+
- Deterministic simulation testing
- The consensus problem and quorum systems

### Chapter 15 — Data-System Design (13)
Classic software-system-design prompts (schedulers, rate limiters, ID generation, fan-out) are asked of backend engineers, not of Data Engineers in these markets; the data-platform designs stay.
- Search indexing pipeline with freshness SLOs
- Distributed job scheduler
- RAG ingestion for millions of documents
- Notification fan-out system
- Top-K trending with sketches
- Streaming quantiles service
- Rate limiter and per-tenant quotas
- Distributed message log from scratch (Rust M5)
- Dedup service for at-least-once streams (taught in §9.2 "Deduplication keys and idempotent consumers")
- Sharded datastore with resharding
- Distributed unique-ID generation
- Globally consistent counter or inventory
- Metrics and monitoring system at scale

### Chapter 17 — The Modern and Emerging Data Stack (44)
The whole AI-engineering layer (vector-search internals, production RAG, agents and MCP, foundation-model training data) and the graph layer. None of it has appeared in a Data Engineer JD recorded in the tracker; "RAG" appears as a buzzword at most. Feature stores, point-in-time correctness, drift monitoring, embedding pipelines, choosing a vector store, zero-ETL and the BI boundary stay: those do appear.
- Embedding models and versioning
- Chunking strategies
- Similarity metrics and exact search
- HNSW graph index
- IVF partitioning
- Vector quantization
- Disk and object-storage vector indexes
- Filtered vector search
- Hybrid lexical–dense retrieval
- Vector index freshness and compaction
- Document parsing and normalization
- Permission-aware retrieval
- Incremental ingestion and freshness
- Query transformation and routing
- Reranking stage
- Context assembly and citation grounding
- Agentic multi-step retrieval
- GraphRAG and entity-centric retrieval
- Retrieval evaluation metrics
- Generation evaluation and LLM judges
- RAG cost and latency budgets
- Reverse ETL sync mechanics
- Property graphs, Cypher and GQL
- Graph algorithms for analytics
- Pregel-style distributed graph processing
- Knowledge graph construction
- Graph-native storage vs relational joins
- Operational graph databases and update semantics
- Traversal planning and index design
- Model Context Protocol mechanics
- Securing agent access to data
- Text-to-SQL over a semantic layer
- LLM inference as a batch transform
- Agent telemetry and evaluation data
- Durable execution for agents
- LLM-assisted pipeline operations
- Pretraining corpus deduplication and filtering
- PII scrubbing and benchmark decontamination
- Fine-tuning and preference datasets
- Training-data provenance and transparency
- Feeding accelerators with data
- Serverless Postgres beside the lakehouse
- Streams as tables (taught in §9.3 "Streaming into the lakehouse")
- Declarative incremental tables (taught in §10.3 and §7.5)

### Chapter 18 — Capstones and Benchmarking (3)
- Coordinated omission
- Reproducible benchmark harnesses
- System benchmark suites

### Chapter 19 — Stakeholder Engineering (5)
Keep the four that interviews test (negotiating contracts and SLOs, communicating trade-offs, design docs/ADRs, blameless post-mortems).
- Eliciting the decision behind the ask
- Stakeholder mapping and decision rights
- Team topology for data products
- Breaking changes and deprecation campaigns (taught in §11.3 "Schema-change rollout: expand/contract")
- Proving data-platform value

### Systems in Production (46 of 71 cases)
Keep the cases behind the owner's stack and the ones every interviewer knows (MapReduce, RDDs, Spark SQL, Bigtable, RocksDB, Dynamo, Kafka, the Dataflow Model, Flink state, Iceberg, Delta Lake, Snowflake once, Dremel once, Airflow, Spanner, Aurora, DataHub, Gorilla, Michelangelo, the cross-company pattern). Cut the rest, and the four duplicates (Dremel and Snowflake appear in both M1 and M2; FoundationDB in both M6 and M8; DBLog and "Debezium into Hudi/Iceberg/Delta" repeat §8.2).
- M1: System R optimizer; PostgreSQL planner and executor; PostgreSQL MVCC and the Mandrill wraparound outage; Join Order Benchmark; MonetDB/X100 → Vectorwise; HyPer compiled execution and morsel-driven parallelism; DuckDB; Amazon Redshift; Apache Arrow; Free-threaded CPython; Dremel / BigQuery (the M2 copy stays); Snowflake (the M2 copy stays)
- M2: DynamoDB; S3 consistency evolution; TAO; Memcache at Facebook; Hudi
- M3: Magnet; Hive; Presto; Photon; Velox
- M4: Samza and Venice; Exactly-once in Kafka; Scribe; MillWheel; Disaggregated state in Flink 2.0; Kora; Keystone; DBLog; Debezium into Hudi/Iceberg/Delta
- M5: Borg; Netflix Chaos Monkey and ChAP; Cadence → Temporal; Netflix Maestro; Airbnb Minerva; Monarch
- M6: Chubby and "Paxos Made Live"; CockroachDB; FoundationDB (the M8 copy stays, where it teaches simulation testing); Uber Schemaless → Docstore
- M7: Pregel; FAISS; DiskANN; QueryGPT
- M8: Jepsen and Elle

---

## Tier B — cut if the target is a syllabus the size of DSA (82 topics)

Real Data Engineering, but deeper than any JD or loop in the target markets goes, or a vendor's second-tier mechanism. Each would make a fine topic one day; none moves a hiring decision in 2026.

### Chapter 1 (2)
- Storage devices and fsync durability (Rust Ch.15)
- Graph algorithms for pipeline DAGs *(refresher)* (DSA Ch.8)

### Chapter 2 (7)
- Recursive CTEs and graph traversal
- Nested and semi-structured data in SQL
- User-defined functions and optimizer opacity
- Window function execution internals
- CTE inlining vs materialization
- Execution models: iterator, vectorized, compiled
- Adaptive execution and runtime filters (Spark's version stays in §7.2 "Adaptive Query Execution (AQE)")

### Chapter 3 (5)
- Conceptual, logical and physical models *(refresher)*
- ER modeling and relationship cardinality *(refresher)*
- Functional dependencies and normal forms
- Bridge tables and many-to-many
- Semantic and metrics layers

### Chapter 4 (4)
- CPython object model and memory cost
- pandas 3.0 semantics
- Runtime schema validation
- Native extensions with Rust and PyO3

### Chapter 5 (9)
- Pages, slotted pages and tuple layout (Rust Ch.19–21)
- Buffer pool and page replacement (Rust)
- Checkpoints and crash recovery (Rust)
- LSM compaction and the RUM trade-off (DSA Ch.3)
- Isolation anomalies beyond ANSI
- Serializability: strict 2PL versus SSI
- Locking, deadlocks and lock escalation
- Physical vs logical replication
- Quantile sketches: t-digest, DDSketch, KLL (DSA Ch.17)

### Chapter 6 (9)
- Row vs columnar vs hybrid layouts *(refresher)*
- Variant type and shredding
- ORC versus Parquet
- Iceberg statistics and Puffin files
- Iceberg v3 spec features
- Delta Lake 4.x and Delta Kernel
- Trino: federated MPP execution
- DuckDB and single-node analytics
- Redshift distribution, sort keys and RMS

### Chapter 7 (6)
- Task scheduling, locality and parallelism
- Tungsten and whole-stage code generation
- Dynamic partition pruning (DPP)
- JVM garbage-collection symptoms
- Task retry, fetch failure and speculation
- Pipelined MPP vs staged batch execution

### Chapter 8 (4)
- Managed ingestion tools and build-vs-buy
- Incremental snapshots with watermark windows
- Master data management styles
- Semantic integration: schemas, codes and units

### Chapter 9 (4)
- KRaft: metadata as a replicated log
- Kafka tiered storage
- Disaggregated state in Flink 2.x
- Real-time OLAP ingestion

### Chapter 10 (6)
- Storage classes and lifecycle economics
- Secrets management for pipelines
- Managed table services on object storage
- Serverless vs provisioned compute economics
- Compute cost controls and commitments
- Hybrid connectivity, egress and latency

### Chapter 11 (4)
- Dynamic task mapping and fan-out
- Deferrable tasks and the triggerer
- Choosing DAG, asset or durable models
- Disaster recovery for lakehouse platforms

### Chapter 12 (2)
- Images, layers and local environments *(refresher)*
- Stateful streaming on Kubernetes: Kafka, Flink

### Chapter 13 (4)
- OpenTelemetry across batch and streaming
- SLO burn-rate alerting
- Envelope encryption, KMS and key rotation
- Federated governance operating model

### Chapter 14 (5)
- Timing and failure models
- Vector clocks and version vectors
- Sequential and causal consistency
- Coordination services and replicated logs in data systems
- Exactly-once as an end-to-end property (taught in §9.2 "End-to-end exactly-once with external sinks")

### Chapter 15 (5)
- Concurrent-writer lakehouse with time travel
- Lambda vs Kappa for one pipeline (taught in §3.3 "Lambda vs Kappa architectures")
- Data-quality monitoring platform
- Sub-100 ms fraud-scoring pipeline
- Destination-side interrogation (merge into "Source-side interrogation")

### Chapter 16 (0)
Keep all 20.

### Chapter 17 (4)
- Inference logging and log-and-wait features
- Drift and label-delay monitoring
- Embedding pipelines at scale
- BI tools as warehouse consumers *(refresher)*

### Chapter 18 (2)
- Warm-up and steady-state measurement
- Analytical benchmark suites

---

## What stays, and why it is enough

After Tier A the syllabus is 376 topics: CS foundations priced for data (Ch.1), SQL semantics, plans and physical design (Ch.2), modeling including Data Vault and dbt (Ch.3), production Python (Ch.4), storage engines, transactions, replication, serving and the two sketches everyone asks about (Ch.5), Parquet, Iceberg, Delta, the REST catalog and the engines over them (Ch.6), Spark in full (Ch.7), ingestion and CDC (Ch.8), Kafka and Flink (Ch.9), cloud mechanisms, Databricks, IaC, GDPR and residency, SAP and IT/OT, on-prem (Ch.10), Airflow 3 and data reliability (Ch.11), containers and Kubernetes for data (Ch.12), observability and governance basics (Ch.13), the distributed-systems results interviews test (Ch.14), the design method and the data-platform designs (Ch.15), all of industrial and time-series data (Ch.16), ML data foundations, the BI boundary and zero-ETL (Ch.17), benchmarking basics and the capstones (Ch.18), the four stakeholder skills interviews test (Ch.19). That is the whole of what a Data Engineer loop in Munich, Amsterdam, Zurich or London asks for, with the owner's manufacturing edge intact.
