# de-m3m4 — change log (Data Engineering Milestone 3: Ch.7, Milestone 4: Ch.8–9, both Systems-in-Production sections; original.md lines 351–489)

## Corrections
- **RocksDB state store is not the OSS default.** The original §7.4 called it "the modern default". Spark docs still name the HDFS-backed in-memory provider as the default; RocksDB is opt-in and recommended for millions of keys (and required by `transformWithState`). Source: https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html
- **Hive paper numbers.** The original said "15 TB/day → hundreds of TB/day by publication". The VLDB 2009 paper says the warehouse held "over 700 terabytes of usable data" and served "over 5000 queries on a daily basis"; it has no 15 TB/day figure. Source: https://www.vldb.org/pvldb/vol2/vldb09-938.pdf
- **"Presto/Trino were later built at Facebook".** Presto was built at Facebook. Trino is the later fork by Presto's original creators after they left. Corrected in the Hive/Presto entries.
- **RDD entry.** The original said a shuffle "breaks lineage". A shuffle dependency is a materialisation and stage boundary; lineage is preserved through it, and that lineage is what recomputation uses. Reworded.
- **Tungsten "whole-stage JVM bytecode / off-heap layouts".** Made precise: Tungsten generates Java source compiled at runtime by Janino, and its UnsafeRow binary format can live on-heap or off-heap. Catalyst join reordering is cost-based and runs only when statistics exist.
- **MDM styles.** The original listed three styles (registry, consolidation, centralised). The standard taxonomy has four; coexistence was added.
- **Kafka entry.** Removed the unsupported "trillions of messages per day" comparison. The "Ch.25-E" cross-ref is remapped to → *Rust Systems Engineering* M5.
- **Debezium exactly-once.** Added the documented caveat: Debezium has no dedup layer of its own and relies on Kafka Connect KIP-618 (Jepsen-reported concerns are cited in its docs). Source: https://debezium.io/documentation/reference/stable/configuration/eos.html

