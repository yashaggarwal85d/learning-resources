# Change log — de-m2 (Data Engineering Milestone 2: Chapters 5–6 + Systems in Production; original.md lines 199–350)

## Corrections
- **Aurora case study:** the original stated "up to ~5x the write throughput of stock MySQL" as a paper result. It is AWS marketing. The SIGMOD 2017 paper's argument is reduced network I/O: redo-only shipping, 6 copies across 3 AZs, 4/6 write and 3/6 read quorums. The rewrite gives the mechanism and labels the 5x figure as a vendor claim. Added the citation (2017, Verbitski et al., SIGMOD).
- **Dynamo → DynamoDB:** the original implied that DynamoDB directly continues the Dynamo design. Per the USENIX ATC 2022 paper, DynamoDB partitions are leader-based Multi-Paxos groups, not leaderless. This is now a separate case study, and the §5.3 consensus topic says so too.
- **"Managed (Databricks/Tabular) vs open":** Tabular no longer exists as an independent vendor because Databricks acquired it in June 2024. The choosing-a-format topic now states this as history.
- **Delta on S3 commits:** the original did not mention it. Before S3 had conditional writes, Delta's put-if-absent commit needed a DynamoDB LogStore or single-writer mode on S3. Delta case study and §6.3.2 corrected to say so.
- **XID wraparound, MVCC families:** the original treated MVCC as Postgres-only. Added the undo-log family (InnoDB/Oracle), which behaves differently under long reads.
- **Isolation naming traps:** added the facts that Postgres `REPEATABLE READ` = SI, Oracle `SERIALIZABLE` = SI, and InnoDB RR mixes snapshot and locking reads. Graders and interviewers test these, and the original's anomaly mapping did not cover them.
- **Iceberg delete encodings:** clarified that v3 replaces position-delete files with deletion vectors (Puffin blobs, at most one per data file) and that v4 drafts prohibit new equality deletes. Source: https://raw.githubusercontent.com/apache/iceberg/main/format/spec.md
- **Systems in Production metadata:** added (year, authors, venue) to every case study, as the spec requires. TAO: 2013, Bronson et al., USENIX ATC. Bigtable: 2006, OSDI. Dynamo: 2007, SOSP.

