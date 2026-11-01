# OUTLINE: Flink CDC pipelines (`de.flink-cdc-pipelines`)

## Learning outcomes
1. Write a Flink CDC YAML pipeline from a source database to a lakehouse or OLAP sink.
2. Explain its parallel lock-free snapshot as the same watermark idea generalized to parallel
   readers.
3. Choose between Flink CDC and Debezium plus Kafka for a given set of consumers and say what
   is given up.

## Engagement arc
- Hook: step 1 (a team runs Debezium, Kafka and a sink connector to copy one database into
  Iceberg, and spends more time on the middle than on the data).
- Predict: step 2, within the first four steps (does skipping Kafka also skip the lock-free
  parallel snapshot read); step 10 (what does adding a second sink actually require).
- Takeaways: step 4 (the same source family can mature at two different speeds inside the same
  release), step 8 (removing the middle also removes whatever else was going to read from it),
  step 9 (recap: this path trades a shared log for simplicity, not the other way around).

## Steps (storyboard)

### 1. Hook
- **fig:** a team runs Debezium, Kafka and a sink connector to copy one MySQL database into
  Iceberg, and spends more time on the middle than on the data.
- **On screen:** two diagrams, five boxes against two.

### 2. Predict
- **fig:** skipping Kafka and a broker entirely. Does that also mean giving up the lock-free,
  parallel snapshot read, or is that part independent of Kafka?
- **Options:** (a) giving up Kafka also gives up the lock-free parallel read [wrong — the two
  are unrelated mechanisms]; (b) independent, since the parallel read lives in the source, not
  downstream of it [correct].

### 3. Reveal — the parallel lock-free snapshot
- **fig:** the source reads a snapshot in parallel, checkpoints at chunk granularity, and needs
  no global read lock before reading — the same watermark idea, generalized to parallel
  readers.
- **Moves:** several reader lanes each advancing through their own chunk of the snapshot at
  once.

### 4. Reveal — PostgreSQL's own version is experimental
- **fig:** for PostgreSQL, this same incremental snapshot reading is marked experimental and
  off by default — unlike MySQL, where it's already the standard path.
- **takeaway:** "The same source family can mature at two different speeds inside the exact
  same release."

### 5. Reveal — the log read straight into Flink
- **fig:** the source embeds the connector engine directly inside a Flink source operator,
  reading the log in the job's own parallel readers, with Flink's own checkpoints holding the
  position.
- **Narrator's line of thought:** she names what moves inside the job itself, setting up the
  YAML pipeline that wraps it.

### 6. Reveal — one YAML file, several possible sinks
- **fig:** a source, sink and pipeline block in one YAML file, submitted to a cluster, can
  write to a lakehouse, a warehouse, a search index or several other sinks directly.
- **Moves:** one file expanding into three labelled blocks, each pointing to a different sink
  icon.

### 7. Reveal — schema changes, declared not coded
- **fig:** schema changes are handled by one of five named modes, chosen declaratively, rather
  than the manual column-by-column handling an earlier topic measured by hand.
- **Moves:** five small labelled tiles, one highlighted as the chosen mode.

### 8. Reveal — what this path gives up
- **fig:** fewer moving parts, no broker to run — but no shared durable log either. A second
  consumer, a replay, or a different sink later means reading the source again.
- **takeaway:** "Removing the middle also removes whatever else was going to read from it."

### 9. Recap
- **fig:** a lock-free parallel snapshot, a log read straight into Flink, one YAML file for the
  whole path, declarative schema handling — and no shared log for anyone else.
- **takeaway:** "This path trades a shared log for simplicity, not the other way around."

### 10. Prove it
- **fig:** a team wants two different sinks, a lakehouse and a search index, from the same
  source table. Under Flink CDC, what does adding the second sink actually require?
- **predict options:** (a) adding a second sink block to the same running pipeline, nothing
  more [wrong — that's two sinks inside one pipeline, not a second independent consumer]; (b)
  a second job reading the source database again [correct].

## Post-notes headings
- **Internals:** this topic has no lab of its own; every claim is quoted or named from Flink
  CDC's own current documentation, with the parallel lock-free mechanism already measured
  directly by an earlier topic's own implementation.
- **Production:** choosing Flink CDC for a pipeline that will soon need a second consumer, and
  assuming PostgreSQL's incremental snapshot behaves the same as MySQL's, as the two concrete
  failure shapes this topic exists to prevent.
- **Frontier:** Flink's own runtime, checkpoints, state and Flink SQL, and Paimon and Fluss as
  streaming storage, named only, since they are Chapter 9's own subject.
- **Where this goes next:** whichever way the changes get here, an analytical table has to
  apply them — the next topic is how, and what that costs the lakehouse and the warehouse.

## Concept ledger
- **Introduces:** `flink-cdc-kafkaless-pipeline`.
- **Uses:** `watermark-window-incremental-snapshot`, `debezium-architecture-envelope`,
  `cdc-schema-evolution-resnapshot`, `cdc-exactly-once-caveats` — all confirmed live via the
  registry-parsing script.
- **Declared:** Flink as a stateful stream processor with checkpoints (Chapter 9 teaches it).

## Changes from the chapter plan
This topic has no lab of its own, exactly as CHAPTER.md's own "Lab" line states: a Flink CDC
run is sourced-only without a running Flink cluster, and the lock-free chunked read is already
reproduced by an earlier topic's own measured implementation against this sandbox's real
PostgreSQL cluster. No `examples.py` exists for this topic; every claim traces directly to
Flink CDC's own 3.7 documentation, fetched and quoted word for word in `SOURCES.md`.

## Claims list (for fact-check)
1. JDK and Flink version requirements, and YAML submission via `flink-cdc.sh` — SOURCES.md
   (Welcome to Flink CDC); named only.
2. The three lock-free, parallel, chunk-checkpointed properties, and the `server-id` range —
   SOURCES.md (MySQL CDC Source); named directly in the reveal and predict.
3. PostgreSQL's incremental snapshot reading marked experimental and off by default — SOURCES.md
   (Postgres CDC Source); named directly in the reveal.
4. The five schema-change behaviors — SOURCES.md (Schema Evolution); named directly in the
   reveal.
5. The full pipeline sink list — SOURCES.md (Data Pipeline, Iceberg pipeline connector); named
   directly in the reveal.
