# Data Engineering — Syllabus

The data-engineering domain of the learning experience: the systems, theory and engineering behind data platforms at the frontier, taught to working professionals who are already strong engineers. Synthesized from *Advanced Data Engineering Learning Curriculum*, validated against current public roadmaps (DataTalksClub DE Zoomcamp, the Data Engineering Cookbook) and extended with the modern and emerging stack.

**Design goal:** a treatment of *every* topic in this syllabus, to the depth its line and labs imply, is a complete education in the field. This file is a topic index, not prose: every topic is something to learn, build, break and measure.

## Structure: Milestones → Chapters → Topics

- **Milestones** — a coherent area of mastery (*Foundations*, *Storage*, *Compute*, …), taken in order.
- **Chapters** — a major subject inside a milestone (*Database Internals*, *Spark*, …). A chapter may group its topics under numbered sections (§N.M).
- **Topics** — the individual learnable, testable units: each bullet is one topic, and each topic becomes one interactive reel on the site. Topics marked *(refresher)* are basics an expert should already know; they become short refresher pages rather than full reels.

**Every milestone closes with "Systems in Production"**: the real systems, grounded in the original papers and post-mortems, that embody the milestone's ideas at scale, with their internals and the trade-offs their builders accepted. They are the proof that the theory survives contact with production.

The eight milestones:
1. **Foundations** — CS fundamentals, SQL and query execution, data modeling, Python for data systems
2. **Storage** — database internals, file formats, the lakehouse
3. **Compute** — batch and distributed processing
4. **Movement** — ingestion, CDC, streaming
5. **Platform** — cloud, orchestration, containers, operations, governance
6. **Theory & Design** — distributed-systems theory and data-system design
7. **Frontier** — industrial and time-series data, the modern and AI data stack
8. **Capstones & Practice** — integrative capstone projects and working with stakeholders

Two related domains go deeper where this one stops: **Rust Systems Engineering** ([rust-systems-engineering.md](rust-systems-engineering.md)) builds the storage engines, runtimes and replicated logs from scratch, and **Data Structures & Algorithms** ([data-structures-and-algorithms.md](data-structures-and-algorithms.md)) covers the structures and algorithms these systems are made of.

## How to use this syllabus

- **Build, break, measure.** Every major area has a lab. A system isn't learned until you have built a toy version, injected failures and measured its behaviour.
- **Depth over coverage.** If time is short, cut breadth before cutting hands-on depth; Appendix B lists specialization tracks.
- **Progression.** Work the milestones in order; within a chapter, topics are ordered so each builds on the ones before it.
- **Self-assessment.** A chapter is done when you can answer its questions (Appendix A) and defend a design (Ch.15) under time pressure.

## Canonical references (mapped to the chapters they inform; the syllabus stands alone, these are the primary sources it distills)

- *Designing Data-Intensive Applications*, 2nd ed. (Kleppmann & Riccomini, 2026) — Ch.5, Ch.9, Ch.14, Ch.15
- *Database Internals* (Petrov) — Ch.5, Ch.6
- *The Data Warehouse Toolkit*, 3rd ed. (Kimball & Ross) — Ch.3
- *Fundamentals of Data Engineering* (Reis & Housley) — Ch.3, Ch.7, Ch.13
- *Streaming Systems* (Akidau, Chernyak & Lax) — Ch.9
- *Spark: The Definitive Guide* / *High Performance Spark* — Ch.7
- The Raft paper, the Kafka design docs, the Dynamo paper, the Google Spanner and F1 papers — Ch.14 and the Systems in Production sections

---

# MILESTONE 1 — Foundations: SQL, Modeling & Programming
The ground floor every data engineer stands on: the computer-science substrate, the query language you will write every day, the way data is modeled for analytics, and the programming craft to move it reliably. Nothing above this milestone is safe until this is solid.

## Chapter 1 — Prerequisites and Computer-Science Foundations
Treat Chapter 1 as a gate: patch any gap here before Chapter 2. These are assumed but a self-contained education must name them.

### 1.1 Programming and tooling baseline (patch gaps only)
- Python: syntax, functions/classes, comprehensions, context managers, decorators, typing basics
- Git: branching, rebase vs merge, bisect, resolving conflicts, PR workflow
- Linux/shell: file system, permissions, pipes/redirection, process model, `ps`/`top`/`htop`, `grep`/`awk`/`sed`, cron, ssh
- Software-engineering workflow: code review, unit testing, CI basics, semantic versioning, dependency management

### 1.2 Data structures and algorithms that actually matter for data engineering
- Hash tables (and why hash joins/aggregations exist), collision strategies, load factor
- Sorting: comparison sorts, and **external merge sort** (the basis of large joins/aggregations that spill to disk)
- Trees: binary search trees, B-trees/B+-trees, LSM-trees (forward reference to Ch.5)
- Heaps/priority queues (top-N, k-way merge during compaction/shuffle)
- Graphs: BFS/DFS, topological sort (DAG scheduling), shortest path, connected components
- Big-O in the context of I/O and network cost, not just CPU — the dominant cost in data systems
- Streaming/online algorithms (forward reference to Ch.5.6 probabilistic structures)

### 1.3 Computer architecture and OS fundamentals for data systems
- Memory hierarchy: registers → L1/L2/L3 cache → RAM → SSD → HDD → network/object store; latency numbers every engineer should know
- Cache lines, locality, why columnar + vectorized execution wins
- Processes vs threads, context switches, the cost of synchronization
- Virtual memory, paging, page cache (deep version in Ch.25-C)
- Disk: sequential vs random I/O, block size, SSD write amplification, durability (fsync)
- Numeric representation and its data bugs: integer overflow/width, IEEE-754 floating-point rounding (why float SUM is non-associative and order-dependent across a shuffle), and fixed-point/DECIMAL for money and other exact values — "never store currency as a float"

### 1.4 Networking fundamentals for distributed data
- The OSI/TCP-IP model to the depth a data engineer needs; what each layer costs
- TCP vs UDP, connection setup, flow control, congestion, head-of-line blocking
- DNS, load balancing, TLS handshake basics (deep version in Ch.25-C)
- Bandwidth vs latency vs throughput; why moving compute to data beats moving data to compute
- Serialization on the wire and its cost (forward reference to Ch.9)

## Chapter 2 — Advanced SQL and Query Execution
### 2.1 Relational theory and advanced query constructs (foundation to patch, then master)
- Relational algebra behind SQL (selection, projection, join, aggregation, set ops) — know which algebraic form the optimizer rewrites to
- NULL semantics, three-valued logic, and the bugs they cause (NOT IN with NULLs, aggregate NULL handling)
- Set operations: UNION/UNION ALL, INTERSECT, EXCEPT and their performance
- Recursive CTEs: hierarchy traversal, graph reachability, bill-of-materials, cycle detection
- Grouping sets, ROLLUP, CUBE for multi-level aggregation in one pass
- PIVOT/UNPIVOT and conditional aggregation
- LATERAL / CROSS APPLY joins (correlated subquery in the FROM clause)
- Arrays, structs/records, maps, and JSON handling (nested data in SQL engines)
- User-defined functions (scalar/table/aggregate) and their optimizer-opacity cost
- MERGE / UPSERT semantics and concurrency implications

### 2.2 Window-function mastery
- Window frames: ROWS vs RANGE vs GROUPS; frame boundaries and peer groups
- Nested windows via staged CTEs
- Ranking, sessionization, gaps-and-islands, change detection
- Running aggregates, moving statistics, percentile functions, distribution analysis
- Top-N per group with ties; deterministic deduplication
- QUALIFY to filter on a window-function result without a wrapping subquery (Snowflake/BigQuery/DuckDB/Databricks; not in the ISO standard) — the idiomatic top-N-per-group and dedup form
- Temporal joins, point-in-time joins, as-of joins
- Anti-joins, semi-joins, existence semantics

### 2.3 Query optimizer and execution plans
- Logical vs physical query plans
- Cost-based optimization, cardinality estimation
- Hash join vs merge join vs nested-loop join selection
- Hash aggregation vs sort aggregation
- Predicate pushdown, projection pruning, join reordering
- CTE materialization vs inlining
- Statistics, histograms, stale statistics
- Spills to disk, memory pressure
- Reading EXPLAIN / EXPLAIN ANALYZE across engines (Postgres, Spark, Trino, Snowflake)
- Join-order explosion and why optimizers use heuristics/genetic search past ~10 joins

### 2.4 Advanced SQL performance
- Composite indexes and column order
- Covering indexes / index-only scans
- Partial and expression indexes
- Partition pruning, partition-key selection
- BRIN vs B-tree for very large ordered data
- GIN / GiST (inverted and generalized) indexes for containment and membership predicates on JSONB, arrays, full-text, and geospatial data — where B-tree cannot help (cross-ref Ch.5.5 search stores)
- Materialized views and precomputation
- Concurrency vs analytical workload interference
- Vectorized / columnar query execution (SIMD-based engines: DuckDB, ClickHouse, Velox)

## Chapter 3 — Data Modeling and Analytical Architecture
### 3.1 Modeling foundations (name them, then go deep)
- Conceptual vs logical vs physical data models and how each maps to the next
- OLTP vs OLAP: workload shape, normalization pressure, storage layout, why one schema rarely serves both
- Normalization 1NF→BCNF and deliberate denormalization; functional dependencies; when to normalize vs denormalize for analytics
- Relationship cardinality (1:1, 1:N, M:N) and how it drives physical design
- Primary/foreign/surrogate/natural keys; composite keys; key stability over time
- Entity-relationship modeling and ER diagrams as a communication artifact
- Data vault 2.0 (hubs/links/satellites) as an alternative to Kimball for auditable, source-aligned warehouses — when it earns its complexity
- Normalized (3NF/Inmon) vs dimensional (Kimball) warehouse philosophies and when each wins

### 3.2 Dimensional modeling at scale
- Grain-first modeling
- Factless facts, accumulating snapshots, periodic snapshots
- Conformed dimensions, degenerate dimensions, role-playing dimensions
- Junk dimensions (collapsing low-cardinality flags/indicators into one dimension), mini-dimensions for rapidly-changing attributes, and outrigger dimensions
- Bridge tables, many-to-many relationships
- Surrogate keys, late-arriving facts
- SCD Type 1/2/3 and historical correctness
- SCD Type 4 (history-table / mini-dimension split) and Type 6 (hybrid 1+2+3); choosing a type by query pattern and attribute churn rate
- Bitemporal modeling: separating valid time (when a fact was true in the world) from transaction/system time (when the warehouse recorded it); system-versioned temporal tables; correct as-of and audit "what did we know, and when" queries, and late-arriving backdated corrections

### 3.3 Warehouse vs lake vs lakehouse
- Warehouse workloads, columnar execution
- Data lakes and object-storage economics
- Lakehouse architecture
- Medallion patterns and their limitations
- Serving layers and semantic models
- Workload isolation, compute/storage separation
- Data contracts and domain ownership
- Lambda vs Kappa architecture: Lambda (parallel batch + speed layers merged at a serving layer, Marz) vs Kappa (stream-only, reprocess by replaying the log, Kreps); the reprocessing/serving-merge trade-off; why the industry drifted toward Kappa/unified engines (one codebase, no dual-logic drift), and when a dedicated batch correction layer still earns its complexity

### 3.4 Modern modeling and governance layer
- Data mesh: domain-oriented data products, federated computational governance, self-serve data platform
- Data contracts enforced in CI (schema + SLA + semantics), not just documentation
- Semantic/metrics layer: dbt Semantic Layer, Cube, LookML — single definition of a metric reused everywhere
- Transformation-as-code with dbt: models, tests, macros, exposures, lineage graph, incremental models, snapshots
- Transformation-layer evolution (2025+): the **dbt Fusion** engine (Rust-based, faster parse/compile, native column-level lineage), **dbt Mesh** / cross-project references for multi-team repos, and **SQLMesh** as an alternative with virtual data environments and automatic column-level change analysis

## Chapter 4 — Advanced Python for Data Systems
### 4.1 Memory and high-throughput processing
- Object overhead and memory layout (conceptual)
- Iterators/generators for streaming processing
- Zero-copy and buffer-oriented thinking
- Serialization costs: JSON vs Avro/Protobuf/Parquet/Arrow
- Multiprocessing, threads, GIL implications, process boundaries
- Async I/O for network-heavy workloads
- Profiling CPU, memory, allocation behavior

### 4.2 Production data libraries and testing
- PyArrow and columnar memory model
- Pandas vs Polars vs Spark vs Dask vs Ray vs DuckDB: workload boundaries (single-node columnar, out-of-core, distributed DataFrame, distributed Python/ML) and when each wins
- Database connection pooling
- Retries, timeouts, exponential backoff, idempotent clients
- Contract tests, property-based testing, integration tests
- Schema validation and data contracts (Pydantic, Pandera, Great Expectations, Soda)

## Systems in Production — Milestone 1: query planners, executors, and MVCC you can read
The foundations become real in the engine that turns your SQL into execution. Read one open-source planner end to end; it demystifies every chapter above.

