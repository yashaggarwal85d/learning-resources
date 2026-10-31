# Outline — Kafka Streams and the KStream/KTable duality (`de.kafka-streams-ktable-duality`)

12 steps. Predicts at steps 3 and 7 (predicts[0] = step 3, 0-indexed position 2, within ≤3).
Takeaways at steps 5, 9, 11 — none immediately after a predict step (3→4 clear, 7→8 clear).

1. **Hook** — a library, not a cluster — what changes when there's no separate cluster at all?
2. **Setup** — recap: Flink SQL formalised streams as changelogs of dynamic tables, run by a cluster.
3. **Predict** — a library with no cluster of its own — what decides its parallelism?
4. **Reveal: tasks per partition** — one task per input partition, assignment never changes;
   parallelism is bounded by partition count, not instance count.
5. **Reveal: excess instances sit idle** — more instances than partitions just wait, ready to take
   over if a busy one fails. [Takeaway 1]
6. **Reveal: local state stores backed by a changelog topic** — a compacted Kafka topic durably
   backs every local store, the same mechanism topic 6 covered.
7. **Predict: what does a standby replica actually buy on failover?**
8. **Reveal: a standby cuts recovery time** — a warm standby means no full replay from scratch.
9. **Reveal: stream-table duality** — a stream aggregates into a table; a table's own changes read
   back out as a stream — the exact relationship topic 24 generalized into SQL. [Takeaway 2]
10. **Reveal: exactly-once v2 and the rebalance protocol** — v2's efficiency win over v1; the newer
    broker-driven rebalance protocol, still with real feature gaps.
11. **ProveIt** — toy model: task assignment and idle instances, a stream reconstructed from its
    own table, a real recovery-time speedup with a standby. [Takeaway 3]
12. **Recap** — no cluster, a task per partition, state backed by a changelog, the stream-table
    duality at the center of it all.

Takeaways:
5. Running more instances than partitions costs nothing but idle capacity, ready the moment a busy instance fails.
9. A stream aggregates into a table, and a table's own changes read back out as a stream — the same relationship Flink SQL generalized at the SQL level.
11. The toy model's own numbers: parallelism capped by partition count, and a real large recovery-time speedup from a warm standby.
