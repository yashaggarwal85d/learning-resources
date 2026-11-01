<section data-section="outcomes">

## What Spark alone guarantees versus what the source and sink must add

Spark's own checkpoint (offsets, state, commit log) guarantees that after a crash, the right
batch -- exactly the one that wasn't committed -- gets replayed, no more and no less. Measured
directly: that guarantee held across a real simulated crash and restart with zero rows lost.
What Spark does not guarantee is what happens to that replayed batch once it reaches the sink:
an at-least-once sink produced a real duplicate on the exact same replay. True end-to-end
exactly-once needs a replayable source (which Spark's own offsets assume) plus a sink that can
either write idempotently or dedupe itself, which Spark cannot provide on the sink's behalf.

</section>

<section data-section="Designing an idempotent foreachBatch write keyed on batchId">

## Designing an idempotent foreachBatch write keyed on batchId

`foreachBatch` hands a write function the batch's own `batchId`, which is deterministic across
every replay of that batch -- the same batch always gets the same id back. Measured directly:
a sink that checks whether it has already processed a given `batchId` before writing anything
closes the exact gap the plain sink left open, producing zero duplicates across the identical
crash and restart that broke the non-idempotent version.

</section>

<section data-section="production failures">

## When a checkpoint can't be resumed

Not every change survives a restart from the same checkpoint. Measured directly: changing a
streaming aggregation's own grouping keys and restarting fails immediately, before a single row
of the restart is processed -- the schema of checkpointed state has to match exactly. Spark 4.2
relaxes part of this for sources and sinks specifically: naming them lets a source or sink be
swapped without breaking the checkpoint, a relaxation this topic names but doesn't measure.

</section>

<section data-section="frontier">

## Where this goes next

Exactly-once is a guarantee about correctness after failure. The next topic is about the one
resource that guarantee leans on hardest at scale: where the state itself actually lives, and
what happens once there's too much of it for memory.

</section>