## Currency updates (with source URLs)
- Iceberg v3 is complete and adopted. It adds nanosecond timestamps, `unknown`, `variant`, `geometry`, `geography`, default values, multi-argument transforms, row lineage, binary deletion vectors and table encryption keys. v4 is under development: relative paths, no new equality deletes. https://raw.githubusercontent.com/apache/iceberg/main/format/spec.md
- Iceberg 1.11 (May 2026) brought server-side scan planning in REST and v4 groundwork. Iceberg docs list 1.12.0 as the latest release. https://iceberg.apache.org/blog/apache-iceberg-1.11.0-release/ ; https://www.snowflake.com/en/blog/engineering/apache-iceberg-1-11-new-features-fixes/
- Iceberg v4 single-file commits / adaptive metadata tree: still a proposal, and Delta has proposed converging on it. https://datalakehousehub.com/blog/iceberg-v4-state-july-2026/ ; https://www.databricks.com/dataaisummit/session/format-co-evolution-how-iceberg-v4-and-delta-50-share-unified-metadata
- Iceberg REST catalog endpoints: plan/tasks (scan planning), credentials, sign, transactions/commit, views, functions, metrics. The OAuth2 tokens endpoint is deprecated for removal. https://raw.githubusercontent.com/apache/iceberg/main/open-api/rest-catalog-open-api.yaml
- Delta Lake 4.0 (Sept 2025): catalog-managed tables preview (the successor to coordinated commits), Variant, Delta Kernel advances. https://delta.io/blog/2025-09-25-delta-lake-40/
- Delta 4.2 (Apr 2026): synchronous UniForm, Variant shredding out of preview, geospatial types, collations. https://delta.io/blog/2026-04-17-delta-4-2-released
- Delta 4.3 (Jun 2026): all catalog-managed table operations go through the UC Delta APIs; IcebergCompatV3 is experimental. https://delta.io/blog/2026-06-22-delta-4-3-release
- Delta 4.4: supports Spark 4.0–4.2 and adds identity columns. https://newreleases.io/project/github/delta-io/delta/release/v4.4.0
- Hudi 1.0 (Dec 2024): LSM timeline, NBCC, secondary and expression indexes, partial updates. https://hudi.apache.org/blog/2024/12/16/announcing-hudi-1-0-0
- Hudi 1.1 (Nov 2025): pluggable table-format framework, partitioned record index, partition-level bucket index. https://hudi.apache.org/blog/2025/11/25/apache-hudi-release-1-1-announcement ; https://release-catalog.apache.org/hudi/1.1.1/index.html
- Apache Polaris: top-level project since Feb 2026; 1.4 added multi-tenancy storage scoping. https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/ ; https://www.snowflake.com/en/engineering-blog/apache-polaris-1-4-release/
- Apache Gluten: top-level project since Mar 2026. https://news.apache.org/foundation/entry/the-apache-software-foundation-graduates-two-open-source-projects-from-incubator
- DataFusion Comet 1.0 released Aug 2026. https://datafusion.apache.org/blog/2026/08/07/datafusion-comet-1.0.0
- DuckLake 1.0 released Apr 2026 alongside DuckDB 1.5.2: data inlining, Iceberg-compatible Puffin deletion files. https://duckdb.org/2026/04/13/announcing-duckdb-152 ; https://ducklake.select/media/ducklake-10/
- DuckDB: 1.4 is the LTS line, 1.5 is current (1.5.5, Jul 2026), and 2.0 with client-server mode was previewed in Aug 2026. https://duckdb.org/2026/08/17/duckdb-20-highlights.html ; https://www.endoflife.date/duckdb
- Apache Fluss graduated in Jul 2026. Paimon is on the 1.4.x line. https://incubator.apache.org/projects/fluss.html ; https://index.scala-lang.org/apache/paimon/artifacts/paimon-spark-ut/1.4.2
- Apache XTable is still incubating; no graduation found. https://incubator.apache.org/projects/xtable.html
- Unity Catalog OSS: LF AI & Data, Apache-2.0, Iceberg REST and HMS interfaces. The Delta 4.3 example uses the UC Spark connector 0.5.0. https://github.com/unitycatalog/unitycatalog ; https://delta.io/blog/2026-06-22-delta-4-3-release
- S3 conditional writes: `If-None-Match` in Aug 2024, bucket-policy enforcement of if-match/if-none-match in Nov 2024. https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes ; https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-enforcement-conditional-write-operations-general-purpose-buckets ; https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html
- S3 Tables (re:Invent 2024) do managed compaction, with sort and z-order compaction added in Jun 2025. https://aws.amazon.com/about-aws/whats-new/2025/06/amazon-s3-sort-z-order-compaction-apache-iceberg-tables/
- Kafka 4.2 (Feb 2026): share groups (KIP-932) are production-ready, which is relevant to the queue-vs-log topic. https://kafka.apache.org/blog/2026/02/17/apache-kafka-4.2.0-release-announcement/
- Redis 8 added AGPLv3 (May 2025). Valkey (BSD, Linux Foundation) is on the 9.x line. https://www.infoq.com/news/2025/05/redis-agpl-license ; https://www.phoronix.com/news/Redis-8.0-Goes-AGPLv3
- PostgreSQL 18 (Sept 2025): async I/O (worker/io_uring), B-tree skip scan, uuidv7. PG19 GA is scheduled for 29 Oct 2026, so the syllabus does not cite it yet. https://www.phoronix.com/news/PostgreSQL-18-Released ; https://www.postgresql.org/message-id/5eae7bd1-c5cb-4148-8590-3fd3f7c6cd65%40postgresql.org
- Aurora DSQL GA on 27 May 2025, with an OCC design (adjudicator/journal). https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-aurora-dsql-generally-available ; https://brooker.co.za/blog/2024/12/05/inside-dsql-writes/
- Databricks–Neon (May 2025) and Lakebase (Jun 2025); Snowflake–Crunchy Data (Jun 2025). https://neon.com/docs/introduction/neon-and-lakebase ; https://siliconangle.com/2025/06/11/following-neon-acquisition-databricks-launches-serverless-lakebase-database/ ; https://snowflake.com/en/news/press-releases/snowflake-acquires-crunchy-data-to-bring-enterprise-ready-postgres-offering-to-the-ai-data-cloud/
- Snowflake Gen2 standard warehouses are GA. Adaptive Compute was announced in Jun 2025 (preview). https://www.snowflake.com/en/news/press-releases/snowflake-unveils-next-wave-of-compute-innovations-for-faster-more-efficient-warehouses-and-ai-driven-data-governance/ ; https://snowflake.com/en/engineering-blog/gen2-warehouses-snowflake-multicloud-ga
- BigQuery: the Storage Write API replaces legacy `insertAll` streaming. Editions use autoscaling reservations billed on scaled slots. BigLake metastore offers an Iceberg REST catalog. https://docs.cloud.google.com/bigquery/docs/write-api ; https://cloud.google.com/bigquery/docs/slots-autoscaling-intro ; https://cloud.google.com/bigquery/docs/blms-rest-catalog
- Redshift: append-only Iceberg writes GA in Nov 2025 (read GA in Nov 2023). Interleaved sort keys are still documented and not deprecated. https://aws.amazon.com/about-aws/whats-new/2025/11/aws-redshift-iceberg-writes-m1 ; https://docs.aws.amazon.com/redshift/latest/dg/t_Sorting_data-interleaved.html
- Parquet: Variant logical type and shredding spec; GEOMETRY/GEOGRAPHY logical types. https://parquet.apache.org/docs/file-format/types/variantshredding/
- Next-gen formats: the Vortex file format has been stable since 0.36 (LF AI & Data); F3 is a research prototype. https://docs.vortex.dev/specs/file-format ; https://github.com/future-file-format/F3
- SAP agreed to acquire Dremio (May 2026); its OSS commitments (Iceberg, Polaris, Arrow) were restated. The syllabus does not cite this; it is context for the Nessie/Polaris landscape. https://www.dremio.com/newsroom/sap-to-acquire-dremio-to-unify-sap-and-non-sap-data-to-power-agentic-ai/

