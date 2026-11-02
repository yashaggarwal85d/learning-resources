<section data-section="outcomes">

## Outcomes

A real toy model confirms a job's parallelism is exactly bounded by TaskManager count times
slots per TaskManager, with no slack. A real cost comparison confirms chained operators process
the same stream for a fraction of the cost of the same operators left unchained. A real
credit-counter simulation confirms a stalled consumer's channel starves first, and the stall then
drains backward through the chain one hop at a time, each channel starving later than the one
after it. A real adaptive-scheduling model confirms two different upstream data volumes are
assigned two different parallelisms, both derived from the data, neither fixed in advance. All
four are measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic hosts no reel step of its own in the 9.3 chapter lab; it sets up the state, checkpoint,
and rescale legs the lab hosts properly in the next three topics.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming more parallelism is always just a configuration change.** A job's parallelism cannot
exceed the cluster's total slots; asking for more isn't throttled, it's a job that can't be
scheduled at all.

**Leaving operators unchained without realizing the cost.** A shuffle or an incompatible
parallelism setting between two operators that could otherwise chain silently adds a real,
measurable network-hop-and-serialization cost to every record.

**Reading a throughput collapse as a crash.** Backpressure propagating through credit-based flow
control produces no explicit error anywhere in the logs — it looks like nothing happened, when
something specific and traceable did.

</section>

<section data-section="frontier">

## Frontier

How a job's state actually survives a failure — checkpointing, the mechanism credit-based flow
control's backpressure interacts with directly — is the next topic, not this one's; what the
state itself is and where it's rescaled is the topic after that. This topic is the mechanical
skeleton only.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A TaskManager that crashes mid-job must not simply lose everything it was computing. How Flink
makes that recoverable, with a precise correctness guarantee, is the next topic: checkpointing.

</section>
