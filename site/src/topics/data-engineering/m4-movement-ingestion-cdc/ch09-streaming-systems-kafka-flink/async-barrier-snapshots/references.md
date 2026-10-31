Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy barrier-sweep model, no real Flink cluster available): an aligned-checkpoint
duration that grows with a channel's backlog; an unaligned-checkpoint duration that stays fixed
regardless of that backlog, at the cost of a larger snapshot; and an incremental-checkpoint cost
that stays flat across several rounds of growing state while the equivalent full-checkpoint cost
keeps climbing. The barrier/Chandy-Lamport mechanism, aligned/unaligned checkpointing,
exactly-once vs at-least-once mode, and checkpoints vs savepoints are disclosed, sourced-only
claims from the Carbone et al. paper and Apache Flink's own documentation.

- State Management in Apache Flink (Carbone et al., 2017 VLDB):
  [vldb.org/pvldb/vol10/p1718-carbone.pdf](https://www.vldb.org/pvldb/vol10/p1718-carbone.pdf).
  The Chandy-Lamport-derived marker/barrier mechanism and alignment this topic cites.
- Checkpointing (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../fault-tolerance/checkpointing/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/checkpointing/).
  The exactly-once vs at-least-once and incremental-checkpoint definitions this topic cites.
- Checkpointing under backpressure (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../checkpointing_under_backpressure/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/ops/state/checkpointing_under_backpressure/).
  The aligned/unaligned checkpoint mechanics and trade-offs this topic cites.
- Checkpoints vs. Savepoints (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../checkpoints_vs_savepoints/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/ops/state/checkpoints_vs_savepoints/).
  The checkpoint-vs-savepoint ownership and portability distinction this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=async-barrier-snapshots:%20).
