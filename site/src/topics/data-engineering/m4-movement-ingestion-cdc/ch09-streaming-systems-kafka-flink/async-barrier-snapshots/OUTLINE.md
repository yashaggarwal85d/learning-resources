# Outline — Async barrier snapshots

1. Hook: a job fails mid-checkpoint under backpressure, and the checkpoint duration bar for
   aligned mode towers over unaligned mode on the identical backlog.
2. Setup: the runtime from topic 20 runs continuously, but a TaskManager can still fail —
   recovery needs a consistent snapshot of state across the whole job graph, taken while it keeps
   running.
3. Reveal: a checkpoint barrier flows through the graph like a record, generalizing Chandy and
   Lamport's distributed-snapshot idea to a dataflow.
4. Predict: does an operator under heavy backpressure on one input see its checkpoint stall, or
   does the barrier just skip ahead?
5. Reveal: aligned checkpoints wait for the barrier on every input, so a backed-up channel stalls
   the whole checkpoint.
6. Reveal: unaligned checkpoints snapshot the moment the barrier arrives, folding the backlog into
   a bigger snapshot instead of waiting for it to drain.
7. Reveal: incremental checkpoints bound their cost by the delta since last time, not by how much
   history has piled up.
8. Predict: is the stricter checkpointing mode always the right default?
9. Reveal: exactly-once is the default; at-least-once trades a small chance of duplicate
   processing on recovery for less alignment overhead.
10. Reveal: a checkpoint is automatic and Flink-owned; a savepoint is deliberate, portable, and
    user-owned, built for a job that's about to change.
11. Prove it.
12. Recap.

Predicts at steps 4 and 8. Takeaways planned on steps 5/6 (combined aligned/unaligned reveal —
likely split across two takeaway slots), 7, and 10.
