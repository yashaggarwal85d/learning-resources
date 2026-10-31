## Before this topic

- **segment (OLAP)** — the basic, eventually-immutable unit an OLAP store builds from a stream, the same segment vocabulary this chapter opened with, now built by the store itself.
- **per-partition consumer** — a consuming task assigned to exactly one Kafka partition, building that partition's own segment independently of every other partition's task.
- **exactly-once offset/segment commit** — a segment counts as final only once its consumed offsets are durably recorded alongside it, in the same atomic action.
- **upsert table** — a table type where a later event for a primary key logically replaces an earlier one, answered at query time rather than by rewriting a sealed segment.
- **managed ingestion** — a vendor-run service that performs the same consume-and-land work a self-hosted consumer would, in exchange for giving up direct operational control.