## Currency updates (with source URLs)
- **Spark 4.0 (May 2025) facts.** ANSI on by default (SPARK-44444), VARIANT (SPARK-45827), `transformWithState`/state API v2 (SPARK-46815), State Data Source reader (SPARK-45511), Python Data Source API (SPARK-44076), Python UDTFs (SPARK-43797), JDK 17 / Scala 2.13 baseline, Mesos removed (SPARK-44442), state checkpoint structure v2. Source: https://spark.apache.org/releases/spark-release-4-0-0.html
- **Spark 4.1 (Dec 2025).** Spark Declarative Pipelines; Real-Time Mode (stateless single-stage Scala, Update mode, Kafka source, Kafka/foreach sinks, single-digit-ms p99); VARIANT GA with shredding; SQL scripting GA; `@arrow_udf`/`@arrow_udtf`; Spark ML on Connect GA. Sources: https://www.databricks.com/blog/introducing-apache-sparkr-41 and https://spark.apache.org/news/index.html
- **Spark 4.2 (Jul 2026).** Arrow-optimised Python UDFs on by default (SPARK-54555); RTM PySpark trigger (SPARK-54660); named streaming sources/sinks for checkpoint evolution (SPARK-54909/56719); SDP Auto CDC (SCD1). Source: https://spark.apache.org/releases/spark-release-4-2-0.html
- **Spark Connect.** Architecture, `pyspark-client`, and its limits (no RDD, no SparkContext, no Py4J). Source: https://spark.apache.org/docs/latest/spark-connect-overview.html
- **Kafka 4.0 (Mar 2025).** ZooKeeper removed; KIP-848 GA; KIP-932 early access; KIP-890 phase 2 completed; KIP-966 ELR preview; KIP-996 pre-vote; Java 17 brokers / Java 11 clients; message formats v0/v1 removed. Source: https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/
- **`linger.ms` default 0 → 5 ms in 4.0 (KIP-1030).** Source: https://cwiki.apache.org/confluence/display/KAFKA/KIP-1030%3A+Change+constraints+and+default+values+for+various+configurations
- **Kafka 4.1 (Sep 2025).** Share groups in preview; KIP-1071 early access. Source: https://kafka.apache.org/blog/2025/09/04/apache-kafka-4.1.0-release-announcement/
- **ELR default-on for new clusters from 4.1.** Source: https://kafka.apache.org/41/operations/eligible-leader-replicas/
- **Kafka 4.2 (Feb 2026).** Share groups production-ready (RENEW ack, KIP-1222); Streams rebalance protocol GA with a limited feature set; Streams DLQ (KIP-1034). Source: https://kafka.apache.org/blog/2026/02/17/apache-kafka-4.2.0-release-announcement/
- **Kafka 4.3 (May 2026).** Classic group protocol slated for deprecation (KIP-1274 phase 1); tiered-storage refinements. Source: https://kafka.apache.org/blog/2026/05/22/apache-kafka-4.3.0-release-announcement/
- **Kafka 3.9 (Nov 2024).** Tiered storage production-ready; dynamic KRaft quorums (KIP-853); last release with ZooKeeper, so it is the migration bridge. Source: https://kafka.apache.org/blog/2024/11/06/apache-kafka-3.9.0-release-announcement/
- **KIP-1150 diskless topics accepted (vote closed 2 Mar 2026)** but not in any Apache release yet. Source: https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead
- **Flink 2.0 (Mar 2025).** Disaggregated state (ForSt), async state API, materialised tables, adaptive broadcast/skew join; removed DataSet API, Scala APIs, SourceFunction/SinkFunction and per-job mode; Java 17 default; 1.x→2.x state incompatible. Source: https://flink.apache.org/2025/03/24/apache-flink-2.0.0-a-new-era-of-real-time-data-processing/
- **Flink 2.1 (Jul 2025).** Model DDL / `ML_PREDICT`, VARIANT, process table functions, delta join, multi-way join. Source: https://flink.apache.org/2025/07/31/apache-flink-2.1.0-ushers-in-a-new-era-of-unified-real-time-data--ai-with-comprehensive-upgrades/
- **Flink 2.2 (Dec 2025).** `VECTOR_SEARCH`, Table API inference, delta-join improvements. Source: https://flink.apache.org/2025/12/04/apache-flink-2.2.0-advancing-real-time-data--ai-and-empowering-stream-processing-for-the-ai-era/
- **Flink 2.3 (Jun 2026).** `FROM_CHANGELOG`/`TO_CHANGELOG`, new watermark-alignment default, SinkUpsertMaterializer rework. Source: https://flink.apache.org/2026/06/25/apache-flink-2.3.0-release-announcement/
- **Flink release list,** including Flink CDC 3.6 (Mar 2026). Source: https://flink.apache.org/posts/
- **Debezium is on the 3.x line (latest 3.7, Sep 2026).** Connectors need Java 17+. Source: https://debezium.io/releases/
- **Debezium Postgres features.** pgoutput, snapshot modes, incremental snapshots (DDD-3, DBLog-style), read-only incremental snapshots (PG13+), PG17 failover slots, heartbeat guidance for WAL growth. Source: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
- **Confluent Tableflow.** Materialises topics as Iceberg/Delta, has a built-in Iceberg REST catalog, and Delta is GA. Source: https://docs.confluent.io/cloud/current/topics/tableflow/overview.html
- **ksqlDB** is under the Confluent Community License and "no longer accepting contributions from the community". Source: https://github.com/confluentinc/ksql
- **Fivetran–dbt Labs merger announced 13 Oct 2025.** Source: https://www.getdbt.com/blog/dbt-labs-and-fivetran-merge-announcement
- **Apache Gluten** is a top-level project with Velox and ClickHouse backends and a Substrait plan handoff. Source: https://gluten.apache.org/
- **DataFusion Comet** offloads via a protobuf plan with Arrow results, has its own shuffle manager and supports Spark 4.1. Source: https://datafusion.apache.org/comet/
- **Flink 2.0 disaggregated state paper (PVLDB 18(12), 2025, Mei et al.).** Source: https://www.vldb.org/pvldb/vol18/p4846-mei.pdf
- **Removed "stateful functions"** from the Flink topic. Flink StateFun is not part of the current Flink 2.x core feature set and isn't something an expert needs. The project's inactivity is unverified (see Unverified).