## Added topics
- §5.1: Buffer pool and page replacement; Checkpoints and crash recovery (ARIES vs redo-only); MVCC: append versions vs undo logs (as a reframe); Vacuum, bloat and transaction-ID wraparound (wraparound added); LSM compaction and the RUM trade-off; new §5.1 lab.
- §5.2: Snapshot isolation and write skew (vendor naming traps); Serializability: strict 2PL versus SSI (split out); Sagas, compensation and the outbox pattern; new §5.2 lab.
- §5.3: Multi-leader replication and write conflicts; Distributed SQL architecture (CockroachDB/TiDB/Yugabyte/Aurora DSQL); Compute–storage disaggregated OLTP (Aurora/Neon/Lakebase/Snowflake Postgres); new §5.3 lab.
- §5.5: Inverted indexes and search segments; Cache stampedes and thundering herds (split out); Redis and Valkey internals (licensing); new §5.5 lab.
- §5.6: Sketches as stored, mergeable aggregates (DataSketches, Puffin NDV); xor/ribbon filters, Theta sketches, KLL, Space-Saving folded into existing topics.
- §6.1: Apache Arrow columnar memory format (with C Data Interface); new §6.1 lab.
- §6.2: Variant type and shredding; ORC versus Parquet; Next-generation columnar file formats (Lance, Vortex, Nimble, F3); new §6.2 lab.
- §6.3: Object storage as a database substrate (conditional writes); Why Hive-style tables broke; Optimistic commits and conflict resolution (expanded from a sub-clause); Deletion vectors across formats; Data layout: sorting, Z-order, Hilbert, clustering; Incremental reads and change feeds (row lineage, CDF); new §6.3 lab.
- §6.3.1 Iceberg: Iceberg v3 spec features; Iceberg statistics and Puffin files; Branches, tags and write-audit-publish; Iceberg v4 in development; Iceberg lab.
- §6.3.2 Delta: Delta commit protocol and catalog-managed tables; Delta Lake 4.x and Delta Kernel; Delta lab.
- §6.3.3 Hudi: NBCC, 1.0/1.1 indexes, pluggable format layer; Hudi lab.
- §6.3.4 Open catalogs (new section): Catalogs as commit coordinators; Iceberg REST catalog protocol; Apache Polaris; Unity Catalog OSS; Catalog landscape and multi-engine access (Nessie, Lakekeeper, Gravitino, S3 Tables, BigLake); catalog lab.
- §6.3.5: DuckLake: SQL database as catalog and metadata; Paimon expanded with Fluss; lab.
- §6.4: Arrow Flight, Flight SQL and ADBC (ADBC added); Gluten/Comet in Composable engines; Presto C++/Velox note; engines lab.
- §6.5: Snowflake split into storage and compute/cost; BigQuery split into execution/storage and slots/billing; Warehouses on open table formats; Serverless/auto WLM in Redshift.
- Systems in Production: RocksDB (FAST 2021), DynamoDB (ATC 2022), Memcache at Facebook (NSDI 2013), Dremel (VLDB 2010/2020), Snowflake (SIGMOD 2016), Delta Lake (VLDB 2020, with the CIDR 2021 Lakehouse paper).

