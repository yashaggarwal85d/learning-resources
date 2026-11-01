# Outline: de.micro-batch-incremental-execution

1. **Hook.** Every topic so far ran one plan once. This one runs a small plan over and over,
   once per trigger, against data still arriving.
2. **Reveal: one trigger, one incremental batch.** A running query's own checkpoint directory
   gets a new offset-log entry and a new commit-log entry, one pair per batch. [from]
3. **Predict: with the trigger interval forced to zero and almost no data, how fast can a
   batch run?** [idx2]
4. **Reveal: not single-digit milliseconds.** Steady-state batches still take a measurable
   floor, a few hundred milliseconds, even with almost nothing to process.
5. **Elaborate: why the floor exists** -- planning and committing a batch costs something real,
   independent of how many rows it touches. [takeaway1]
6. **Predict: a fixed three-second trigger, but each batch itself finishes in well under a
   second. Do consecutive batches start back-to-back, or three seconds apart?** [idx5]
7. **Reveal: three seconds apart.** The engine waits for the interval boundary, not just for
   the previous batch to finish.
8. **Elaborate: an offset log and a commit log, not a guess.** The commit log never runs ahead
   of the offset log -- resuming after a crash means replaying exactly what was checkpointed,
   nothing assumed. [takeaway2]
9. **Reveal: the trigger types, side by side** -- a fixed interval that waits, and
   available-now, which runs until the backlog is empty and then stops on its own.
10. **Recap.** [takeaway3]