## Added topics
- **§7.1:** Tungsten and whole-stage code generation (split out of Catalyst); Task scheduling, locality and parallelism (expanded).
- **§7.2:** Bucketing and storage-partitioned joins (SPJ added); Shuffle joins: sort-merge vs shuffled hash (new mechanism detail).
- **§7.3:** Indeterminate stages and retry correctness; Push-based and remote shuffle services (Magnet, Celeborn, Uniffle); Diagnosing jobs from the Spark UI.
- **§7.4:** Real-time mode in Structured Streaming (Spark 4.1+); Arbitrary state with transformWithState (Spark 4.0).
- **New §7.5 Spark 4.x platform changes:** ANSI mode and the 3.x → 4.x migration; VARIANT type; Python Data Source API and UDTFs; Spark Declarative Pipelines.
- **New §7.6 Native vectorized execution for Spark:** Native engine offload (plan conversion and fallback); Photon, Gluten+Velox, Comet and GPUs compared. The brief asked whether these belong here or in M2 §6.4. They belong here: they are Spark execution-layer plug-ins. §6.4 keeps the standalone engines (Trino, DuckDB, DataFusion, Velox as a library) and §2.4 keeps vectorisation fundamentals; both are cross-referenced.
- **New §7.7 Execution models beyond Spark:** Pipelined MPP vs staged batch execution (Trino-style pipelining vs Spark-style materialised shuffle, plus Trino FTE). This is a compute-model comparison, not a duplicate of §6.4's Trino internals. Ray Data streaming execution covers heterogeneous CPU/GPU batch inference.
- **§8.1:** Database extraction without hurting production (split out); Webhook and event ingestion (split out); File ingestion and landing zones (object-store commit protocols).
- **§8.2:**
  - PostgreSQL logical decoding internals, with PG16 standby decoding and PG17 failover slots.
  - MySQL binlog and other change logs.
  - Incremental snapshots with watermark windows (DBLog).
  - CDC offsets, replay and exactly-once (KIP-618).
  - Transactional outbox pattern (split from Debezium).
  - Flink CDC pipelines.
  - Landing CDC in lakehouse and warehouse.
- **§8.3:** Blocking and candidate generation (split out); Clustering, survivorship and golden records (adds the connected-components over-merge problem).
- **§9.1:**
  - KRaft: metadata as a replicated log (ZooKeeper removal, 3.9 bridge).
  - Consumer groups and rebalance protocols (KIP-848, KIP-1071).
  - Share groups: queues on Kafka (KIP-932).
  - Diskless and object-store-native Kafka (KIP-1150, WarpStream, Inkless, AutoMQ, Bufstream, Freight).
  - ELR (KIP-966), added to the replication topic.
- **§9.2:** Delivery semantics and where duplicates arise; End-to-end exactly-once with external sinks; Triggers, allowed lateness and retractions (split); transactions v2 and KIP-939 2PC, added to the transactions topic.
- **§9.3:**
  - Flink runtime architecture.
  - Asynchronous barrier snapshots.
  - Keyed state, key groups and rescaling.
  - Disaggregated state in Flink 2.x.
  - Flink SQL and dynamic tables (delta/multi-way joins, materialised tables, PTFs, `ML_PREDICT`).
  - Apache Beam and the portable model.
  - Streaming into the lakehouse (Tableflow, Redpanda Iceberg topics, Paimon, Fluss).
  - Feldera/DBSP, added to streaming databases.
- **Labs.** One lab per section, 13 in total. The original slice had no labs; it had only the toy-Kafka-log idea, which is now in the §9.1 lab.
- **Systems in Production M3:**
  - Spark SQL / Catalyst & Tungsten (SIGMOD 2015), restructured from the original prose into a case study.
  - Magnet (VLDB 2020).
  - Presto (ICDE 2019).
  - Photon (SIGMOD 2022).
  - Velox (VLDB 2022).
