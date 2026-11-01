<section data-section="outcomes">

## What happens at one trigger boundary

At each trigger, the engine first asks every source for its latest available offset, writes
that target offset to the offset log (checkpointing the plan before running it, not after),
runs the incremental plan over exactly the new data between the previous offset and this one,
and only then writes a matching commit log entry recording that this batch's output actually
landed. If the process dies between those two writes, the offset log alone tells the next run
exactly which batch to redo -- never which one to guess at.

</section>

<section data-section="Why micro-batch cannot reach single-digit-millisecond latency">

## Why micro-batch cannot reach single-digit-millisecond latency

The floor measured here (a few hundred milliseconds, even on an almost-empty batch) comes from
fixed per-batch costs that don't shrink with the data: re-planning the incremental query,
checkpointing offsets before execution, running the plan through the driver, and committing
the result afterward. None of that work is proportional to row count, so no amount of
optimizing the data path removes it -- only a fundamentally different execution model
(continuous processing, covered only in passing here) removes the per-batch overhead itself.

</section>

<section data-section="production failures">

## When the trigger interval isn't the bottleneck

Shrinking a fixed trigger interval below the measured latency floor doesn't make batches run
any faster -- it just means more batches start immediately back-to-back instead of waiting,
without changing how quickly any single one of them finishes.

</section>

<section data-section="frontier">

## Where this goes next

Micro-batch execution says when a batch runs. It says nothing yet about how late an event is
allowed to arrive before the engine gives up waiting for it -- the next topic's own bound, the
watermark.

</section>
