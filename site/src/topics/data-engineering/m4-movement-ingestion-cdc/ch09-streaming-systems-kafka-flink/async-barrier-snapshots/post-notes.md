<section data-section="outcomes">

## Outcomes

A real toy barrier-sweep model confirms an aligned checkpoint's duration grows directly with the
backlog ahead of the barrier on a backed-up channel, while an unaligned checkpoint's duration
stays fixed regardless of that backlog — at the cost of a measurably larger recorded snapshot. A
real incremental-vs-full checkpoint comparison, run across several rounds of growing state,
confirms a full checkpoint's cost keeps climbing round over round while an incremental
checkpoint's cost stays flat, bounded by that round's own delta. All measured directly against
the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic hosts the aligned-vs-unaligned checkpoint-duration-under-induced-backpressure leg of
the 9.3 chapter lab, on this topic's own toy barrier-sweep simulation standing in for a real Flink
job (disclosed in FACT-CHECK.md).

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a stalled checkpoint is a bug to chase down.** Under heavy backpressure, an aligned
checkpoint stalling behind a backed-up channel is the expected, designed behavior, not a failure
to debug — the fix is a configuration choice, not a patch.

**Leaving a job on aligned checkpoints under chronic backpressure.** The stall measured here isn't
rare in that situation; it recurs on every checkpoint until something changes the configuration or
the backpressure itself.

**Treating a savepoint as just another checkpoint.** A savepoint restoring cleanly after a planned
change (a new parallelism, a changed job graph) is not guaranteed for an ordinary checkpoint,
which is designed only to recover the exact failure it was taken for.

</section>

<section data-section="frontier">

## Frontier

What the snapshotted state actually consists of for a keyed operator, and what has to move when a
job's parallelism changes, is the next topic's scope entirely — this topic only covers the
mechanism that takes the snapshot, not what's inside it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A checkpoint or savepoint is a snapshot of state. What that state actually is, how much of it
belongs to a given key, and what has to move when the job's parallelism changes, is the next
topic.

</section>