- **Systems in Production M4:**
  - Exactly-once in Kafka (SIGMOD 2021).
  - Dataflow Model (VLDB 2015).
  - State Management in Apache Flink (VLDB 2017).
  - Disaggregated State in Flink 2.0 (VLDB 2025).
  - Kora (VLDB 2023).
  - DBLog (Netflix 2019).
  - Samza now cites its VLDB 2017 paper.

## Removed or merged (with reason)
- **§7.1:** "Driver, executors, jobs, stages, tasks" and the task-scheduling bullet → one refresher plus one scheduling topic. "DAG construction, stage boundaries" + "Narrow vs wide transformations" → DAG scheduling and stage boundaries (one mechanism). "Logical vs physical plans" + Catalyst → Catalyst: from unresolved to physical plan.
- **§7.1 "Spark 4.0 as the current major line"** (a version note, not a mechanism) → replaced by concrete topics in §7.5 and §7.4.
- **§7.2:** "Partition count/size" + "Repartition vs coalesce" → one topic. "Hash partitioning, partition pruning" kept, with range partitioning added. "Small-file problem, output compaction" was a duplicate of §6.1/§6.3; it was narrowed to the Spark-specific "Controlling Spark output file layout" with a cross-ref.
- **§7.3:**
  - "Executor memory, memory overhead" → Executor memory model.
  - "Spilling, shuffle memory" → Spill and shuffle memory pressure.
  - "Persistence levels" + "Checkpointing vs caching" → Caching, persistence and checkpointing (one comparison).
  - "Executor loss, task retry, speculative execution" → Task retry, fetch failure and speculation.
- **§7.4:** "Event time vs processing time, watermarks" + "Late data and state cleanup" → Event time, watermarks and late data (the watermark is the state-cleanup mechanism).
- **§8.1:** "Push vs pull…" + batch/micro-batch → refresher. "Idempotent and resumable extraction; checkpointing offsets" → one topic.
- **§8.2:** "Snapshots + change streams" + "Initial-snapshot-plus-stream consistency" → Initial snapshot to stream handoff. "Replay and offset management" → CDC offsets, replay and exactly-once. "CDC into Kafka / lakehouse / warehouse" → Landing CDC in lakehouse and warehouse. The Kafka part is covered by the Debezium topics.
- **§8.3:** "Reference data and crosswalks" + "Schema matching and integration" → Semantic integration: schemas, codes and units. Both are the same semantic-mapping problem.
- **§9.1:**
  - "Offsets, log segments" + "Log internals (systems-level)…build a toy log" → Partitioned log storage topic plus the §9.1 lab. The toy-log build is now a lab, not a topic.
  - "Partition leaders and replicas" + "Replication, ISR concepts" → Replication, ISR and the high watermark.
  - "Consumer groups and partition assignment" → Consumer groups and rebalance protocols.
- **§9.2:** "Dead-letter topics, retry topics, poison messages" → one topic.
- **§9.3:**
  - "Streaming SQL and stream-processing libraries" bundle → Flink SQL goes to the Flink SQL topic; Kafka Streams gets its own topic with ksqlDB folded in. ksqlDB is no longer accepting community contributions, so it doesn't get its own reel.
  - The Flink "stateful functions" sub-point was removed (see Currency).
  - The "Heavily asked for in EU/global enterprise roles" phrase was removed as non-learnable filler.
- **Real-time OLAP serving bullet:** narrowed to streaming ingestion into OLAP. Serving trade-offs live in §5.5 and engine internals in §6.4, so this avoids a duplicate.