### PostgreSQL — the planner/executor you can actually read
- Parse → rewrite → plan/optimize → execute. The planner is **cost-based**: it enumerates join orders and access paths and estimates each with statistics in `pg_statistic` (per-column null fraction, `n_distinct`, most-common-values list, and a histogram), gathered by `ANALYZE`. `EXPLAIN (ANALYZE, BUFFERS)` shows estimated-vs-actual rows — the gap is where plans go wrong, and reading it is the Ch.2.3 skill made concrete.
- Executor nodes compose a tree pulled tuple-at-a-time (**Volcano/iterator model**): `Seq Scan`, `Index Scan`/`Index Only Scan`, `Bitmap Heap Scan`, `Hash Join`, `Merge Join`, `Nested Loop`, `HashAggregate`, and `Sort` — which spills to disk via **external merge sort** when `work_mem` is exceeded (the Ch.1.2 topic made physical).
- **MVCC in the heap:** every row carries `xmin`/`xmax`; a tuple is visible to a snapshot if its inserting transaction committed before the snapshot and its deleting transaction did not. Updates write a *new* tuple version and leave the old one dead — which is exactly why `VACUUM` exists and why one long-running transaction blocks cleanup (previews Ch.5.1/Ch.5.2 and the from-scratch build in Ch.25-D).

### Cloud warehouse planners — the same ideas, charged by the byte
- Snowflake prunes micro-partitions using per-partition min/max metadata before reading a byte; BigQuery's Dremel executes a columnar plan across many slots; Redshift's planner picks a distribution-aware join strategy driven by DISTKEY/SORTKEY.
- In all three, the dominant cost is **bytes scanned and shuffle, not CPU** — the Ch.1.3 lesson (I/O/network over CPU) priced in dollars. Reading these plans (Ch.2.3) is the single most leveraged tuning skill in analytics engineering.

---

# MILESTONE 2 — Storage: Database Internals, Files & the Lakehouse
How bytes are actually stored, made durable, made transactional, and made queryable — from a single page on disk to a petabyte-scale table format over object storage. This is the layer that separates "uses a database" from "could build one."

## Chapter 5 — Database Internals and Distributed Storage
### 5.1 Storage engines
- Pages/blocks, tuples, heap storage, row layout
- Slotted pages, record headers, checksums
- Buffer pools and cache locality
- WAL and durability; fsync/fdatasync; write barriers
- B-tree structure, page splits, index maintenance
- MVCC and visibility
- Vacuuming, bloat, dead tuples
- LSM-tree concepts: memtables, SSTables, compaction, write amplification
- Columnar storage internals: column chunks, vectors, dictionary/RLE/delta encoding, compression trade-offs

### 5.2 Transactions and concurrency
- ACID properties
- Isolation levels: read uncommitted, read committed, repeatable read, snapshot isolation, serializable
- Anomalies: lost updates, write skew, phantom reads, dirty reads
- Non-repeatable reads; **read skew** (reading two related items left mutually inconsistent because a concurrent transaction committed between the reads) — distinct from the **read-only transaction anomaly** (a read-only transaction observing a state no serial order permits, which can occur even under snapshot isolation); the anomaly↔isolation-level mapping — which level permits which anomaly, and why **Serializable Snapshot Isolation (SSI)** (what Postgres implements) and strict two-phase locking reach serializability by different routes (the classic correctness question)
- Locking, deadlocks, lock escalation
- Optimistic vs pessimistic concurrency
- Distributed transaction trade-offs (2PC, sagas)

### 5.3 Replication and distributed databases
- Primary/replica architectures
- Physical vs logical replication
- Replication lag, read-after-write consistency
- Quorum concepts (read/write quorums, Dynamo-style)
- Leader/follower vs leaderless designs
- CAP theorem as a practical trade-off
- PACELC: the refinement of CAP — during a **P**artition you trade **A**vailability against **C**onsistency (PA/PC), but **E**lse — no partition, the normal case — you still trade **L**atency against **C**onsistency (EL/EC); why "strongly consistent" stores are slower on the happy path, with real systems classified (e.g., Dynamo/Cassandra PA/EL, Spanner PC/EC)
- Consistency models: strong, eventual, causal, session guarantees
- Partition tolerance and failure domains
- **Data sharding / horizontal partitioning (interview-critical):** splitting one logical dataset across nodes so each shard holds a subset of rows; **shard-key choice** (user ID, geography, time range) and why it dominates performance; **range vs hash sharding** trade-offs; **consistent hashing** to minimize re-mapping when nodes join/leave (the Dynamo technique); request **routing** to the owning shard; **resharding/rebalancing** and the **hot-shard / celebrity-key** problem; sharding vs partitioning vs replication as distinct axes (cross-ref Ch.5.5 hot partitions and the Dynamo / Uber-Schemaless case studies)
- **Consensus and convergent-state internals (systems-level, detailed in Ch.25-E):** Raft leader election/term/log replication/commitment/conflict repair/snapshotting; Kafka-style partitioned-log ordering and delivery-semantics nuance; CRDTs and idempotency keys as the two alternative convergence strategies, and when neither is appropriate

### 5.4 Build-it-yourself storage engine track (differentiator)
- Four-milestone build progression (see Ch.25-G Capstone B): **V1** WAL + memtable (durability first) → **V2** SSTables (flush, Bloom filters, sparse index) → **V3** compaction (atomic manifest switch, crash-safe merge) → **V4** MVCC (snapshot visibility, version GC)
- Implement a B-tree alternative with page splits and crash-safe range scans (Ch.25-D)
- Implement a Raft-backed replicated state machine: deterministic state machine first, persist term/vote/log before acknowledging, then chaos-test the transport (see Ch.25-G Capstone C)
- Why this matters: this is what separates "uses Postgres" from "could build the next Postgres/FoundationDB/TiKV" — the highest-paid infra data engineers can reason at this layer

### 5.5 NoSQL, serving stores, and caching (the read side of data systems)
- NoSQL families and when each fits: key-value (DynamoDB, Redis), wide-column (Cassandra, HBase, Bigtable), document (MongoDB), search (Elasticsearch/OpenSearch)
- Access-pattern-first modeling for NoSQL (design the queries, then the table) — the opposite of relational normalization
- Partition/hash keys, hot partitions, and even key distribution
- Caching layers: cache-aside, read-through, write-through, write-behind; TTL and eviction (LRU/LFU); cache stampede/thundering herd and mitigation
- Redis as cache, as a data structure server, and its persistence/limits
- Consistency between cache and system of record; invalidation strategies
- Serving layer for analytics: pre-aggregation, materialized serving tables, low-latency OLAP (Druid/Pinot/ClickHouse — cross-ref Ch.9/Ch.6)
- Message queues vs event logs: RabbitMQ/SQS (queue, per-message ack, no replay) vs Kafka (log, offsets, replay) — pick by replay/ordering/fan-out needs

### 5.6 Probabilistic and streaming data structures (scale-critical, frequently missing)
- **Bloom filters / cuckoo filters:** approximate membership, no false negatives, tunable false-positive rate; used in LSM reads, join pruning, cache layers
- **HyperLogLog:** approximate distinct-count (cardinality) in fixed memory; mergeable across partitions — what engines' **approximate** distinct-count functions (`APPROX_COUNT_DISTINCT`, Spark `approx_count_distinct`) are built on; an *exact* `COUNT(DISTINCT)` does not use it
- **Count-Min Sketch:** approximate frequency/heavy-hitters in sublinear space
- **t-digest / DDSketch:** approximate quantiles (p50/p95/p99) over streams without storing all data
- **Reservoir sampling:** uniform sample from an unbounded stream
- **MinHash / SimHash / LSH:** approximate similarity and near-duplicate detection at scale
- Accuracy vs memory trade-offs; mergeability (why these fit map-reduce/partitioned aggregation); when exactness is required instead
- *Lab*: implement HyperLogLog and Count-Min Sketch; measure error vs memory against exact counts on a skewed stream; merge across simulated partitions

## Chapter 6 — File Formats, Lakehouse and Table Formats
### 6.1 Serialization and file formats (the physical substrate)
- Text formats: CSV (quoting/escaping/encoding pitfalls, no schema), JSON/JSONL (flexible, verbose, no columnar pushdown), XML
- Row-oriented binary: Avro (schema evolution rules, schema registry, splittable), Protobuf
- Columnar on disk: Parquet, ORC (stripes, row groups, column statistics, predicate pushdown)
- In-memory columnar: Apache Arrow (zero-copy, language-interop), Arrow IPC/Feather
- Compression codecs: Snappy, LZ4, Zstd, Gzip — ratio vs CPU vs splittability trade-offs
- Encoding schemes: dictionary, RLE, delta, bit-packing — and when each is chosen
- Row vs columnar decision: write-heavy/point-lookup vs scan-heavy/analytical
- Schema evolution across formats: add/drop/rename/reorder columns, type widening, default/nullability rules
- The small-file problem and compaction; optimal file/row-group sizing

### 6.2 Parquet and columnar storage
- Row vs column storage
- Column chunks and pages
- Nested-data encoding: repetition and definition levels (the Dremel record-shredding model) for optional/repeated fields — how Parquet stores arrays/structs/maps columnar
- Compression and encoding
- Predicate pushdown, projection pruning
- Statistics and data skipping
- Row-group vs page-level statistics; optional column **bloom filters** (sidecar) for high-cardinality equality predicates where min/max stats cannot prune
- File size and small-file trade-offs

### 6.3 Transactional table formats: Delta Lake / Iceberg / Hudi
**Shared concepts (the "mutable table on an immutable object store" problem all three solve):**
- Metadata/log architecture over immutable data files on object storage
- ACID-style commits, snapshot isolation, optimistic concurrency control (conflict detection on commit, then retry); single-writer vs safe concurrent multi-writer
- Time travel (query/rollback to a prior snapshot) and snapshot expiration
- Schema enforcement and evolution (add/drop/rename/reorder, type widening, nullability)
- Compaction/clustering and the small-file problem; file/row-group sizing
- Partition evolution without rewriting history
- **Copy-on-write (COW) vs merge-on-read (MOR):** COW rewrites whole data files on update (read-fast, write-amplified); MOR writes delete/change files merged at read time (write-fast, read-amplified) — the single most important table-format design trade-off; know which workload picks which, and how background compaction converts MOR toward COW-like read cost

**Apache Iceberg (format-specific internals — "table-format specialist" depth):**
- The metadata tree: `metadata.json` (schema, partition specs, sort orders, snapshot list) → **manifest list** → **manifest files** → data files; every commit writes a new metadata.json and atomically swaps the catalog pointer
- **Hidden partitioning** and partition transforms (`identity`, `bucket[N]`, `truncate[W]`, `year/month/day/hour`) — partitioning derived from column values, so queries need no partition-column predicates and the partition layout can evolve
- **Position deletes vs equality deletes** (the two MOR delete-file encodings) and when each is produced
- Column-level stats/metrics for data skipping, **Puffin files** (sketch/stats sidecars), **deletion vectors** (v3)
- Catalog types and the **Iceberg REST catalog** spec; Hive Metastore, AWS Glue, Nessie (git-like branching/tagging), Polaris; catalog migration and multi-engine access
- Table maintenance: `expire_snapshots`, `rewrite_data_files` (compaction), `rewrite_manifests`, `remove_orphan_files`

