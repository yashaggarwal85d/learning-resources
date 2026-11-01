# Fact-check — de.flink-cdc-pipelines

## Claims against sources

1. **"JDK: JDK 11 or later (Flink CDC is built on JDK 11 since 3.6.0); Apache Flink: Flink
   1.20.x or Flink 2.2.x"**
   Source: Flink CDC docs, Welcome to Flink CDC (SOURCES.md quotes 1-2). Direct match. Named
   only, per `pre-notes.md` and `post-notes.md`'s Internals section — this sandbox has no
   running Flink cluster, so the requirement is named, not demonstrated.

2. **"By submitting the YAML file with flink-cdc.sh, a Flink job will be compiled..."**
   Source: Flink CDC docs, Welcome to Flink CDC (SOURCES.md quote 3). Direct match. Named
   directly in the reveal step "one YAML file, several possible sinks."

3. **"(1) source can be parallel during snapshot reading, (2) source can perform checkpoints in
   the chunk granularity during snapshot reading, (3) source doesn't need to acquire global
   read lock (that requires high priority permission) before snapshot reading..."**
   Source: Flink CDC docs, MySQL CDC Source (SOURCES.md quote 4). Direct match. Named directly
   in both the predict step and the reveal step that resolves it — the same parallel,
   lock-free, chunk-checkpointed mechanism topic 14's own implementation already measured
   directly against a watermark window, generalized here to multiple readers.

4. **The `server-id` must be a range whose size is larger than the parallelism, since each
   parallel reader needs a distinct id.**
   Source: Flink CDC docs, MySQL CDC Source (SOURCES.md quote 5). Direct match. Named only, per
   `pre-notes.md` — this detail is not demonstrated since no Flink cluster runs here.

5. **"Incremental Snapshot Reading (Experimental)"** and **"-- experimental feature:
   incremental snapshot (default off)"**
   Source: Flink CDC docs, Postgres CDC Source (SOURCES.md quotes 6-7). Direct match. Named
   directly in the reveal step "PostgreSQL's own version is experimental," read side by side
   with the MySQL CDC Source page's own standard-path framing rather than inferred from a
   single page.

6. **"schema.change.behavior is of enum type, and could be set to exception, evolve,
   try_evolve, lenient or ignore."**
   Source: Flink CDC docs, Schema Evolution (SOURCES.md quote 8). Direct match. Named directly
   in the reveal step "schema changes, declared not coded," which contrasts this declarative
   choice against the manual column-by-column handling an earlier topic in this chapter
   measured by hand.

7. **The documented pipeline sinks include Paimon, Fluss, Kafka, Doris, StarRocks,
   Elasticsearch, MaxCompute, OceanBase, Iceberg and Hudi.**
   Source: Flink CDC docs, Data Pipeline (core concept) and Iceberg pipeline connector
   (SOURCES.md, named only — no quote needed beyond the page's own navigation). Direct match,
   read off the page's own sink listing rather than assembled from memory of what Flink CDC
   "typically" supports. Named directly in the reveal step "one YAML file, several possible
   sinks."

## Predict questions red-teamed

- **Step 2** ("does the snapshot stay lock-free"): the wrong option claims giving up Kafka also
  gives up the lock-free parallel read. Checked against the documentation's own separation of
  concerns directly: the MySQL CDC Source page's three properties describe the source's own
  read behavior, with no dependency on whatever sits downstream of it — a broker, a sink, or
  nothing at all. The two mechanisms are documented in entirely separate places because they
  are entirely separate mechanisms.

- **Step 10** ("Prove it"): the wrong option claims adding a second sink needs only a second
  sink block in the same running pipeline. Checked against the architecture this topic itself
  just described: a single YAML pipeline describes one source read feeding its own job; there
  is no durable log component anywhere in the documented architecture for a second, independent
  consumer to attach to instead of reading the source again. A second sink inside the *same*
  pipeline is a real, supported case — but the question asks about a second, separately-wanted
  destination, which is the genuinely different case this topic's own tradeoff is about.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own two semicolons into three clauses: Flink
CDC 3.x as the Kafka-less path (lock-free parallel chunked snapshots plus binlog/WAL reading
inside Flink); YAML-defined end-to-end pipelines with schema-change propagation into
Paimon/Iceberg/Doris/StarRocks; and when it beats Debezium plus Kafka and what it gives up (no
shared durable log for other consumers). All three are covered — the first by the predict/reveal
pair on the parallel lock-free snapshot plus the reveal on the embedded log read; the second by
the YAML pipeline and schema-modes reveals; the third by the "what this path gives up" reveal,
the recap, and the final predict. No claim here depends on Flink's own runtime, checkpoints,
state or Flink SQL, the incremental-snapshot algorithm's own internals (used, not re-taught),
landing in table formats, or Paimon/Fluss as streaming storage, all named in CHAPTER.md's own
"Leaves out" line and left to Chapter 9. This topic's own "Lab" line is read literally: topic
14's own implementation already reproduces the lock-free chunked read, so no separate
`examples.py` exists for this topic, disclosed here and in `SOURCES.md` and `REVIEW.md` rather
than left unexplained.