## Split topics
- **Catalyst/Tungsten** → Catalyst plan pipeline / Tungsten and whole-stage codegen.
- **"Broadcast joins" / "Sort-merge joins, shuffle hash joins"** → Broadcast hash join / Shuffle joins: sort-merge vs shuffled hash. Kept as two, each deepened.
- **Skew and AQE** → AQE (three runtime re-optimisations) / Data skew: diagnosis and remedies (including where AQE does not help).
- **"Database WAL/binlog internals"** → PostgreSQL logical decoding internals / MySQL binlog and other change logs.
- **"Debezium internals: connectors, snapshot modes, outbox pattern, SMTs"** → Debezium architecture and event model / Transactional outbox pattern. Snapshot modes moved to the snapshot-handoff topic.
- **Snapshotting** → Initial snapshot to stream handoff / Incremental snapshots with watermark windows.
- **"Entity resolution / record linkage" mega-bullet** → Record linkage: deterministic and probabilistic matching / Blocking and candidate generation.
- **"Deduplication and canonicalization"** → Clustering, survivorship and golden records.
- **"Idempotent producers, transactions"** → Idempotent producer / Kafka transactions and read-committed.
- **"Windowing and time semantics" mega-bullet** → Event time, watermarks and completeness / Windowing: tumbling, sliding, session, global / Triggers, allowed lateness and retractions.
- **"Apache Flink: DataStream API, event-time, checkpoints/savepoints, stateful functions, watermark strategies"** → Flink runtime architecture / Asynchronous barrier snapshots / Keyed state, key groups and rescaling / Disaggregated state in Flink 2.x. Event time goes to §9.2.
- **"Kafka evolution (2023+)" bundle** → Kafka tiered storage (§9.1) / Diskless and object-store-native Kafka (§9.1) / Streaming into the lakehouse (§9.3).
- **"API ingestion…" and "Webhook/event ingestion…"** kept as separate topics, each deepened. "File ingestion" and "Database extraction" were also kept separate.

## Moved
- **Tiered storage and diskless Kafka:** §9.3 → §9.1. They are Kafka storage internals.
- **Snapshot modes:** from the Debezium bullet → Initial snapshot to stream handoff.
- **Toy Kafka log build:** topic → §9.1 lab, cross-ref → *Rust Systems Engineering* Ch.27.
- **Python UDF topic:** now "PySpark execution path and Python UDF cost", with Spark 4.1/4.2 Arrow defaults.
- **Section and chapter titles:**
  - Ch.7 title "Apache Spark / PySpark — Internals and Optimization" → "Apache Spark and Distributed Batch Execution". It now hosts §7.6/§7.7.
  - §9.3 title "Beyond Kafka: the modern streaming stack" → "Stream processing engines and the modern streaming stack".
  - New sections were appended (7.5, 7.6, 7.7); no existing section was renumbered.
- **Cross-references remapped:**
  - Ch.25-E → *Rust Systems Engineering* M5 / Ch.26 / Ch.27.
  - External sort → §1.2 and *DSA* Ch.6.
  - MinHash/LSH → §5.6 and *DSA* Ch.5.

## Refresher-tagged
- Driver, executors and the task hierarchy (§7.1)
- Ingestion modes: push vs pull, batch vs streaming (§8.1)

## Unverified
- **LinkedIn moving Samza workloads to Flink** ("later superseded internally by Flink" in the original). Couldn't confirm against a primary source. Softened to "later complemented at LinkedIn by Flink"; needs a check against LinkedIn engineering posts.
- **Netflix Keystone "initially Samza-based, later Flink"; earlier pipeline "Chukwa-based".** Kept the original wording. Not re-verified this session because the web-search budget ran out.
- **KIP-939 (2PC participation) release version.** Third-party sources say 4.1, but it isn't in the 4.1 or 4.2 announcements. The slice names the KIP without a version.
- **Kora scale ("tens of thousands of clusters").** From memory of the VLDB 2023 paper (believed ~30k clusters); not re-fetched.
- **Scribe open-source year (2008) and the "Keystone (2016+)" date label.** From memory.
- **Flink Stateful Functions inactivity.** Not verified. Its removal rests on relevance, not on project status.
- **Magnet being YARN-only in OSS Spark, and the broadcast 8 GB limit.** From Spark docs and source knowledge; not re-fetched this session.
- **Confluent Freight and Aiven Inkless product names.** Not re-fetched.
- Web search hit the shared per-turn budget partway through. The remaining checks used direct page fetches.

Topics: before 88 → after 120 (plus 13 section labs; before/after counts include Systems-in-Production entries: 11 → 20)
