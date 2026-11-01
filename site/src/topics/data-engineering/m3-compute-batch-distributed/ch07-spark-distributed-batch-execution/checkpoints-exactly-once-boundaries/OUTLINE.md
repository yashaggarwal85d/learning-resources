# Outline: de.checkpoints-exactly-once-boundaries

1. **Hook.** Stateful operators compute the right answer once. This topic is what survives a
   crash in the middle of computing it.
2. **Reveal: kill the driver mid-batch, restart from checkpoint.** Measured: no row lost, no
   row duplicated -- the checkpoint alone gets this far. [from]
3. **Predict: an at-least-once sink, restarted the same way. Still exactly-once?** [idx2]
4. **Reveal: no -- a duplicate write survives.** The checkpoint's own guarantee didn't change;
   the sink's did.
5. **Elaborate: Spark's guarantee stops at its own boundary.** Offsets, state and the commit log
   are Spark's; what the sink does with a replayed batch is the sink's own job. [takeaway1]
6. **Predict: the same at-least-once sink, now deduplicating by `batchId` inside `foreachBatch`.
   Exactly-once this time?** [idx5]
7. **Reveal: yes -- zero duplicates, same restart.** Nothing about Spark's own guarantee moved;
   the sink closed the gap itself.
8. **Elaborate: `batchId` is deterministic across a replay.** The same batch gets the same id on
   every restart, which is exactly what deduplicating against it requires. [takeaway2]
9. **Reveal: not every checkpoint survives every change.** Swap the input source, or add a new
   aggregate, and the restart itself fails -- before any row moves.
10. **Recap.** [takeaway3]
