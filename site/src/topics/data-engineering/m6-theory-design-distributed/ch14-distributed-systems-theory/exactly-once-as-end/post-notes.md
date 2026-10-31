<section data-section="internals">

## Internals: idempotence is a property of the write, not of the message

`retry_after_lost_acknowledgement_with_idempotency_key` in `examples.py` never checks whether a
message "is" a duplicate at the transport level; the fair-loss link in this topic's model has no
opinion about that at all. The only thing that changes between the broken and fixed runs is
whether `ChargeLedger.charge_with_idempotency_key` consults a set of keys it has already seen
before appending. Delivery is identical in both runs — two attempts arrive either way — which is
exactly the point: exactly-once is bought entirely on the write side.

</section>

<section data-section="lab">

## Lab: an atomic commit is "no observable in-between," not "no failure"

`non_atomic_commit_can_leave_output_without_recorded_offset` doesn't model a rare race; it models
the ordinary case where output and offset are two separate steps and a crash lands, as crashes do,
somewhere. `crash_after_output_before_offset_is_impossible_once_atomic` makes the same two writes
one call instead of two, which removes the gap a crash could land in — not by making the system
faster or more reliable, but by removing the intermediate state entirely.

A deterministic computation over replayable inputs gets the identical benefit a different way: if
re-running it after a failure always produces the same output, that output can simply overwrite
whatever partial result the crash left behind, rather than being appended alongside it as a
duplicate. `OffsetAndOutputStore.atomic_commit` models the overwrite directly — a replay calls it
again with the same offset, and the stored output is replaced, not doubled.

</section>

<section data-section="production">

## Production: two systems, the identical shape, different vocabulary

Kafka's design calls its unit "a set of messages across TopicPartitions," committed "atomically...
either all messages are committed, or none of them are," and folds the consumer's offset into that
same unit so that "a set of messages may be considered consumed only if the entire
'consume-transform-produce' executed in its entirety." Flink's design calls the identical shape a
checkpoint: a snapshot "pre-committed" at one point and only "committed" once the checkpoint
itself "succeeded." Different names, same atomic pair: an output and the position that produced
it, rising and falling together.

</section>

<section data-section="frontier">

## Frontier: the boundary is a property of the architecture, not a weakness in it

It's tempting to read "the guarantee doesn't reach an external side effect" as a gap someone
forgot to close. The end-to-end argument says the opposite: no layer below the application can
ever close that gap, because closing it needs knowledge — what counts as "the same request," what
a safe retry of this particular side effect looks like — that only the application has. A pipeline
promising end-to-end exactly-once through an arbitrary external call is promising something no
layer underneath it could deliver, by the argument's own logic.

</section>

<section data-section="frontier">

## Mechanics live in Chapter 9 §9.2, not here

This topic places Kafka's transactions and Flink's sink inside the end-to-end argument: why the
mechanism exists, and what it does and doesn't fix. It does not re-derive the mechanism itself.
The idempotent producer's sequence numbers, the transaction coordinator, read-committed's buffering
on the consumer, and the sink's implementation details are Chapter 9 §9.2's build, not this
topic's; once that chapter exists, a learner follows its own `uses` pointer back here for the
argument, not the other way around.

</section>

<section data-section="frontier">

## Idempotency keys as a designed component: the Rust track's build

This topic uses an idempotency key the way a distributed-systems theory course uses it: as the one
fact that makes a retry harmless, named and reasoned about, not implemented. Designing the key
itself — its scope, how long it lives, what happens when a client replays it after that lifetime
ends — is *Rust Systems Engineering* Chapter 27 and 28's build, alongside the CRDTs that give the
same safety without needing a key at all.

</section>

<section data-section="where-next">

## Where this goes next

The theory is now complete enough to use: a model to reason in, an order without clocks, a ladder
of consistency models, one impossibility result, and the mechanisms that buy what the result
allows. The next chapter does not add theory. It applies it: given a vague request for a data
system, how do you turn it into measurable requirements first, so that every later choice can be
defended. The first topic of the next chapter is that step: requirements into service-level
objectives.

</section>
