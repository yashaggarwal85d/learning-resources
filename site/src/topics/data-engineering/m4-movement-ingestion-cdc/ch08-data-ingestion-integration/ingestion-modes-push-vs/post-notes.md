<section data-section="outcomes">

## Outcomes

Say who owns the schedule and who owns the buffer, for a pull and for a push, and name the cost
to whoever owns the buffer (retention on the source side, a backlog on the consumer side). Place
a workload on the batch / micro-batch / streaming spectrum using real measured numbers (average
delay, rows handled per delivery) rather than adjectives like "fast" or "real-time." Name the one
failure each mode is most prone to: a late or skipped batch run going unnoticed, a pile of small
checkpointed files under micro-batch, or an unbounded backlog under streaming.

</section>

<section data-section="internals">

## Why pull won over push, and what a micro-batch actually is

Kafka's own design documentation states the reasoning directly: a push-based system hands control
of the transfer rate to the broker, which means a slow consumer gets overwhelmed rather than
simply falling behind; a pull-based consumer "falls behind and catches up when it can," at the
cost of a naive pull loop busy-waiting when there is nothing to read, which Kafka fixes with a
long-poll request that blocks until data (or enough of it) arrives. A micro-batch, in Spark
Structured Streaming's own model, is not a different execution engine from batch — it is the same
batch execution, run automatically on a fixed trigger interval, with the "Result Table" advancing
once per interval rather than once per manual run. Streaming, in this sense, is the limit of
shrinking that same interval toward the system's own processing latency, not a categorically
different mechanism.

</section>

<section data-section="production">

## Production failures this topic warns about

**Calling a scheduled job "real-time" without ever measuring its own delay.** The hook's own team
has an hourly cron and calls it a real-time dashboard; nobody had put a number on how long one row
actually waits. This topic's own measurement — the same arrival trace, cut three ways — shows
that delay spans from thousands of seconds down to a fraction of one, and that gap is invisible
until someone actually measures it, as `examples.py` does here.

**Choosing streaming for its latency without budgeting for its own failure mode.** Streaming wins
on delay and loses on protection: nothing about a pull-based or push-based streaming path shields
the consumer from a producer's own surge the way a scheduled batch or micro-batch run does. A team
that moves to streaming purely for lower latency, without planning for an unbounded backlog, has
traded one well-understood risk (a late batch) for a less familiar one.

</section>

<section data-section="frontier">

## Frontier

Webhook and event ingestion — the canonical push case, where the source calls the consumer the
moment something happens, with no poll and no schedule the consumer controls — is a real and
common ingestion pattern, named here only as the push-side counterpart to this topic's pull-side
focus. It is a skipped syllabus topic in this chapter (`syllabus/review-notes/de-cuts.md`) and is
not built as its own reel; its idea is carried only as this named, sourced pointer, per the
chapter plan's own rule for skipped topics whose idea a later topic's Deep dive still needs.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Pull is the most common mode, and the most common thing it pulls from is a production database
that was built to serve customers, not analysts. The next topic is how to read one without
becoming the outage.

</section>