**Delta Lake (format-specific internals):**
- The `_delta_log` transaction log: ordered JSON commits + periodic Parquet **checkpoints**; `_last_checkpoint`; protocol reader/writer versions and table features
- **Deletion vectors** (Delta's MOR), **Change Data Feed** (row-level change capture for downstream CDC), `MERGE`/`UPDATE`/`DELETE` semantics
- Maintenance: `OPTIMIZE` + **Z-ORDER** multi-dimensional clustering, **liquid clustering** (clustering without rigid partitions), `VACUUM` (tombstone retention vs the time-travel window)

**Apache Hudi (format-specific internals):**
- The **timeline** of instants (commits/compaction/cleaning), **COW vs MOR table types**, file groups/file slices, base + log files
- Record-level indexes (Bloom, simple, HBase, record-index) enabling fast upserts; the upsert/incremental-pull model Hudi pioneered (cross-ref the Uber case study in Milestone 2)
- Compaction, clustering, and cleaning services; inline vs async scheduling

**Choosing between them:** engine ecosystem support (Spark/Flink/Trino/Snowflake/BigQuery), catalog strategy (Unity Catalog, Nessie, Hive Metastore, AWS Glue, Polaris, Iceberg REST), upsert-heavy vs append-heavy workload, single- vs concurrent-writer needs, managed (Databricks/Tabular) vs open — state the trade-off, don't cargo-cult.

**Format interoperability and streaming formats (2024+):** **Delta UniForm** (exposes a Delta table through Iceberg/Hudi metadata) and **Apache XTable** (incubating; cross-translates Hudi/Delta/Iceberg metadata) are shifting the question from "which format" toward "read any format"; **Apache Paimon** is a streaming-first, LSM-backed lakehouse table format (Flink-native) for high-update CDC/streaming sinks. The **2024–2025** "catalog wars" (Databricks–Tabular, Snowflake Polaris, Unity Catalog going open source — all June 2024) are consolidating interop on the Iceberg REST catalog.

### 6.4 Modern query engines over the lakehouse
- Trino (the actively-developed successor; PrestoDB has far less momentum in new OSS deployments, though it remains active under the Presto Foundation): federated query execution, connector model, cost-based optimization at scale
- ClickHouse: MergeTree engine, sparse indexes, materialized views for real-time analytics
- DuckDB: embedded OLAP, local-first analytics, Arrow interop; **MotherDuck** (serverless/hybrid DuckDB) and the "**big data is dead**" / single-node renaissance — most analytical workloads now fit on one large node, so reach for a distributed engine only when they genuinely don't
- Apache DataFusion / Ballista: Rust-native query engine internals (ties back to Ch.25)
- Apache Arrow as the universal in-memory columnar interchange format; Arrow Flight / Flight SQL for zero-copy data transport between systems
- **Composable data systems (emerging thesis):** reusable engine building blocks — Arrow (memory), **Substrait** (engine-agnostic query-plan IR), **Velox** (unified C++ execution), DataFusion — so engines stop re-implementing the same layers; know Substrait as the "interchange format for query plans"

### 6.5 Cloud data warehouse internals (the engines you will actually be paid to tune)
- **Snowflake:** separation of storage/compute, virtual warehouses, micro-partitions and pruning, clustering keys, result/metadata caching, time travel + fail-safe, data sharing, credit/cost model
- **BigQuery:** Dremel/column execution, slots and reservations, storage billing vs on-demand, partitioning + clustering, BI Engine, materialized views, streaming inserts vs load jobs
- **Redshift:** leader/compute nodes, distribution styles (KEY/EVEN/ALL), sort keys (compound vs interleaved), vacuum/analyze, Redshift Spectrum over S3, RA3 managed storage, workload management (WLM/queues)
- **Cross-cutting:** cost-based query tuning, spilling, concurrency scaling, workload isolation, when a warehouse beats a lakehouse engine and vice versa
- *Lab*: load the same dataset into two of {Snowflake, BigQuery, Redshift, DuckDB}; tune partitioning/clustering/distribution; compare query latency, bytes scanned, and cost for identical analytical queries

## Systems in Production — Milestone 2: storage at planetary scale
Every system below was built because an off-the-shelf store hit a wall at a specific scale or workload. The pattern repeats: **identify the exact limitation → state the trade-off accepted → build the minimum system that resolves it.** Read the primary papers, not retellings.

### Amazon — availability-first key-value and the "log is the database" insight
- **Dynamo (2007, DeCandia et al., SOSP) — the key-value store behind the shopping cart.** Forcing problem: Amazon's shopping-cart and session services needed primary-key-only access with "always-on" availability — any RDBMS replication at the time forced a consistency-over-availability choice during partitions, and even "the slightest outage has significant financial consequences." Core decision: give up strict consistency (the "C" in ACID) for availability, using **consistent hashing** for partitioning, **vector clocks + object versioning** for conflict detection, **quorum-based (R/W) replication**, **gossip-based failure detection**, and **anti-entropy via Merkle trees** for background replica repair. Trade-off accepted: the client (not the store) resolves write conflicts — a genuinely new application-facing API contract. Scale at launch: internal-only, hundreds of nodes per service instance, serving "tens of millions" of checkout requests and "well over 3 million checkouts in a single day" during peak. Influence: directly fathered **DynamoDB**, popularized **eventual consistency** as a legitimate production trade-off, and seeded the entire Dynamo-style NoSQL family (Cassandra, Voldemort, Riak).
- **S3 — the eventually-consistent-to-strongly-consistent journey.** Forcing problem: object storage at planet scale needs 11-nines durability without a single point of failure. Original design: eventually consistent for **overwrites, deletes, and listing** (and, in the legacy US-Standard region only, even for brand-new objects — elsewhere new objects were read-after-write from the start) — a well-known early gotcha for data engineers building pipelines that wrote then immediately re-read. Later evolution (2020): **strong read-after-write consistency** became the default — a rare, publicly documented case of a hyperscale system *removing* an eventual-consistency trade-off once engineering could afford it. Lesson for data engineers: your pipeline's "eventually consistent" assumption from five years ago may silently be stale; verify, don't assume.
- **Aurora — the log is the database.** Forcing problem: traditional MySQL/PostgreSQL replication ships whole data pages across the network for every write, dominating I/O at cloud scale. Core decision: ship **only the redo log** to a separate, decoupled storage layer that replicates and reconstructs pages on demand — "the log is the database." Trade-off: a much more complex storage layer in exchange for up to ~5x the write throughput of stock MySQL on equivalent hardware. Lesson: separating compute from storage, and shrinking what crosses the network, is the recurring theme across every system in this syllabus.

### Google — the sparse map that seeded every LSM engine
- **Bigtable (2006, Chang et al., OSDI) — the sparse map behind 60+ Google products.** Forcing problem: Google needed one storage system spanning wildly different workloads (web indexing, Google Earth imagery, Google Finance time series) at "petabytes of data across thousands of commodity servers," which no existing parallel/main-memory database handled. Core decision: a sparse, distributed, persistent **multi-dimensional sorted map**: `(row:string, column:string, time:int64) → string`. Row ranges split into **tablets** (the unit of load-balancing); clients control locality by designing row keys (e.g., reversed-hostname URLs so same-domain pages sort adjacently). Built on **GFS** for storage and the **SSTable** format for immutable, sorted on-disk files — this SSTable concept is the direct ancestor of every LSM-tree engine covered in Ch.5/Ch.25-D (RocksDB, Cassandra, HBase, LevelDB all borrow it by name). Trade-off: no general cross-row transactions, no full relational model — single-row atomicity only. Influence: HBase is a near-literal open-source reimplementation; the SSTable/tablet vocabulary is now industry-standard.

### Meta — the social-graph cache
- **TAO — the social graph cache.** Forcing problem: Facebook's social graph (friends, likes, comments) is read orders of magnitude more than it's written, and MySQL alone couldn't serve the read fan-out. Core decision: a graph-aware caching layer (objects + associations) sitting in front of sharded MySQL, with **eventual consistency across regions** accepted explicitly because "slightly stale friend count" is an acceptable user-facing trade-off that "lost your post" is not. Lesson: TAO is the canonical case study for Ch.5.5 (caching) — the trade-off decision (what can be stale, by how much, for which fields) is the whole design.

### Uber & Netflix — "mutable table on an immutable object store"
- **Hudi (2016+, originally "Hoodie") — incremental processing on a data lake.** Forcing problem: Uber's Hadoop-based lake only supported full-table rewrites or append-only ingestion; upsert-heavy operational data (trip records that get corrected after the fact) forced either unacceptable latency (daily full rewrites of multi-TB tables) or unbounded small-file growth. Core decision: bring **upsert, incremental pull, and record-level versioning** to the data lake — the direct ancestor of the Ch.6 table-format trio (Hudi/Delta/Iceberg) and the reason "lakehouse" is now a category at all. Trade-off: added write-path complexity (compaction, indexing within files) in exchange for making the lake behave like a mutable table.
- **Netflix's data platform and Iceberg co-authorship.** Forcing problem: Netflix's S3-based lake hit the exact Hive-metastore scaling and consistency problems (partition-listing cost, no atomic multi-partition commits, no safe concurrent writers) that motivated Hudi at Uber and Delta at Databricks — Netflix's answer became a founding contribution to **Apache Iceberg**. Lesson: three different companies (Uber, Databricks, Netflix) hit the *same* "mutable table on an immutable object store" wall (Ch.6.3) within a few years of each other and produced three converging-but-distinct answers — a strong signal that the underlying problem was genuine and inevitable, not idiosyncratic.

---

# MILESTONE 3 — Compute: Batch & Distributed Processing
Turning stored data into derived data at scale. The distributed execution model — how work is partitioned, shuffled, and recovered from failure — is the heart of this milestone, taught through Spark but rooted in MapReduce.

## Chapter 7 — Apache Spark / PySpark — Internals and Optimization
### 7.1 Spark execution model
- Driver, executors, jobs, stages, tasks
- DAG construction, stage boundaries
- Narrow vs wide transformations
- Shuffle files, network transfer
- Task scheduling, parallelism
- Logical vs physical DataFrame plans
- Catalyst optimizer, Tungsten / whole-stage code generation
- Python UDF cost: the row-at-a-time Python↔JVM serialization boundary and Catalyst-opacity (cross-ref Ch.2.1); Pandas/Arrow-vectorized UDFs and `mapInArrow` as the fix; prefer built-in/SQL expressions over Python UDFs
- Spark Connect (3.4+): the decoupled client-server architecture — a thin client builds the unresolved logical plan and ships it to a remote driver that executes it; enables non-JVM/remote clients, client-version decoupling, and embedding Spark in applications
- Spark 4.0 (2025) as the current major line: ANSI mode on by default, Spark Connect maturity, Python/pandas-API and streaming-state improvements — track version-specific behavior changes against 3.x

### 7.2 Partitioning, joins and skew
- Partition count/size trade-offs
- Repartition vs coalesce
- Hash partitioning, partition pruning
- Bucketing: pre-shuffling tables on a join/aggregation key at write time so later sort-merge joins and aggregations skip the shuffle (and the bucket-count-must-match / stale-bucketing pitfalls)
- Broadcast joins
- Sort-merge joins, shuffle hash joins
- Data skew detection and salting
- Adaptive Query Execution (AQE)
- Dynamic partition pruning (DPP): prune fact-table partitions at runtime from the dimension-side filter in a star-schema join
- Small-file problem, output compaction

### 7.3 Spark memory and failure behavior
- Executor memory, memory overhead
- Spilling, shuffle memory
- Persistence levels (cache/checkpoint)
- Garbage collection symptoms
- Executor loss, task retry, speculative execution
- Checkpointing vs caching

### 7.4 Structured Streaming
- Micro-batch execution
- Event time vs processing time, watermarks
- Stateful aggregations, output modes
- Checkpointing, exactly-once boundaries
- Late data and state cleanup
- State store backends: the **RocksDB state store** as the modern default for large stateful streaming (off-heap, spills to disk, incremental checkpointing) vs the legacy in-memory HDFS-backed store that OOMs on large aggregation/join state

## Systems in Production — Milestone 3: batch at thousands of machines
### Google — MapReduce, the model everything descends from
- **MapReduce (2004, Dean & Ghemawat, OSDI) — batch processing at thousands of machines.** Forcing problem: Google was writing hundreds of bespoke distributed programs (inverted index, PageRank-style link graphs, log analysis) and re-solving parallelization, fault tolerance, and data distribution every time. Core decision: a tiny functional interface — `map(k1,v1)→list(k2,v2)` and `reduce(k2,list(v2))→list(v2)` — with the runtime handling partitioning, scheduling, straggler/failure re-execution, and inter-machine shuffle. Scale at publication: "many terabytes of data on thousands of machines," over 1,000 MapReduce jobs/day company-wide. Trade-off: programmers give up control over execution order and machine placement entirely. Influence: directly inspired **Hadoop** (open-source reimplementation at Yahoo), and indirectly every batch engine since (Spark is explicitly "MapReduce, but keep intermediate data in memory instead of re-reading from disk between stages").

### Spark — RDDs, Catalyst, and Tungsten
- **The RDD insight (Zaharia et al., NSDI 2012):** a resilient distributed dataset is an immutable, partitioned collection whose *lineage* (the sequence of transformations that built it) is remembered — so a lost partition is recomputed from its parents rather than restored from a replicated checkpoint. This is why Spark's fault tolerance is cheap and why the Ch.7.1 DAG/stage model exists: stage boundaries fall exactly where a wide transformation (shuffle) breaks lineage into pipelineable segments.
- **Catalyst** rewrites the logical plan (predicate pushdown, projection pruning, join reordering — the Ch.2.3 optimizer ideas, now distributed) before choosing physical operators; **Tungsten** then generates whole-stage JVM bytecode and uses cache-friendly, off-heap binary layouts so execution approaches hand-written code. The Ch.1.3 memory-hierarchy and Ch.6.1 columnar-encoding lessons are what make Tungsten fast.

### Meta — SQL on top of MapReduce
- **Hive (2009, Thusoo et al., VLDB) — SQL on top of MapReduce.** Forcing problem: Facebook's data (initially 15 TB/day → hundreds of TB/day by publication) was accessible only to engineers who could write raw MapReduce jobs in Java/Python, while most analysts only knew SQL. Core decision: a SQL-like language (**HiveQL**) compiling down to MapReduce jobs, with a **metastore** tracking table/partition/schema metadata separately from the data itself — the metastore concept is the direct ancestor of every catalog in Ch.6 (Hive Metastore, Glue Catalog, Unity Catalog all descend from this exact idea). Trade-off: query latency measured in minutes (full MapReduce job startup overhead), acceptable for the batch/analyst workload it targeted, unacceptable for anything interactive — the gap this trade-off left open is precisely why Presto/Trino were later built at Facebook.

---

# MILESTONE 4 — Movement: Ingestion, CDC & Streaming
Getting data from where it is produced to where it is processed — reliably, in order, exactly once in effect, and replayably. Batch ingestion, log-based change data capture, and real-time streaming are three faces of the same problem.

## Chapter 8 — Data Ingestion, Integration and Change Data Capture
### 8.1 Ingestion patterns and the extract layer
- Push vs pull ingestion; batch vs micro-batch vs streaming ingestion
- Full load vs incremental load; high-watermark / cursor-based extraction; late-arriving corrections
- API ingestion: pagination, rate limiting, retries/backoff, auth (OAuth, API keys), idempotency keys
- Webhook/event ingestion: ordering, deduplication, replay from a durable buffer
- File ingestion: landing zones, atomic rename/commit, poison-file quarantine, schema-on-read vs schema-on-write
- Database extraction: query-based (JDBC), bulk export/COPY, read-replica offloading to protect production
- Idempotent and resumable extraction; checkpointing offsets/watermarks durably
- Managed/declarative ingestion tools: Fivetran, Airbyte, Meltano, dlt, Kafka Connect — build-vs-buy trade-offs and connector-maintenance cost
- Raw/bronze layer design: immutability, append-only landing, replayability

### 8.2 CDC architecture
- Polling vs log-based CDC
- Database WAL/binlog internals
- Replication-slot / WAL (binlog) retention management: a stalled or slow CDC consumer prevents the source from reclaiming WAL and causes unbounded disk growth on the production database — the classic log-based-CDC production incident
- Snapshots + change streams
- Ordering and transaction boundaries
- Schema evolution
- Deletes and tombstones
- Replay and offset management
- CDC into Kafka / lakehouse / warehouse
- Debezium internals: connectors, snapshot modes, outbox pattern, single-message transforms
- Initial-snapshot-plus-stream consistency (no gap, no overlap between snapshot and log tail)

### 8.3 Data integration, entity resolution and master data
- **Entity resolution / record linkage:** deterministic (rule/key-based) vs probabilistic matching; **blocking/indexing** to avoid O(n²) comparisons; similarity measures (Jaro-Winkler, Levenshtein, cosine); **MinHash/LSH** for scalable near-duplicate and fuzzy matching (cross-ref Ch.5.6)
- **Deduplication and canonicalization:** survivorship rules, golden-record construction, merge/split handling over time
- **Master Data Management (MDM):** customer/product/plant master consistency across systems; registry vs consolidation vs centralized styles; match-merge pipelines (cross-ref the SAP/master-data note in Ch.10.5)
- **Reference data and crosswalks:** code/lookup tables, slowly-changing reference data, mapping across source systems
- **Schema matching and integration:** reconciling heterogeneous source schemas; semantic mapping; conflicting units/currencies/time zones

## Chapter 9 — Streaming Systems: Kafka, Flink, and Beyond
### 9.1 Kafka internals
- Partition leaders and replicas
- Producer batching, compression, acknowledgements
- Consumer groups and partition assignment
- Offsets, log segments
- Retention and compaction
- Replication, ISR concepts
- Ordering guarantees
- **Log internals (systems-level):** append-only log structures, partitioned logs, delivery-semantics implementation detail — build a toy Kafka-style log to internalize segment files, index files, and consumer offset tracking

### 9.2 Streaming correctness
- At-most-once, at-least-once, exactly-once semantics
- Idempotent producers, transactions
- Deduplication keys
- Dead-letter topics, retry topics, poison messages
- Replay and backfill
- Windowing and time semantics: tumbling vs sliding/hopping vs session vs global windows; triggers (when a window emits) and allowed lateness/late firing vs dropping; the watermark-vs-completeness trade-off (how long to wait for stragglers before closing a window) — cross-ref Ch.7.4
- Schema Registry and compatibility modes (backward/forward/full)

### 9.3 Beyond Kafka: the modern streaming stack
- Apache Flink: DataStream API, event-time processing, exactly-once state via checkpoints/savepoints, stateful functions, watermark strategies — the dominant streaming engine outside the Spark ecosystem, heavily asked for in EU/global enterprise roles
- **Streaming SQL and stream-processing libraries:** Flink SQL, **ksqlDB**, **Kafka Streams** (library-embedded stateful processing, KStream/KTable duality) — SQL/embedded alternatives to a full cluster engine, and when each fits
- Streaming databases: Materialize, RisingWave — incremental view maintenance over streams (SQL-native streaming)
- Apache Pulsar / Redpanda as Kafka alternatives — segment-based tiered storage, multi-tenancy
- Kafka evolution (2023+): **tiered storage** (KIP-405 — offload cold log segments to object storage) and emerging **diskless/object-store-backed** topics that cut cross-AZ cost; **Confluent Tableflow** and similar materialize Kafka topics directly as Iceberg/Delta tables (streaming → lakehouse with no separate ETL job)
- Real-time OLAP serving: Apache Druid, Pinot, ClickHouse for sub-second dashboards on streaming data

## Systems in Production — Milestone 4: the log as unifying abstraction
### LinkedIn — the commit log as a product
- **Kafka (2011, Kreps/Narkhede/Rao, NetDB) — the log as infrastructure.** Forcing problem: LinkedIn had user-activity events (logins, pageviews, clicks) *and* operational metrics flowing through separate, specialized point-to-point pipelines (Facebook's Scribe-style log aggregators on one side, traditional message queues like ActiveMQ/RabbitMQ on the other) — "orders of magnitude larger than the real data," and every new consumer meant a new integration. Core decision: treat **the commit log itself as the product** — partitioned, append-only, offset-addressed, with **consumers (not the broker) tracking their own position** — collapsing both use cases (offline batch consumption and online low-latency consumption) into one system. At publication: "processing hundreds of gigabytes of new data each day" — a number that looks almost quaint next to Kafka's current trillions-of-messages-per-day deployments. Trade-off: brokers do (almost) nothing but append and serve sequential reads — nearly all intelligence (ordering guarantees, replay, consumer-group balancing) lives in client libraries, not the server, which is why Kafka's broker is so fast and so simple relative to a traditional message queue. Influence: this is the single paper most responsible for Ch.9 and the "log as the unifying abstraction" theme repeated in Ch.25-E and Ch.14 — Jay Kreps's later essay *"The Log: What every software engineer should know about real-time data's unifying abstraction"* is the canonical plain-English follow-up and is worth reading end to end.
- **Venice / Samza — the derived-data half of the Kafka story.** Forcing problem: once Kafka centralized the log, LinkedIn still needed (a) a stream-processing framework consuming directly from Kafka partitions with the same partitioning model (Samza — process a partition on the machine that owns it, state co-located with computation) and (b) a serving store for the *output* of streaming jobs that needs online reads (Venice). Lesson: a log by itself isn't a platform — the processing layer (Samza, later superseded internally by Flink) and the serving layer (Venice) are the other two-thirds of a real streaming platform, mirrored in Ch.9.3's "beyond Kafka" coverage.

### Meta — log aggregation before Kafka standardized it
- **Scribe — log aggregation at Facebook scale.** The forcing problem Kafka solved at LinkedIn, Facebook solved earlier with Scribe: a simple, high-throughput log-collection daemon shipping data from thousands of web servers into HDFS/Hive. Lesson: nearly every "big data" company independently re-derived some version of "durable, append-only log collector" before Kafka standardized it as a reusable open-source product — recognizing this pattern is itself a system-design skill.

### Google — watermarks, and streaming before it was a category
- **MillWheel (2013, Akidau et al., VLDB) — streaming before "streaming" was a category.** Forcing problem: Google's Zeitgeist (search-trend anomaly detection) needed continuous, low-latency, exactly-once stream processing with correct handling of out-of-order events arriving from all over the world. Core decision: **low watermarks** — a per-stage, monotonically increasing signal meaning "all data up to timestamp T has been seen" — solving the "is this just slow, or truly missing?" ambiguity that every late-data design in Ch.7.4/Ch.9 faces. Combined with per-key persistent state and exactly-once delivery via idempotent, atomically-checkpointed record processing. Direct influence: MillWheel's watermark model is **the** reason the Dataflow Model (and therefore **Apache Beam**, and therefore **Flink's** and **Spark Structured Streaming's** watermark semantics in Ch.7.4/Ch.9.3) look the way they do — this one paper's vocabulary ("watermark," "windowing," "triggers") is now universal streaming terminology.

### Netflix — the pipeline migration as an organizational redesign
- **Keystone — the real-time data pipeline migration off a legacy stack.** Forcing problem: Netflix's prior pipeline (a chain of custom routing/Chukwa-based tools) couldn't keep up with event-volume growth or provide self-service onboarding for new event producers. Core decision: standardize on **Kafka as the backbone**, with a stream-processing layer (initially Samza-based, later Flink) that gives producer teams a self-service path to a new topic with schema registration, without a central team in the critical path. Lesson for Ch.11/Ch.17.5: the win wasn't a novel algorithm, it was an **operational/organizational redesign** — self-service onboarding is as much a platform-engineering deliverable as a technical one.

### The CDC bridge — Debezium + the lakehouse
- **Debezium (log-based CDC) into Hudi/Iceberg/Delta.** The production realization of Ch.8.2: Debezium reads the database WAL/binlog, emits an initial consistent snapshot followed by the change stream with no gap and no overlap, and lands upserts/deletes into a table format that can actually apply them (Uber's Hudi, above, exists precisely to make the lake absorb this upsert stream). This is the standard "OLTP → lakehouse with exactly-once effect" path asked about in system-design loops.

---

# MILESTONE 5 — Platform: Cloud, Orchestration, Containers & Operations
Where pipelines run, how they are scheduled and recovered, and how you know they are healthy. This milestone turns a collection of jobs into an operated platform.

## Chapter 10 — Cloud Data Architecture
### 10.1 Cloud foundations for data systems
- Regions, availability zones, failure domains
- Object storage durability and lifecycle management
- IAM, roles, service identities, least privilege
- Private networking: VPC/VNet, subnets, security groups
- Managed compute vs self-managed compute
- Secrets and key management
- Cloud cost dimensions: storage, compute, network, managed-service premiums

### 10.2 AWS, Azure, and GCP data-stack mapping
- AWS: S3, IAM, Glue, EMR, MSK, Redshift, Kinesis, Lake Formation, Athena
- Azure: Entra ID, ADLS, Data Factory, Databricks, Event Hubs, Synapse, Fabric
- **GCP** (frequently missing from curricula despite heavy enterprise adoption): BigQuery (slots, storage billing, BI Engine), Dataflow (Apache Beam execution), Pub/Sub, Dataproc, Composer, Dataplex for governance
- Mapping object storage, orchestration, streaming, Spark-equivalent, warehouse, and identity primitives across all three providers
- Managed-service trade-offs and vendor lock-in

### 10.2.1 AWS Glue (managed Spark ETL + catalog)
- **What it is / why:** serverless managed Spark (plus Python-shell and Ray jobs) for ETL without running a cluster; the **Glue Data Catalog** supplies schema and partition metadata consumed by Athena, Redshift Spectrum, and EMR.
- **Architecture essentials:** job bookmarks for idempotent incremental re-runs; crawlers/schema inference and schema-drift handling; DPU-based serverless billing.
- **Trade-off / when not:** low-ops and convenient, but less control and often costlier at scale than self-managed EMR or Databricks — pick Glue for bursty/managed ETL, EMR/Databricks when you need cluster control or heavy tuning.

### 10.2.2 AWS Lake Formation (lake governance & access control)
- **What it is / why:** a governance layer over the Glue Catalog that centralizes fine-grained access control (table/column/row-level, tag-based) and cross-account sharing for an S3 data lake.
- **Architecture essentials:** permissions enforced for Athena/Redshift Spectrum/EMR consumers; CloudTrail audit; self-service table registration for a multi-team/data-mesh setup.
- **Trade-off / when not:** AWS-native and tightly coupled to the Glue Catalog; open-table-format catalogs (Iceberg REST, Unity Catalog, Polaris, Nessie) are the cross-engine alternatives when you want to avoid AWS lock-in (cross-ref Ch.6.3).

### 10.3 Databricks and modern data platforms
- **Compute:** all-purpose vs job clusters, compute policies, instance pools, autoscaling; classic vs **serverless** compute; **Photon** (the vectorized C++ execution engine — the same Ch.1.3 memory-hierarchy and Ch.6.1 columnar-encoding lesson that makes Spark's Tungsten fast)
- **Orchestration and pipelines:** Databricks **Workflows** (Jobs) for scheduling/dependencies; **Delta Live Tables / Lakeflow Declarative Pipelines** (declarative, expectation-based pipelines with managed dependencies and built-in data quality); when to use Workflows vs external Airflow/Dagster (cross-ref Ch.11)
- **Ingestion:** **Auto Loader** (`cloudFiles`) for incremental, schema-evolving file ingestion with checkpointing; `COPY INTO` (cross-ref Ch.8)
- **Delta-on-Databricks operations:** `OPTIMIZE` + **Z-ORDER**, **liquid clustering**, `VACUUM`, **Change Data Feed**, **deletion vectors**, `MERGE` performance (cross-ref Ch.6.3)
- **Databricks SQL:** SQL warehouses (classic/pro/serverless), query/result caching, dashboards — the BI-serving boundary over the lakehouse
- **Unity Catalog in depth:** three-level namespace (`catalog.schema.table`), governed **volumes** for non-tabular data, automated column/table **data lineage**, fine-grained access control and dynamic masking, **Delta Sharing** (open cross-org/cross-platform sharing), Lakehouse Federation (query external sources through UC)
- **Notebooks vs production code:** Repos/Git integration, **Databricks Asset Bundles (DABs)** for CI/CD and environment promotion, CLI-based deployment; the notebook-only anti-pattern (cross-ref Ch.23)
- **Cost/performance tuning (DBU economics):** DBUs by compute type, serverless vs classic cost model, cluster right-sizing, Photon cost/benefit, spot/preemptible strategy

### 10.4 Infrastructure as Code and platform engineering
- Terraform / Pulumi for provisioning data infrastructure reproducibly
- GitOps for data platforms: environment promotion, PR-based infra changes
- FinOps for data: cost attribution per team/pipeline, spot/preemptible compute strategy, storage tiering, query cost governance (e.g., BigQuery slot reservations, Snowflake credit monitoring)

### 10.5 Europe-specific data architecture (regulatory, industrial, on-prem)
- **Regulatory and compliance layer:**
  - GDPR/ePrivacy implications for pipeline design: data residency (data stays in EU, compute routing), retention policies, PII detection/masking, audit trails for regulatory audits
  - Data sovereignty: Gaia-X framework, European alternatives to US cloud providers, EU data spaces regulation
  - Works council / data protection officer collaboration: soft skill but real governance requirement in German enterprises
- **Industrial/SAP integration patterns (manufacturing, automotive, supply chain):**
  - SAP ERP → data infra: extracting FI/CO (finance), MM (materials), PP (production), QM (quality) data; CDC from SAP HANA
  - SuccessFactors (HR) → analytics layer
  - MES/SCADA ↔ ERP ↔ warehouse: orchestration under operational constraints (must not block production systems)
  - Master data governance: customer/product/plant master data consistency across systems
- **On-prem-first or hybrid-cloud assumptions:**
  - On-prem Hadoop/Spark clusters (not cloud-native)
  - Private cloud / virtual private data centers
  - Hybrid architectures: on-prem transactional systems, analytics on cloud (data egress costs matter)
  - Network latency between on-prem and cloud: implications for real-time pipelines
- **Practical EU data-engineer context:**
  - German manufacturing plants data model (OEE, production scheduling, quality SPC)
  - Time-zone and multi-currency considerations for multinational enterprises
  - Language/localization in data catalogs and governance tools
  - *Lab*: design a data platform for a 3-plant German manufacturer with GDPR compliance, SAP integration, on-prem+cloud hybrid, data residency constraints

## Chapter 11 — Orchestration, Reliability and Data Operations
### 11.1 Orchestration beyond DAG syntax
- Scheduler/executor/worker architecture
- Task retries and idempotency
- Backfills and catchup
- Dynamic task mapping
- Pools, queues, concurrency controls
- Task-level vs workflow-level failure
- Metadata database and operational concerns
- Alternatives and trade-offs: Airflow vs Dagster (asset-based orchestration) vs Prefect vs Temporal (durable execution/workflow-as-code)

### 11.1.5 AWS Step Functions (serverless orchestration)
- **What it is / why:** a serverless state-machine orchestrator for stitching AWS services (Glue, Lambda, Athena, EMR, DynamoDB) into a pipeline without running an Airflow cluster.
- **Architecture essentials:** state types (Choice/Parallel/Map/Wait), built-in retry/catch with backoff, standard (long-running) vs express (short, high-volume) workflows; pay-per-state-transition.
- **Trade-off / when not:** great for AWS-centric, event-driven, low-ops pipelines; weaker for complex data-aware DAGs and cross-cloud work — reach for Airflow/Dagster (Ch.11.1) or Temporal (Ch.11.2) there.

### 11.2 Temporal and durable-execution orchestration (paradigm shift)
- **When DAG-based orchestration isn't enough:**
  - Long-running workflows (hours to days) with internal state between steps
  - Human-in-the-loop workflows (approval gates, manual intervention, resumable after human decision)
  - Workflow code as the source of truth (vs metadata DB + DSL separation)
  - Built-in retry/exponential backoff without task re-queueing overhead
- **Temporal architecture:** workers poll Temporal server for tasks, execute SDK code, durably record state; replays on failure to restore state
- **Durable execution semantics:** workflow code is deterministic and replayable; side effects (DB writes, API calls) are activity functions outside the deterministic zone
- **Trade-offs:** complexity for long-lived workflows; overkill for simple DAGs; requires rethinking error handling (activities are retryable, workflows are not)
- **Comparison table:**
  - Airflow: DAG-centric, easy DAG visualization, large ecosystem, metadata DB bottleneck at scale (substantially re-architected by **Airflow 3.0**, April 2025 — task-execution API, DAG versioning, event-driven scheduling)
  - Dagster: asset graph, data-aware lineage, great for lineage-first platforms
  - Temporal: durable code, long-lived workflows, best for event-driven / saga patterns
  - Prefect: middle ground, newer patterns
- *Lab*: migrate a long-running approval-gate workflow from Airflow to Temporal; measure operational overhead reduction

### 11.3 Data reliability engineering
- Freshness, completeness, validity, uniqueness, consistency
- Data quality SLIs/SLOs and error budgets for data
- Data incidents and blast radius; incident command for data outages
- Runbooks and ownership; on-call for data pipelines
- Backfills and replay; idempotent, resumable backfill design
- Disaster recovery: RPO/RTO, cross-region failover, backup/restore testing
- Schema-change management: expand/contract pattern, backward/forward compatibility rollout

### 11.4 DataOps: testing, CI/CD and deployment for data pipelines
- **Testing the transformation layer:** unit tests for transforms; **data-diff / regression testing** (compare old vs new pipeline output on the same input); golden-dataset snapshot tests; assertion/expectation tests (Great Expectations, Soda, dbt tests — cross-ref Ch.13.3); property-based tests for invariants (cross-ref Ch.4.2)
- **CI for data code:** lint/compile/test dbt and Spark jobs on every PR; run tests against a sampled or seeded synthetic dataset; fail the build on broken lineage, a failing data contract, or an SLA regression
- **Environment promotion:** dev → staging → prod parity; isolated per-environment data/catalogs; seeded synthetic data generators (cross-ref Ch.18 rubric); config/secret separation across environments
- **Deployment strategies for pipelines:** blue-green and canary pipeline deploys; shadow/parallel runs (write to a side table and diff before cutover); **write-audit-publish (WAP)** pattern; feature-flagging a new transform
- **Data-contract enforcement in CI:** schema + SLA + semantics checked before merge (cross-ref Ch.3.4, Ch.13.4), with automated notification of downstream owners on a breaking change
- **GitOps and reproducibility:** everything-as-code (pipelines, infra, tests, contracts); one-command local bring-up; pinned dependencies (cross-ref Ch.10.4, Ch.23)

## Chapter 12 — Containers, Kubernetes and Delivery
### 12.1 Docker for data workloads
- Images, layers, volumes, networks
- Multi-container environments
- Resource limits and health checks
- Secrets/configuration
- Reproducible builds

### 12.2 Kubernetes concepts for data engineers
- Pods, deployments, jobs, cron jobs
- Services and networking
- ConfigMaps and Secrets
- Requests/limits
- Persistent volumes
- Schedulers and node pools
- Failure/restart behavior
- Spark-on-Kubernetes and Kafka-on-Kubernetes operational patterns
- *Lab*: run Spark-on-Kubernetes, inject executor-pod eviction, OOMKilled, and PVC failure, and observe restart, task re-scheduling, and recovery behavior under each

## Chapter 13 — Observability, Governance and Security
### 13.1 Observability
- Structured logging
- Metrics: throughput, latency, error rate, lag, freshness, backlog
- Tracing concepts (OpenTelemetry)
- High-cardinality dimensions and metric design
- Alert fatigue and actionable alerts
- Pipeline lineage and dependency visualization

### 13.2 Governance and security
- Data classification
- PII and sensitive-data handling
- Encryption at rest/in transit; envelope encryption, KMS, key rotation; **tokenization** and **format-preserving encryption** (keep referential integrity on masked data)
- **Privacy-enhancing techniques:** anonymization vs pseudonymization; **k-anonymity, l-diversity, t-closeness**; **differential privacy** (noise budgets for aggregate release); hashing/salting of identifiers; re-identification risk
- Dynamic data masking and column-level masking policies
- RBAC/ABAC concepts
- Column/row-level security
- Data catalogs and lineage
- Retention and deletion policies; right-to-erasure / crypto-shredding
- Auditability
- **Regulatory frameworks (cross-jurisdiction — complements the EU/GDPR-specific coverage in Ch.10.5):** GDPR (EU), **CCPA/CPRA** (California), **HIPAA** (US healthcare/PHI), **PCI-DSS** (payment cards), **SOX** (financial-reporting controls), **HITRUST**, **LGPD** (Brazil), **PIPL** (China); data residency/sovereignty; how each shapes retention, access control, audit trails, and pipeline design

### 13.3 Tooling for governance at scale
- Data catalogs: DataHub (OSS, actively developed), Collibra/Atlan (enterprise); Amundsen is now less actively maintained — know it, but don't lead with it
- Automated lineage: OpenLineage/Marquez standard, lineage from dbt/Spark/Airflow integrations
- Data quality frameworks: Great Expectations, Soda Core/Cloud, dbt tests, Monte Carlo-style data observability (anomaly detection on freshness/volume/schema)

### 13.3.5 AWS CloudWatch (pipeline observability)
- **What it is / why:** AWS-native metrics, logs, alarms, and dashboards — the default place Glue/Lambda/Step Functions emit operational signals.
- **Architecture essentials:** custom metrics (rows ingested, freshness/lag, null/duplicate rate, cost), **Logs Insights** for ad-hoc log querying, alarms on SLO breaches, dashboards with drill-down to logs.
- **Trade-off / when not:** fine inside AWS, but weak cross-system correlation and costly at high metric cardinality — Datadog/Grafana + Prometheus and OpenTelemetry (Ch.13.1) are the vendor-neutral alternatives.

### 13.4 Governance architecture and data ownership (platform-engineering perspective)
- **Ownership model:** domain teams own data products (not centralized data office), with platform team providing self-serve tooling; reverse Conway's Law (org structure should match data product boundaries)
- **Data contracts:** versioned, machine-checkable schema + SLO (freshness, completeness) + semantics; enforced in CI before deployment
- **Multi-tenancy governance:** per-tenant cost allocation, isolation (logical vs physical), per-tenant retention policies, per-tenant compliance (GDPR erasure, audit logs)
- **Access control at scale:** column-level / row-level security enforced in query engines (Trino/Presto RLS, Snowflake dynamic masking), not application layer; federation with enterprise IAM (LDAP, SAML, OAuth)
- **Lineage-driven decision-making:** blast radius assessment (if table X is stale, which downstream tables are affected?); impact analysis before schema changes; automated notification of dependent teams
- **Stewardship vs pure automation:** some governance decisions require human stewardship (criticality assessment, retention exceptions, PII classification); don't over-automate subjective judgments
- *Lab*: design governance for a platform with 3 domain teams + 2 compliance requirements; instrument lineage collection; build a self-serve table-registration flow with schema validation

## Systems in Production — Milestone 5: operating platforms at scale
### Netflix — failure injection as a product, not an afterthought
- **Chaos engineering (Chaos Monkey, and later the Simian Army).** Forcing problem: Netflix runs on AWS, where instance failure is a certainty, not an edge case; manual disaster-recovery drills don't scale and don't run often enough to build real confidence. Core decision: automatically and continuously kill production instances during business hours, forcing every service to be built for graceful degradation by default rather than by discipline. Direct lesson for the Ch.18/Ch.22 rubrics: "failure injection" in this syllabus's capstone rubric is not academic — it is a deliberate echo of Chaos Monkey's actual production practice.

### Airbnb — the orchestrator and the metrics layer, born from specific pain
- **Airflow (2014+) — the workflow orchestrator born from a specific pain point.** Forcing problem: Airbnb's growing set of cron-scheduled ETL/analytics jobs had no shared dependency model, no retry semantics, no visibility into failures, and no backfill story — every team's cron jobs were a black box to every other team. Core decision: workflows as **Python-defined DAGs** (code, not XML/config), a web UI for visibility, and built-in backfill/retry — explicitly chosen so data engineers could express pipeline logic in the same language as their transformations. Trade-off (now well-understood, see Ch.11.1/Ch.11.2): the metadata-database-centric scheduler architecture that made Airflow easy to adopt is the same architecture that bottlenecks at very high DAG/task-density scale — directly motivating Ch.11.2's Temporal comparison. (This critique predates **Airflow 3.0** (April 2025), which re-architected much of it — a task-execution API decoupling workers from the metadata DB, DAG versioning, and event-driven/data-aware scheduling — so it now applies mainly to pre-3.0 deployments.)
- **Minerva / metrics platform — the semantic-layer problem before it had a name.** Forcing problem: different Airbnb teams computed "bookings" or "revenue" with subtly different filters, producing dashboards that disagreed with each other in exec reviews. Core decision: a centralized metrics definition layer that every downstream dashboard/report must consume rather than re-deriving. Lesson: this is the lived experience behind Ch.3.4's "single definition of a metric reused everywhere" bullet — the dbt Semantic Layer / Cube / LookML category exists because this problem is universal, not Airbnb-specific.

### Google — monitoring the monitors
- **Monarch / Borgmon — metrics at planetary scale.** Forcing problem: monitoring hundreds of thousands of jobs across global datacenters with a single Prometheus-style server was never going to scale. Core decision: a hierarchical, globally-distributed time-series database (Borgmon, later Monarch) with push-based collection and a purpose-built query language (predecessor to **PromQL**'s design lineage). Lesson for Ch.13: the observability stack you build in-house eventually needs the same sharding/federation thinking as the data systems it's monitoring.

---

# MILESTONE 6 — Theory & Design: Distributed Systems and System Design
The reasoning layer. Everything before this milestone was a mechanism; here you learn the theory that explains *why* those mechanisms are correct, and the method to design a new system under requirements and trade-offs.

## Chapter 14 — Distributed Systems Theory (deep, cross-cutting)
- Consistency models revisited: linearizability, sequential consistency, causal consistency
- Consensus: Raft and Paxos-family reasoning, leader election, quorum writes/reads
- The FLP impossibility result (no deterministic consensus with even one crash failure in a fully asynchronous model) and how real systems escape it — partial synchrony, timeouts, and randomized election timeouts (why Raft needs them; cross-ref Ch.25-E)
- Failure detection, gossip protocols
- Idempotency and exactly-once as an architectural property, not a library feature
- CRDTs for coordination-free convergence
- Lamport logical clocks and the happens-before relation — the causality foundation beneath vector clocks (and why a scalar clock gives a total order but cannot detect concurrency)
- Vector clocks and causality tracking
- Why this theory underlies Kafka ISR, ZooKeeper/KRaft, distributed databases, and consistent hashing in object stores
- For implementation-level grounding (actual Raft message formats, log-conflict repair, Kafka partition/offset semantics, CRDT merge-operator design) see Ch.25-E

## Chapter 15 — Data-System Design
Review the Systems in Production sections (closing each milestone) alongside this chapter — every exercise below is a smaller version of a problem some company already solved in production, and knowing the real precedent sharpens your trade-off reasoning.

### Design method (apply to every exercise)
- Clarify functional requirements
- Clarify latency, volume, retention, availability, correctness requirements
- Estimate events/sec, bytes/day, storage/year, peak traffic
- Identify source systems and ownership
- Choose batch, streaming, or hybrid ingestion
- Choose durable storage and layout
- Choose processing engine
- Choose serving/consumption layer
- Define partitioning, indexing, data lifecycle
- Design for duplicates, late data, replay, backfill
- Design failure recovery and disaster recovery
- Add security, governance, observability
- Estimate cost and identify the largest cost levers
- State trade-offs and alternatives

### Requirements-gathering checklist (ask these before designing anything)
A world-class designer interrogates requirements before drawing boxes. Work both halves every time.

**Source side (where data comes from):**
- Origin and structure: what is the source? format (JSON/CSV/Avro/Parquet)? schema defined or dynamic? structured/semi/unstructured? how is schema evolution handled?
- Volume and velocity: bytes per transmission? arrival rate (msgs/sec)? max/day per source and across all sources? bursts/peaks? seasonal/daily fluctuation? throttle or buffer on burst?
- Reliability and redundancy: late data? duplicate risk and dedup strategy? source failure rate? corruption/loss in transit? what if a source goes offline (failover)? retry/fault-tolerance?
- Extraction and growth: must we extract (pull) or is it pushed? how many sources? new sources coming?
- Connectivity and auth: arrival mechanism (API/bucket/stream)? protocol (REST/WebSocket/FTP)? rate limits/quotas? credential handling? retry strategy?
- Security and compliance: encryption at source? GDPR/HIPAA/compliance frameworks? masking/obfuscation needed?
- Metadata and audit: per-transmission metadata (record counts, latency)? ingestion event logging? lineage tracking?

**Destination side (where data goes and how it's used):**
- Use case: analytics / BI / ML / transactional / visualization / API? real-time vs historical criticality?
- Query and delivery: freshness required? query frequency? data scanned per query? cold-data volume and query rate? result latency SLA? downstream consumers?
- Aggregation and modeling: aggregate by what (device/topic/time)? aggregate when (on-query/scheduled/streaming)? model (star/snowflake)? pre-aggregations? partition/index strategy?
- Performance and availability: processing-time requirement? input→output delay budget? concurrent-query load? ingestion→queryable lag? horizontal scaling of query engines?
- Lifecycle and retention: retention period? archival to cold storage cadence? reprocessing old data for new use cases? hot vs cold tiers?
- Monitoring and debugging: how is delivery monitored (time-to-load, query failures)? pipeline-health metrics (throughput, latency)? debugging tools? corruption/incomplete-data handling?
- Access and permissions: who queries/visualizes? which tools? export formats? RBAC/row-level security? sensitive-data access?
- Scaling and future: scalability as volume grows? how will the use case evolve? load growth from more users/data?

### Design exercises
- Global manufacturing telemetry platform
- 100k+ sensor events/sec ingestion system
- CDC from Oracle/PostgreSQL into a lakehouse
- Near-real-time production-quality dashboard
- Enterprise data warehouse with incremental loads
- Multi-region analytical platform
- Five-year historical backfill system
- Real-time anomaly detection pipeline
- ML feature-generation platform
- Data-quality monitoring platform
- Multi-tenant SaaS analytics platform with per-tenant isolation and cost allocation
- RAG ingestion pipeline for an LLM product serving millions of documents
- Real-time fraud-detection pipeline with sub-100ms scoring latency
- Data platform for a German manufacturing plant: SAP ERP integration, GDPR compliance, on-prem+cloud hybrid, multi-plant data governance
- Long-running approval-gated workflow in Temporal: event-driven orchestration with human-in-the-loop
- Operational supply-chain-provenance graph: design for transactional consistency, real-time querying, and analytics

### System-design question catalog (the ones actually asked at senior/staff loops)
Practice each at a whiteboard in 45 minutes using the method above. Classic FAANG/infra-company prompts:
- Design a rate limiter / design an API that enforces per-tenant quotas
- Design a distributed message queue (Kafka from scratch): partitioning, replication, offsets, delivery semantics
- Design a metrics/monitoring system (time-series ingestion + rollups + alerting) — e.g., Prometheus-scale
- Design a clickstream/analytics pipeline (events → lake → warehouse → dashboards) at billions/day
- Design a near-real-time recommendation feature pipeline (online/offline feature parity)
- Design a data warehouse for a large e-commerce company (model + ingestion + serving)
- Design a deduplication service for an at-least-once event stream
- Design an idempotent, resumable multi-TB backfill without harming production
- Design a CDC pipeline from OLTP to lakehouse with exactly-once-effect semantics
- Design a search/indexing pipeline (crawl → parse → index → serve) with freshness SLOs
- Design a feature store (online + offline) with point-in-time correctness
- Design a notification/fan-out system (write amplification, fan-out-on-write vs on-read)
- Design a top-K / trending system (heavy hitters at scale) using sketches
- Design a multi-region, strongly-consistent counter / inventory system (and know why it's hard)
- Design a GDPR "right to be forgotten" deletion pipeline across a lakehouse + backups
- Design a data-quality / anomaly-detection platform with blast-radius-aware alerting
- Design a lakehouse with time travel, schema evolution, and concurrent writers
- Design the same pipeline as Lambda vs Kappa: batch + speed layers merged at a serving layer vs stream-only with log replay for reprocessing; argue the reprocessing/correctness trade-off and when a separate batch correction layer is still warranted (cross-ref Ch.3.3)
- Design a cost-attribution system for a multi-tenant data platform
- Design a streaming-median / running-quantiles service (two-heaps for exact; t-digest/DDSketch for approximate-at-scale — cross-ref Ch.1.2 heaps and Ch.5.6 sketches)
- Design a sharded datastore: choose a shard key, route requests, apply consistent hashing, and handle resharding and a hot shard (cross-ref Ch.5.3)
- Design a distributed unique-ID generator (Snowflake ID / UUIDv7 / ULID): coordination-free uniqueness, rough time-ordering/monotonicity, clock skew, and why auto-increment doesn't shard — also the basis for surrogate keys in a distributed warehouse (cross-ref Ch.3.2)

## Systems in Production — Milestone 6: the hardest guarantees, and the pragmatic alternative
### Google — global consistency that CAP says you shouldn't have
- **Spanner (2012, Corbett et al., OSDI) — globally distributed and still strongly consistent.** Forcing problem: Google's ad/billing systems (F1) needed cross-datacenter, globally-distributed transactions with real **external consistency** (**strict serializability**) — something the CAP theorem says should be impossible without sacrificing availability during partitions. Core decision: **TrueTime**, an API exposing bounded wall-clock uncertainty (backed by GPS + atomic clocks in every datacenter), lets Spanner assign globally-meaningful timestamps and use **Paxos-replicated** shards with **two-phase commit** across shards without a central coordinator bottleneck. Trade-off: real infrastructure investment (atomic clocks in datacenters) to buy down a problem most companies solve by weakening consistency instead. Lesson: this is the system to cite when an interviewer asks "didn't CAP theorem prove you can't have this?" — the answer is bounded clock uncertainty, not a CAP exception.

### Amazon — quorum reasoning, revisited as theory
- **Dynamo's quorum (R/W/N), revisited.** The Milestone-2 case study described Dynamo as a product; here it is a theory exhibit for Ch.14. With N replicas, choosing R + W > N guarantees read/write quorum *intersection* (a read set and a write set always overlap), which is **necessary but not sufficient** for a correct result — you still need an explicit rule for which version wins (vector clocks and application-side conflict resolution). Dynamo is the canonical worked example of tuning R, W, N to slide along the latency/durability/consistency surface.

### Uber — "just shard a boring database" as a legitimate design
- **Schemaless / sharded MySQL — the pragmatic alternative to "just use Dynamo."** Forcing problem: Uber needed horizontally-scalable, highly-available storage for trip data without betting the company on a brand-new distributed database. Core decision: a thin schemaless layer (key, column, timestamped-value — notably similar in shape to Bigtable's cell model) on top of **well-understood, battle-tested sharded MySQL**. Lesson: "shard a boring, well-understood database behind a thin abstraction" is a legitimate, frequently-correct alternative to adopting an exotic distributed database — don't let case studies of exotic systems bias you toward always reaching for one.

---

# MILESTONE 7 — Frontier: Industrial, Time-Series & the Modern/AI Stack
The specialized and fast-moving edges: industrial/time-series data, the ML/MLOps data layer, production RAG and vector systems (the highest-paid niche right now), graph systems, and the emerging agentic stack.

## Chapter 16 — Industrial and Time-Series Data
### 16.1 Manufacturing data model
- Plant → line → machine → sensor hierarchy
- Production runs, batches, recipes, work orders
- Quality measurements and non-conformance
- Maintenance and failure events
- Energy and environmental telemetry
- ERP/MES/SCADA/IoT conceptual boundaries
- Operational vs analytical ownership

### 16.2 Time-series engineering
- Event time and time zones
- Downsampling and rollups
- Windowing and resampling
- Gap filling and interpolation for missing/irregular samples (forward-fill/LOCF, linear interpolation) and as-of alignment of multiple unsynchronized sensor streams onto a common time grid
- Retention tiers
- Compression
- Time-series-specific compression: delta-of-delta timestamp encoding + XOR float encoding (Gorilla-style) — why TSDBs compress regular telemetry far better than generic columnar
- High-cardinality dimensions
- Time-series database vs warehouse/lake trade-offs (InfluxDB, TimescaleDB, Prometheus-style storage)

## Chapter 17 — The Modern and Emerging Data Stack
### 17.1 ML / MLOps data engineering foundations (the data side of ML)
- The data engineer's role in the ML lifecycle: data > features > training sets > serving; most ML failures are data failures
- **Feature engineering at scale:** batch vs streaming features, point-in-time correctness (no label/feature leakage), backfilling features
- **Feature stores:** Feast, Tecton — online/offline store consistency, feature freshness, training/serving skew
- **Training-data pipelines:** dataset curation, versioning (DVC, lakeFS, Delta/Iceberg snapshots), reproducibility, labeling pipelines, class balancing
- **Serving data:** low-latency feature retrieval, model-input logging, shadow/canary data capture
- **Monitoring:** data drift, concept drift, feature-distribution monitoring, label-delay handling
- **Experiment/metadata tracking:** MLflow, Weights & Biases from the data-pipeline perspective
- Pitfalls: train/serve skew, leakage, silent schema drift corrupting features

### 17.1.1 AI / LLM data engineering (fastest-growing high-pay niche)
- Vector databases: Pinecone, Weaviate, Milvus, pgvector — indexing (HNSW, IVF), ANN trade-offs; **vector quantization** (scalar/product/binary) for memory/cost, **hybrid search** (dense + sparse/BM25) and reranking, **Lance/LanceDB** (columnar format for vector + multimodal data)
- Embedding pipelines: chunking strategies, embedding model selection, re-indexing at scale
- RAG ingestion architecture: document parsing, deduplication, metadata enrichment, incremental re-embedding
- Data pipelines for model fine-tuning: dataset curation, deduplication, PII scrubbing, synthetic data generation
- Data pipelines for agentic systems: tool-call logging, feedback-loop data capture, evaluation datasets; **Model Context Protocol (MCP)** as the emerging standard for exposing data and tools to LLM agents
- **GraphRAG / knowledge-graph-augmented retrieval:** combine vector search with a knowledge graph for multi-hop, entity-centric questions (cross-ref Ch.17.3)

### 17.1.5 Production RAG systems at scale (deep dive into highest-paying niche)
- **RAG architecture layers:**
  - **Ingestion:** document discovery (file system, APIs, web crawl), parsing (text, PDF, code, tables), chunking (token-aware, semantic, overlap strategies)
  - **Embedding:** model selection criteria (domain-specific vs general; OSS vs commercial; cost/latency vs quality), batch embedding, incremental updates, versioning
  - **Index management:** vector DB schema design (metadata filtering, sparse/dense hybrid), reranking (BM25 + dense), retrieval evaluation (recall/MRR)
  - **Query processing:** query expansion, query routing (parametric vs semantic), fallback strategies
  - **Post-retrieval:** context window management, ranked fusion, chain-of-thought grounding
- **Production requirements (often missing from toy RAG examples):**
  - **Freshness:** incremental re-embedding on source changes (cost/latency trade-off); snapshot versioning for reproducibility
  - **Cost:** embedding cost per query, vector DB storage/query cost, LLM token cost; optimization levers (quantization, clustering, distillation)
  - **Latency SLOs:** p50/p95/p99 for retrieval + LLM response; regional latency (cross-region vector DB, embedding batching)
  - **Correctness:** retrieval quality metrics (coverage, precision, diversity); evaluation dataset maintenance; drift detection (relevance decay over time)
  - **Deduplication and canonicalization:** source content updates (rewording, moved), duplicate detection before indexing, merge strategies
  - **Hallucination mitigation:** citation tracking (grounding each LLM output token to a source span), rejection thresholds, retrieval coverage checks
- **Failure modes and mitigation:**
  - Cold start (no domain data): synthetic data generation, bootstrap from public sources
  - Domain drift (embedding model changes): version migration strategies, re-embedding windows
  - Spurious high-rank results: manual review queues, feedback loops to reranker
  - Catastrophic forgetting (new documents don't appear): reconcile ingestion lag with freshness SLO
- *Lab*: build an incremental RAG pipeline over a large document corpus; implement drift detection; measure cost/latency/correctness trade-offs; design a feedback loop for continuous reranker improvement

### 17.2 Reverse ETL and the activation layer
- Syncing warehouse data back into operational SaaS tools (Hightouch, Census patterns)
- Operational analytics vs BI analytics boundary

### 17.3 Graph databases and analytics
- **Analytics-focused graph:** Neo4j for knowledge graphs, recommendation systems, social-network analysis; Cypher query language; graph algorithms (PageRank, community detection)
- **GraphX / Spark GraphFrames:** distributed graph compute on Spark; iterative vertex/edge operations
- **Materialized view generation** from graphs (recommendation ranking feeds, influence scores)

### 17.4 Graph as operational backend
- **Operational graphs:** TigerGraph, Amazon Neptune as transactional backends (not just analytics)
- **Property graphs:** rich attributes on vertices and edges; use case examples (supply-chain provenance, service dependencies, permission graphs)
- **Query optimization:** traversal planning, execution strategy (eager vs lazy), index design for operational SLOs
- **Real-time graph update semantics:** ACID properties, how graph mutations propagate (immediate vs eventually consistent)
- *Lab*: design a supply-chain provenance graph; query "find all suppliers transitively used by product X"; measure query latency under updates
- **vs. traditional relational:** when joins become the bottleneck (deep traversals), when graph-native indexes win (reachability queries); cost/latency trade-offs

### 17.5 Data product and platform thinking
- Treating pipelines and datasets as products with SLAs, versioning, and consumers
- Internal developer platforms for data teams (self-serve provisioning, templated pipelines)

### 17.6 Agentic and AI-assisted data pipelines (emerging 2026)
- LLM-based agents orchestrating data pipelines (adaptive retry logic, failure diagnosis)
- Agents for data quality decision-making (anomaly flagging, schema inference, auto-remediation)
- Agent-as-ETL-state-machine: agent memory persisted, incremental task resumption
- Cautions: reproducibility (LLMs are stochastic), audit trails (who decided what, why), cost explosion under scale
- State of the art: early-stage; watch **LangGraph** (the primary forward reference here) for data-pipeline orchestration patterns — note **AutoGen** has largely merged into Microsoft's **Agent Framework**

### 17.7 The analytics-engineering last mile and the BI serving boundary
Where data engineering ends and analytics/BI begins — know the boundary and the handoff, even though BI-tool mastery is out of scope for this syllabus.
- **The serving/consumption contract:** what the DE delivers to BI — conformed marts, the semantic/metrics layer as the single source of metric truth (cross-ref Ch.3.4), documented grain and freshness SLAs
- **BI tools as consumers (recognition, not mastery):** Looker/LookML, Power BI, Tableau, Superset, Metabase; import/extract vs live-query modes and what each does to the warehouse; **headless BI** (one metrics layer served to many tools)
- **Serving-layer performance for BI:** pre-aggregation/rollup tables, materialized views, caching and BI-engine acceleration (BigQuery BI Engine, Databricks SQL); extract-refresh scheduling
- **The DE ↔ analyst/analytics-engineer handoff:** where ownership transfers, how semantic definitions are negotiated, and avoiding the "metric computed two ways" problem (cross-ref the Airbnb Minerva case study in Milestone 5)

## Systems in Production — Milestone 7: the ML/AI data platform
### Uber — the system that forced "feature store" into existence
- **Michelangelo — the ML platform that forced feature-store thinking.** Forcing problem: every ML team at Uber was independently rebuilding feature pipelines, with online (serving) and offline (training) feature computation drifting apart — classic **train/serve skew** (Ch.17.1). Core decision: a shared platform with a managed feature store enforcing the *same* feature-computation code path for training and serving. Lesson: this is the origin story behind "feature store" as a category (predating Feast/Tecton as products) — know it when discussing Ch.17.1's train/serve-skew question.

### Vector search in production — HNSW, and the cost of freshness
- **The ANN index is the whole engine.** Production vector databases (Pinecone, Weaviate, Milvus, pgvector) are built around an approximate-nearest-neighbor index — most commonly **HNSW** (a navigable small-world graph giving logarithmic-ish search) or **IVF** (inverted-file clustering). The real engineering is not the first query but the Ch.17.1.5 operational surface: incremental insert/delete without rebuilding the whole graph, metadata-filtered search, and keeping the index fresh as the corpus changes — each a direct cost/latency/recall trade-off.
- **RAG as a data pipeline, not a prompt.** The durable lesson of 2024–2026: production RAG quality is dominated by the ingestion/embedding/freshness pipeline (parsing, chunking, dedup, re-embedding on change, citation grounding), i.e. ordinary data-engineering discipline applied to a new sink — which is exactly why this niche pays what it does.

### The agentic frontier — handle with audit trails
- **LLM agents orchestrating pipelines** (LangGraph/AutoGen-style) are early-stage: they can diagnose failures and auto-remediate, but they are stochastic. In production the non-negotiables are the Ch.17.6 cautions — persisted agent memory for resumability, a full audit trail of *who decided what and why*, and hard cost ceilings — because an unbounded agent loop is a billing incident waiting to happen.

---

# MILESTONE 8 — Mastery: Capstones, Career & Self-Assessment
Proof of mastery, not more topics. Build the integrative systems, test yourself against the question bank, define what "excellent" means at each gate, and convert the whole thing into career leverage.

## Chapter 18 — Capstones
- **Primary capstone — Global Industrial Data Platform:** operational Postgres/Oracle-style sources → CDC into Kafka → high-frequency sensor events through Kafka → object-storage data lake → transactional lakehouse layer → PySpark batch + Structured Streaming → curated warehouse/serving layer → Airflow orchestration → data-quality framework → Dockerized local environment → AWS/Azure cloud equivalent → metrics/logs/alerts/lineage
  - Failure scenarios to demonstrate: duplicate event, late/out-of-order event, consumer crash after processing, broker failure, Spark executor loss, data skew, bad schema deployment, source database outage, corrupt input partition, five-day backfill, partial downstream failure, replication lag
  - Required technical reports: ADR for major choices, data model with grain/historical semantics, Spark performance benchmark, Kafka throughput/lag benchmark, database query-plan benchmark, failure-recovery report, security/governance model, cost estimate and optimization options
- **Systems capstone A:** a production-grade async service (Rust/Tokio) — see Ch.25-G
- **Systems capstone B:** a durable key-value engine (WAL + B-tree/LSM + MVCC) — see Ch.25-G
- **Systems capstone C:** a Raft-backed replicated state machine — see Ch.25-G
- **Systems capstone D:** a zero-copy ETL and streaming data plane — see Ch.25 (Ch.43)
- **AI capstone:** a production RAG pipeline with incremental re-ingestion, evaluation harness, and cost/latency SLOs
- **Benchmarking methodology (apply to every capstone benchmark):** warm-up vs steady-state, report percentiles (p50/p95/p99) not averages, correct for **coordinated omission**, use representative/skewed (not uniform-toy) data, and commit a repeatable harness measured against a stated baseline; know the standard suites — **TPC-H / TPC-DS / TPC-DI** and **ClickBench** — and what each stresses (cross-ref the capstone rubric's benchmark requirement, point 4 below)

### Capstone completion rubric (apply to every capstone — this is the pass bar)
A capstone is "done" only when all six hold:
1. **Design doc:** problem statement, ≥3 alternatives considered with explicit trade-offs, chosen design justified, estimated cost/latency/throughput before building.
2. **Reproducibility:** code + scripts run end-to-end from a clean checkout on Linux; README with one-command setup; seeded/synthetic data generator included.
3. **Failure injection:** ≥5 named failure scenarios (crash mid-write, duplicate, late/out-of-order, dependency slow/down, partition/network loss) each with an automated test proving correct recovery.
4. **Benchmarks:** throughput and p50/p95/p99 latency, resource profile (CPU, memory high-water, allocation/IO), measured against a stated baseline; results reproduced with a committed benchmark script.
5. **Observability:** structured logs, metrics, and a dashboard; one worked incident walk-through (symptom → metric → log → root cause).
6. **Defense:** can answer "why this and not X?" for every major choice, and explain the dominant cost lever and the next bottleneck.

## Chapter 19 — Career, Positioning, and Compensation (turning mastery into millions)
### 19.1 Choosing a high-leverage specialization
- Streaming/real-time infra specialist (Kafka/Flink internals, exactly-once systems)
- Database/storage-engine specialist (contributes to or builds OLTP/OLAP engines)
- Lakehouse/table-format specialist (Iceberg/Delta committer-level depth)
- AI data infra specialist (RAG/vector/feature-store systems) — currently the hottest and best-paid niche
- Platform/infra specialist (Kubernetes-native data platforms, FinOps for data)

### 19.2 Building visible proof of mastery
- Public portfolio of systems built from first principles (not tutorials) — the capstones above, documented with benchmarks and failure analysis
- Open-source contributions to high-visibility projects (Spark, Kafka, Flink, Airflow, Iceberg, DataFusion, Arrow, dbt)
- Technical writing: deep-dive blog posts on internals, published benchmarks, post-mortems
- Conference talks and meetups (data engineering, systems, and AI-infra conferences)

### 19.3 Interview and negotiation mechanics
- System design interview mastery (use the Ch.15 method live, under time pressure)
- Behavioral and leadership-principle interviews (increasingly decisive — at Amazon, often half the loop):
  - **STAR method** (Situation, Task, Action, Result) — structure every story; lead with the result and quantify impact
  - **Amazon Leadership Principles** (Ownership, Dive Deep, Bias for Action, Deliver Results, Earn Trust, Disagree and Commit, …) — map each story to one or more principles; expect deep follow-ups probing *your* specific decisions, failures, and lessons
  - **Story bank:** prepare 6–10 reusable STAR stories (a proud result, a failure you caused, a conflict, an ambiguous problem, a tight deadline, a time you changed your mind) — each reusable across several principles
  - **Project deep-dive / resume walkthrough:** narrate one project end to end — architecture, *your* specific contribution, trade-offs, what you'd do differently (ties to the Ch.18 capstone defense)
- Compensation negotiation: leveling calibration, competing offers, total-comp structure (base/bonus/equity), refresh cycles
- Staff/Principal/Distinguished Engineer trajectory: scope of influence, cross-team technical leadership, writing architecture RFCs

### 19.4 Beyond employment: scaling earnings further
- High-end consulting/fractional staff data-engineer rates for scale-ups
- Building and selling a data-infra product or OSS-with-commercial-support company
- Technical advisory/board roles once a recognized specialization is established

### 19.5 Stakeholder management and requirements elicitation (the non-technical multiplier)
- **Translating business needs into data requirements:** running the Ch.15 requirements-gathering checklist *with* non-technical stakeholders; separating stated wants from the underlying decision the data must support
- **Working across the org:** partnering with analysts, PMs, domain owners, and compliance/legal; reverse-Conway alignment of teams to data-product boundaries (cross-ref Ch.13.4)
- **Communicating trade-offs upward:** explaining cost/latency/correctness trade-offs and the dominant cost lever to a non-technical audience; justifying "boring" choices
- **Negotiating and owning data contracts:** driving producer/consumer agreements, managing breaking-change rollouts and deprecations, setting and defending SLAs
- **Writing for different audiences:** ADRs and design RFCs (cross-ref Ch.18), incident write-ups/post-mortems, executive summaries vs engineering deep-dives

## Chapter 20 — Self-Assessment Question Bank
Answer every question out loud or in writing, from first principles, with a concrete example and a failure mode. If you cannot, you have found your next lab. These span the categories companies actually probe (modeling, warehousing, ETL, Python, SQL, ingestion/APIs, queues/caches, processing, storage, platforms, systems, AI).

### Fundamentals, modeling, and warehousing
- Explain conceptual vs logical vs physical data models with one example each.
- OLTP vs OLAP: what changes in schema, storage layout, and indexing, and why?
- Normalize a denormalized table to BCNF, then argue when you'd denormalize it back.
- When is a star schema the wrong choice? When would Data Vault earn its complexity?
- Implement SCD Type 2 correctly: what are the failure modes with late-arriving data?
- What is a surrogate key and why not just use the natural key?
- What is a slowly-changing fact, and how do accumulating-snapshot facts handle it?
- Why can the same metric compute differently in two dashboards, and how does a semantic layer fix it?

### ETL / ELT / ingestion
- ETL vs ELT: what shifted the industry toward ELT, and when is ETL still right?
- Full load vs incremental load: design a watermark-based incremental extract with late corrections.
- How do you make an ingestion job idempotent and resumable after a mid-run crash?
- Design API ingestion against a paginated, rate-limited endpoint with retries and auth refresh.
- Webhook ingestion: how do you guarantee no loss and no duplicates under redelivery?
- What is data staging and why does a raw/bronze immutable layer matter?

### SQL execution
- Why can a logically equivalent SQL query have a radically different physical plan?
- When does a composite index fail to help?
- What causes a hash join to spill?
- How do stale statistics affect cardinality estimation?
- How would you optimize a top-N-per-group query over billions of rows?
- Write a recursive CTE for a bill-of-materials explosion with cycle detection.
- When do window functions beat self-joins, and what's the cost of the sort?
- NOT IN vs NOT EXISTS vs LEFT JOIN ... IS NULL with NULLs present — which is correct and fast?

### Databases
- Explain MVCC and how vacuum relates to it.
- Demonstrate a write-skew anomaly.
- What consistency does a read replica provide?
- When would an LSM tree outperform a B-tree?
- What happens during replication lag?

### Spark
- What exactly creates a stage boundary?
- Why does a shuffle hurt performance?
- How would you diagnose skew from Spark UI evidence, and fix it three ways (salting, AQE, broadcast)?
- When does a broadcast join become dangerous?
- Why can increasing executor memory fail to solve a slow job?

### Kafka / streaming
- Why are offsets separate from the messages themselves?
- How does consumer-group rebalancing affect processing?
- How does log compaction differ from retention?
- How would you guarantee deterministic downstream results under duplicates?
- How would you replay only one partition/time range?

### Data architecture
- How do you choose between warehouse, lake, and lakehouse?
- When should a pipeline be batch rather than streaming?
- How would you design a five-year backfill without overwhelming production systems?
- How do you guarantee data correctness across CDC + streaming + batch?
- What is the smallest architecture that satisfies a given SLA?

### Cloud
- How would you design private connectivity for a data platform?
- What are the largest cloud cost drivers for Spark?
- How would you enforce least privilege across raw and curated data?

### Systems/Rust
- Why does an owning pipeline naturally produce backpressure while a clone-heavy pipeline does not?
- What is the difference between epoll-based and io_uring-based I/O, and when does the difference matter?
- Why can a correct Raft implementation still produce stale reads at the follower?
- What is the actual cost difference between a B-tree and an LSM-tree under write-heavy load, measured, not assumed?

### AI data infrastructure
- What are the failure modes of a naive RAG pipeline, and how do production systems mitigate them?
- Design a cost-aware embedding strategy for a 1B-document corpus; where are the cost levers?
- How do you detect and prevent retrieval drift in a continuously updating RAG system?
- What is the latency SLO for a production RAG system, and how does it break down (retrieval + LLM + network)?

### Europe/Industrial
- How would you design a data platform for a German manufacturing plant with GDPR, SAP integration, and on-prem+cloud constraints?
- What are the implications of data residency requirements for a lakehouse architecture?
- How does the works council or data protection officer role shape data governance decisions?

### Orchestration
- When is Temporal's durable-execution model superior to Airflow's DAG model?
- Design a long-running approval workflow in Temporal vs Airflow; where do the operational costs diverge?

### Graph systems
- What is the difference in query optimization between graph databases and relational stores for deep traversals?
- Design an operational supply-chain-provenance graph; measure traversal latency under concurrent updates

### AWS advanced
- What is the cost breakdown of a Glue job vs Spark job vs Lambda for an incremental CSV ingest?
- Design multi-team access control for a data mesh using Lake Formation; audit trail for compliance
- How would you detect schema drift in an incremental ingest pipeline? Design a remediation workflow
- Compare Step Functions + Glue vs Airflow for orchestrating a 10-step data pipeline; what are the operational trade-offs?
- How do you version and archive data for long-term reproducibility while keeping ingest costs low?

### Python for data engineering
- When does the GIL actually hurt you, and what are the three ways around it?
- Generators vs lists for a 100 GB file: show the memory difference and when generators break.
- How does Arrow enable zero-copy hand-off between Python and a native engine?
- Design a resilient HTTP client: timeouts, retries with jitter, circuit breaker, idempotency keys.
- How do you unit-test a transformation and property-test it for invariants?
- *Applied warm-ups (the easy/medium coding you'll actually get asked first — be fluent, don't over-invest):* dedupe a list preserving order; parse and flatten nested JSON; sum the digits of an integer; group/aggregate records into a dict; traverse a tree (BFS/DFS) and invert it; two-pointer / sliding-window over a sequence

### File formats and serialization
- Parquet vs Avro vs ORC vs JSON: pick one per scenario and justify (scan-heavy, schema-evolving, streaming).
- How does Parquet predicate pushdown + column stats skip data, and when does it fail to help?
- Explain Avro schema-evolution compatibility modes (backward/forward/full) with a breaking example.
- Snappy vs Zstd vs Gzip: ratio/CPU/splittability trade-offs for a Spark read.

### Message queues, caches, and serving
- Queue (SQS/RabbitMQ) vs log (Kafka): which gives replay, which gives per-message ack, and when do you need each?
- Design a cache-aside layer; show how a cache stampede happens and three ways to prevent it.
- How do you keep a cache consistent with the system of record? What breaks under write-heavy load?
- Model a high-write access pattern in DynamoDB/Cassandra; how do you avoid a hot partition?

### Distributed processing and streaming
- Event time vs processing time: design watermarks for 2% late data with a correctness guarantee.
- Prove exactly-once-effect end to end across a source, a stream processor, and an idempotent sink.
- Design heavy-hitters/top-K over a firehose using Count-Min Sketch; bound the error.

### Storage, platforms, and warehouses
- Snowflake micro-partitions vs Redshift distribution/sort keys vs BigQuery partition/cluster: tune the same query on each.
- What makes object storage different from a distributed filesystem, and how does that shape lakehouse design?
- Design cross-region DR for a data platform: state RPO/RTO and the cost of each 9.

### Operations, governance, and security
- A table is 6 hours stale at 3am — walk the incident from alert to root cause to prevention.
- Implement GDPR erasure across a lakehouse with time travel and immutable backups — where is it hard?
- Envelope encryption with a KMS: what exactly is encrypted with what, and how does key rotation work?
- Design row-level + column-level security enforced in the query engine, not the app.

### Behavioral and leadership (STAR — rehearse out loud, quantify every result)
- Tell me about yourself / walk me through a project you owned end to end.
- A result you're proud of — what was *your* specific contribution and its measured impact?
- A decision of yours that caused a critical failure — what happened, how did you respond, what did you change afterward?
- A time you worked under high ambiguity or a hard deadline; a conflict with a stakeholder and how you resolved it.
- Map each story to a leadership principle (Ownership, Dive Deep, Earn Trust, Deliver Results) and expect "why did you do that?" follow-ups.

## Chapter 21 — Learning Schedule and Specialization Tracks
### 21.1 Suggested weekly schedule
| Day | Focus |
|---|---|
| Mon | Deep theory + notes; reproduce one internal behavior |
| Tue | Implementation experiment |
| Wed | SQL/Spark/database performance lab |
| Thu | Architecture/design exercise |
| Fri | Cloud/Kafka/lakehouse lab |
| Sat | Long-form project implementation + benchmarking |
| Sun | Review, write-up, teach-back, one timed design |

Target: 15–20 hours/week. If time is constrained, preserve the implementation/experiment ratio — reduce breadth before reducing hands-on depth.

### 21.2 Specialization tracks (prioritize once foundations are solid)
Everyone does Ch.1–6 (foundations + storage), Ch.7–9 (compute + movement), Ch.13–15 (operations, theory, design), and Ch.19 (career). Then specialize:

- **Streaming / real-time infrastructure specialist** — Priority: Ch.9, Ch.6.4, Ch.25-E (Kafka/Raft), Ch.11, Ch.17, Ch.18 streaming capstones. Deprioritize: graph, GPU, EU-specific (unless targeting that market). Target roles: Confluent/streaming platform, real-time analytics.
- **Database / storage-engine specialist** — Priority: Ch.5, Ch.25-D (storage internals), Ch.25-G capstone B/C, Ch.6, Ch.17. Deprioritize: reverse ETL, BI. Target roles: OLTP/OLAP engine teams, TiKV/CockroachDB/ClickHouse-style companies.
- **Lakehouse / table-format specialist** — Priority: Ch.2, Ch.6 (all), Ch.8, Ch.3, Ch.13. Target roles: Databricks/Iceberg/Delta committer-level depth.
- **AI data-infra specialist** (hottest/best-paid) — Priority: Ch.17.1/17.1.1/17.1.5, Ch.5.6 (sketches), Ch.9, Ch.18 AI capstone. Target roles: RAG/vector/feature-store systems at AI companies.
- **Platform / infra specialist** — Priority: Ch.10, Ch.11, Ch.12, Ch.13.4, Ch.25 (systems). Target roles: Kubernetes-native data platforms, internal developer platforms, FinOps.

Each track: ~4–8 months of focused depth after the ~6-month common core. Map every track to its mastery gates (Ch.22) and compensation ladder (Ch.19).

## Chapter 22 — Mastery Gates
| Area | Mastery condition |
|---|---|
| Foundations | Can state the latency hierarchy, pick the right data structure for a workload, and reason about I/O/network cost over CPU |
| SQL | Can inspect an execution plan, predict bottlenecks, and validate an optimization with measurements |
| Databases | Can explain storage, indexing, MVCC, isolation, replication, and consistency trade-offs; can model for NoSQL by access pattern and design a correct cache layer |
| Modeling | Can design a warehouse/lakehouse model with explicit grain and historical semantics; can justify normalized vs dimensional vs Data Vault |
| Ingestion/formats | Can build an idempotent, resumable incremental ingest and choose the right file format/compression with evidence |
| Scale algorithms | Can pick and implement the right probabilistic structure (HLL/Bloom/CMS/t-digest) with a stated error bound |
| Python | Can build memory-bounded, tested, observable ingestion/processing components |
| Systems/Rust | Can build a durable storage engine component and reason about ownership, concurrency, and zero-copy I/O |
| Spark | Can diagnose shuffle, skew, partitioning, memory, and join problems using evidence |
| Kafka/streaming | Can explain partitions, replication, offsets, consumer groups, replay, and delivery semantics |
| CDC | Can design snapshot + change-stream ingestion with deletes, ordering, and replay |
| Lakehouse | Can explain Parquet internals and transactional table formats |
| Cloud | Can design secure, scalable, cost-aware architecture on AWS, Azure, and GCP |
| AWS Advanced | Can design a multi-team data mesh with Lake Formation, cost-optimize Glue jobs, and orchestrate via Step Functions |
| Operations | Can detect, diagnose, and recover from pipeline/data incidents |
| AI data infra | Can design and operate a production RAG/vector pipeline with cost and latency SLOs; understands feature stores and train/serve skew |
| System design | Can run any Ch.15 catalog prompt end-to-end in 45 minutes with estimates, failure modes, and trade-offs |
| Capstone | Passes the six-point capstone rubric: design doc, reproducibility, failure injection, benchmarks, observability, defense |
| Career | Has a public portfolio, at least one OSS contribution, and can run a system-design interview end to end |
| DSA | Can implement every core structure/algorithm from scratch, state its complexity, recognize the pattern behind a problem, and map it to the data-system mechanism it powers (Milestone 10) |

## Chapter 23 — Intentionally De-emphasized Topics
- Basic Python syntax, functions, classes, elementary data structures
- Basic Git commands and introductory Linux
- Beginner SQL SELECT/JOIN exercises beyond quick revision
- Generic CRUD application development
- Memorizing cloud-service catalogs without understanding architecture
- Large amounts of easy LeetCode-style programming practice
- Tool-specific tutorials without understanding the underlying system
- Notebook-only projects that cannot be reproduced or tested

**Caveat for interviews:** these are de-emphasized for *mastery*, not ignored. Simple practical Python (dedup, JSON parsing, basic DSA) and basic SQL still show up as interview *warm-ups* (see the applied-warm-ups and behavioral items in Ch.20). Be fluent in them — just don't spend your limited time there instead of on the fundamentals above.

## Chapter 24 — The Learning Philosophy
For every new technology, ask four questions:
1. What problem does it solve?
2. What is happening under the hood?
3. What failure mode does it introduce?
4. What alternative could solve the same problem?

Progression: **concept → controlled experiment → implementation → failure injection → measurement → architecture trade-off → explanation.**

If you can answer those four questions for a technology, you are learning the system rather than memorizing a tool — and that is precisely the difference between an average data engineer and the data engineers companies pay the most to hire.

## Systems in Production — Milestone 8: the cross-company pattern (the real takeaway)
Every system in this syllabus's Systems-in-Production sections was built because an existing off-the-shelf tool hit a wall at a company's specific scale or workload. Read each primary source; the citations are the actual engineering papers/posts, not secondary retellings. For each, know: the forcing problem, the core design decision, the trade-off accepted, the scale at launch, and what it influenced afterward.

Notice the recurring shape across all twenty-plus systems:
1. **A specific, measurable limit was hit** (not "we felt like building something") — a latency SLA, a write-amplification number, a consistency bug, an operational-ownership gap.
2. **One core trade-off was consciously accepted** — availability over consistency (Dynamo), latency over flexibility (Hive), write-path complexity over read-path mutability (Hudi/Iceberg/Delta), infrastructure cost over consistency compromise (Spanner).
3. **The abstraction, not the implementation, is what spread** — Bigtable's data model outlived Google's specific C++ implementation (becoming HBase); Kafka's log abstraction outlived its original Scala codebase's internals; MillWheel's watermark concept outlived MillWheel itself, surviving as Beam/Flink/Spark semantics.

- *Exercise*: pick one system from any Systems-in-Production section, find its current (2026) equivalent open-source or managed product, and write one page on what changed and what didn't — this is the single highest-leverage reading exercise in this syllabus, because interviewers at infra companies routinely ask "tell me about a system whose design you admire and why," and a first-hand answer grounded in the primary paper is immediately distinguishable from a Wikipedia-level answer.

---

