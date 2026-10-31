# Fact-check — Kafka Streams and the KStream/KTable duality

| Claim | Source | Status |
|---|---|---|
| Kafka Streams uses partitions and tasks as logical units of its parallelism model, based on Kafka topic partitions | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Kafka Streams creates a fixed number of tasks based on input partitions, and the assignment of partitions to tasks never changes | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Kafka Streams is not a resource manager, but a library that runs anywhere its stream processing application runs | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Every stream task may embed one or more local state stores accessed via APIs for stateful processing | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Each state store maintains a replicated, partitioned, log-compacted changelog Kafka topic tracking state updates, purging old data safely | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Standby replicas are fully replicated copies of local state kept to minimize task reinitialization cost on migration | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| There is a close relationship between streams and tables, the stream-table duality, where a stream can be viewed as a table and vice versa | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Kafka Streams models the stream-table duality explicitly via the KStream, KTable, and GlobalKTable interfaces | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Exactly-once v2 (since 2.6.0, requiring broker 2.5.0+) is more efficient than the original implementation, which was deprecated as of 3.0.0 | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| The Streams Rebalance Protocol is a broker-driven rebalancing system (KIP-1071) extending KIP-848's model to Kafka Streams workloads | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| The Streams Rebalance Protocol is enabled by default on new clusters starting with Apache Kafka 4.2, requiring both brokers and clients on 4.2+ | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Warmup task support is not implemented yet in the Streams Rebalance Protocol | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| Kafka Streams uses RocksDB as the default storage engine for persistent stores | Apache Kafka Streams 4.4 docs | Confirmed, quoted verbatim |
| The Confluent Community License change applies to Confluent Schema Registry, REST Proxy, ksqlDB, and some Connectors, excluding use as a competing SaaS offering | Confluent Community License FAQ | Confirmed, quoted verbatim |
| ksqlDB's own repository states it is no longer accepting contributions from the community | confluentinc/ksql CONTRIBUTING.md | Confirmed, quoted verbatim |
| Task assignment caps parallelism at the input partition count, with excess instances sitting idle | Modeled and measured directly in `examples.py` (`assign_tasks`) | Confirmed by the toy model's own real run |
| A stream aggregated into a table reconstructs exactly from that table read back out as a stream | Modeled and measured directly in `examples.py` (`stream_to_table`, `table_to_stream`) | Confirmed by the toy model's own real run |
| A warm standby cuts recovery time by a large factor compared to a full changelog replay | Modeled and measured directly in `examples.py` (`recovery_time_without_standby`, `recovery_time_with_standby`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the Streams Rebalance Protocol's own 4.4 docs page the source for "GA with a limited
  feature set," or is that overstated?** The exact phrase "limited feature set" doesn't appear on
  this page (it was used in topic 5, cited there). This topic's own evidence is the concrete,
  current gap the 4.4 docs do state directly: "warmup task support is not implemented yet" — cited
  as specific evidence rather than repeating topic 5's summary phrase without its own backing.
- **Is ksqlDB's "no longer accepting contributions" claim sourced reliably?** Yes — fetched
  directly from the project's own `CONTRIBUTING.md` in its GitHub repository (the primary source
  for a project's own contribution policy), not a secondary blog post or an outdated FAQ page, and
  cross-checked against the Confluent Community License FAQ's separate, consistent confirmation
  that ksqlDB is covered by that license.
- **Does this topic overstate how settled the rebalance protocol's stateful task placement
  behavior is?** No — post-notes.md's Frontier section explicitly flags its current scope as a
  currency fact to reconfirm, consistent with CHAPTER.md's framing of the protocol as still
  evolving rather than finished.
- **Is the toy task-assignment model realistic, or does it trivially assume the conclusion?** It
  directly implements the sourced mechanism (one task per partition, round-robin distribution
  across instances) and measures the one property claimed: parallelism capped at the partition
  count with excess instances idle. Disclosed as a deliberately simplified toy model, not a port
  of Kafka Streams' actual `StreamsPartitionAssignor`.
- **Does the toy standby-recovery model's large speedup number generalize?** The model's specific
  multiple depends on its own chosen parameters (state size, replay rate, standby lag), not a
  claim about every real deployment's exact recovery-time ratio — the qualitative direction (a
  caught-up standby only replays its own small gap) is the sourced, general claim; the specific
  factor is this run's own measured output, disclosed as such.
