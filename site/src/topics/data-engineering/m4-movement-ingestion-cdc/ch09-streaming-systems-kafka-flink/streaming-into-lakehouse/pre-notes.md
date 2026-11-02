## Before this topic

- **topic-to-table materialisation** — a service that automatically turns a Kafka topic into a queryable Iceberg or Delta table, no hand-written pipeline required.
- **commit interval** — how often a streaming writer seals a batch of buffered records into a new, immutable table file.
- **small files problem** — the cost of committing too often: many tiny files that slow down later reads, already named in this syllabus's lakehouse chapter.
- **LSM tree (log-structured merge-tree)** — a storage structure that buffers writes and merges them together on compaction, instead of writing one file per write.
- **changelog modes** — append, upsert, and retract, the three ways Flink SQL's dynamic tables encode a change (topic 24), the same vocabulary this topic's sinks write out.
- **two-phase commit sink** — a sink that only makes a write visible once it's durably committed, so a failed write never becomes a half-finished one.