## Removed or merged (with reason)
- §5.1 "Pages/blocks, tuples, heap storage, row layout" + "Slotted pages, record headers, checksums" → one reel, Pages, slotted pages and tuple layout. They are steps of one mechanism.
- §5.1 "Columnar storage internals: column chunks, vectors, encodings" → merged into §6.2 (Parquet anatomy and encodings) and §6.1 (Arrow). It duplicated §6.1/§6.2; one home.
- §5.2 "Isolation levels", "Anomalies" and "Non-repeatable reads; read skew…" bullets → restructured into three reels: anomaly taxonomy, SI and write skew, 2PL vs SSI. Removes the triple overlap.
- §5.3 "Primary/replica architectures" + sync/async → one refresher reel.
- §5.3 "Quorum concepts" + "Leader/follower vs leaderless designs" → Leaderless quorums and anti-entropy. Leader-based designs are covered by the sync/async, physical/logical and multi-leader topics.
- §5.3 "CAP theorem", "PACELC" and "Partition tolerance and failure domains" → one reel, CAP and PACELC in practice.
- §5.3 "Consistency models: strong, eventual, causal, session guarantees" → the session-guarantee part is now in Replication lag and session guarantees; formal models are left to Ch.14 to avoid duplication.
- §5.3 consensus bullet: CRDT/idempotency-key and Kafka-log-ordering content removed here. Its homes are Ch.14 and Ch.9, with build depth in → Rust Ch.26–28. What remains is the data-engineering view (Consensus inside data systems).
- §5.4 Build-it-yourself track: four bullets (V1–V4 KV engine, B-tree, Raft RSM, "why this matters") removed as duplicates of Rust Ch.35, Ch.21 and Ch.36. Replaced by a single cross-domain lab with a data-engineering deliverable (benchmark your engine against RocksDB and Postgres). The "why this matters" bullet was motivational filler.
- §5.5 "Partition/hash keys, hot partitions" → merged into Access-pattern-first NoSQL modeling (DynamoDB specifics); generic hot-shard theory lives in §5.3.
- §5.5 "Consistency between cache and system of record; invalidation" → Cache consistency and invalidation (merged with the invalidation half of the caching bullet).
- §5.6 "Accuracy vs memory trade-offs; mergeability…" → folded into each sketch reel, plus the new stored-sketch topic.
- §6.1 "Columnar on disk: Parquet, ORC" → the Parquet part goes to §6.2 anatomy, the ORC part to the new ORC versus Parquet reel.
- §6.1 "Encoding schemes" + §6.2 "Compression and encoding" → one reel (§6.2 Columnar encodings). Duplicate.
- §6.1 "Row vs columnar decision" + §6.2 "Row vs column storage" → one refresher reel in §6.1. Duplicate.
- §6.1 "Small-file problem and compaction; optimal sizing", §6.2 "File size and small-file trade-offs" and §6.3 "Compaction/clustering and the small-file problem" → one reel, Small files, compaction and file sizing (§6.3). Spark output-side control stays in §7.2.
- §6.2 "Column chunks and pages" → into Parquet file anatomy.
- §6.2 "Predicate pushdown, projection pruning", "Statistics and data skipping" and "Row-group vs page-level statistics; bloom filters" → one reel, Data skipping: statistics, page indexes, bloom filters.
- §6.3 "Time travel and snapshot expiration" + Iceberg "Table maintenance" + Delta "VACUUM" → Snapshot lifecycle: time travel to garbage collection. `rewrite_manifests` is kept in the Iceberg metadata reel, `rewrite_data_files` in the compaction reel.
- §6.3 "Partition evolution without rewriting history" → merged into Iceberg Hidden partitioning and partition evolution. It is an Iceberg mechanism; Delta/Hudi alternatives are in the layout reel.
- §6.3 Delta "Deletion vectors" and Iceberg "deletion vectors (v3)" → one cross-format reel. "Change Data Feed" → the cross-format Incremental reads reel plus Delta DML.
- §6.3 Delta "OPTIMIZE + Z-ORDER, liquid clustering" → Data layout reel (shared).
- §6.3 Iceberg "Catalog types and REST catalog…" + the "Choosing" paragraph's catalog list + the "catalog wars" sentence → the new §6.3.4 Open catalogs section and the choosing reel.
- §6.4 "Apache Arrow as the universal in-memory columnar interchange format; Flight" → the format part merged into §6.1 Arrow (duplicate); the transport part kept as Arrow Flight, Flight SQL and ADBC.
- §6.4 Trino bullet: the editorial PrestoDB "momentum" aside was replaced by a factual note on Presto C++ (Prestissimo/Velox).
- §6.5 "Cross-cutting" bullet → Warehouse versus lakehouse engine choice.

