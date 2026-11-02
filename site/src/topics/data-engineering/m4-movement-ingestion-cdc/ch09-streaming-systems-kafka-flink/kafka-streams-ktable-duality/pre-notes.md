## Before this topic

- **task** — Kafka Streams' fixed unit of parallelism, one per input partition, with an assignment that never changes once made.
- **local state store** — an embedded key-value store living on whichever instance owns a task, used for stateful operations like joins and aggregations.
- **standby replica** — a warm, fully replicated copy of a task's state kept on a different instance, ready to shorten recovery on failover.
- **changelog topic** — a compacted Kafka topic that durably backs a local state store by tracking every update to it.
- **stream-table duality** — the relationship where a stream can be viewed as a table and a table's changes can be viewed as a stream.
- **changelog modes** — append, upsert, and retract, the three ways Flink SQL's dynamic tables encode a change (topic 24), which this topic's duality echoes from a different angle.