## Split topics
- §5.1 "LSM-tree concepts: memtables, SSTables, compaction, write amplification" → LSM trees: write and read paths + LSM compaction and the RUM trade-off.
- §5.1 "WAL and durability; fsync/fdatasync; write barriers" → Write-ahead logging and fsync semantics + Checkpoints and crash recovery.
- §5.1 "MVCC and visibility" / "Vacuuming, bloat, dead tuples" kept as two, each deepened.
- §5.2 "Distributed transaction trade-offs (2PC, sagas)" → Two-phase commit and its blocking problem + Sagas, compensation and the outbox pattern.
- §5.3 "Data sharding / horizontal partitioning" (one long bullet) → Partitioning schemes: range, hash, consistent hashing + Shard keys, hot shards and resharding.
- §5.5 "Caching layers: patterns, TTL/eviction, stampede" → Cache patterns and eviction policies + Cache stampedes and thundering herds.
- §5.6 "Bloom/cuckoo" kept; "MinHash/SimHash/LSH" kept; reservoir sampling broadened to stream sampling.
- §6.1 "Row-oriented binary: Avro, Protobuf" + "Schema evolution across formats" → Row-oriented binary encodings + Schema evolution rules across formats.
- §6.3 (one long section) → §6.3 shared foundations (11 reels) + §6.3.1 Iceberg (7) + §6.3.2 Delta (4) + §6.3.3 Hudi (3) + §6.3.4 Open catalogs (5) + §6.3.5 streaming/alternative formats (2) + §6.3.6 interop and choosing (2). Sub-numbering 6.3.x keeps §6.4 and §6.5 stable for existing cross-references (Ch.10, Rust M8 case studies, Ch.21).
- §6.3 Iceberg "Column-level stats, Puffin files, deletion vectors (v3)" → Iceberg statistics and Puffin files + Iceberg v3 spec features + Deletion vectors across formats.
- §6.3 "Format interoperability and streaming formats" paragraph → Metadata translation: UniForm and XTable + Apache Paimon (+ Fluss) + DuckLake.
- §6.5 Snowflake → storage/pruning + compute/caching/cost; BigQuery → Dremel execution and storage + slots, editions and billing.

## Moved
- Columnar storage internals: §5.1 → §6.2 / §6.1 (single home with the formats).
- Arrow in-memory format: §6.4 → §6.1.
- Small-file/sizing content: §6.1 and §6.2 → §6.3.
- Catalog content: §6.3 Iceberg bullet and "Choosing" paragraph → new §6.3.4.
- Consensus, CRDT and log-ordering depth: §5.3 → references to Ch.14, Ch.9 and → *Rust Systems Engineering* Ch.26–28 (content not duplicated here).
- Candidate move, not executed: "Message queues vs event logs" (§5.5) fits Ch.9 better. It was left in place with a Ch.9 cross-reference so it is not lost between slices; the Ch.9 reviewer may take it.

## Refresher-tagged
- ACID guarantees, precisely stated (§5.2)
- Synchronous, asynchronous and semi-synchronous replication (§5.3)
- Text interchange formats and their traps (§6.1)
- Row vs columnar vs hybrid layouts (§6.1)

## Unverified
- Polaris "generic-table support for non-Iceberg formats" and the RBAC terms (principal roles / catalog roles): from memory of the Polaris 1.0 docs. The fetched graduation and 1.4 posts did not mention them, and the web-search budget ran out before a dedicated check.
- Unity Catalog OSS current release number (only the UC Spark connector 0.5.0 was seen in the Delta 4.3 post); the syllabus avoids naming a UC version.
- Meta Nimble status: no primary source found; kept as a named example only.
- Parquet Variant/GEOMETRY release dates conflict across secondary sources; the syllabus states the features without dates.
- Iceberg 1.12.0 release date: the Iceberg docs navigation lists 1.12.0 as latest, but the date (reported as ~30 Sept 2026) comes only from a vendor blog.
- Aurora "35x transactions / 7.7x fewer I/Os": found only in an AWS 2021 presentation, not confirmed in the paper text, so it is not used.
- Snowflake Adaptive Compute GA status: no GA confirmation found; worded as "adaptive compute" without a GA claim.
- Kept from the original without fresh verification (stable, well-known facts): Dynamo paper scale figures (dropped from the rewrite for brevity), Bigtable "60+ products" (dropped), Snowflake micro-partition size 50–500 MB uncompressed, ClickHouse default granule 8,192 rows, Redis Cluster 16,384 slots.

Topics: before 94 → after 104 (plus Systems in Production case studies 7 → 13; labs 2 → 16)
