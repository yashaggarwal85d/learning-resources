<section data-section="outcomes">

## Outcomes

Draw the path of a trace context through a produce, a consume and a batch step and say where each
header is injected and extracted; explain why a batch receive uses links and not a parent; name
the semantic-convention attributes a Kafka consumer span should carry; run a record from a CDC
source to a warehouse write and show the trace, naming the one real break in automatic
propagation; say in one sentence what OpenTelemetry records that OpenLineage does not, and the
reverse.

</section>

<section data-section="internals">

## Internals

The messaging semantic conventions distinguish four span kinds along a message's own life: a
"Create" span (when a message is built), a "Send" span (handed to the broker — one span can cover
a whole batch of sends), a "Receive" or "Process" span (handed back to application code, pull- or
push-triggered respectively), and a "Settle" span (an explicit ack/nack). The specification is
explicit that links, not parent/child, are the default correlation for exactly three reasons at
once: a span's parent field can only ever hold one context, a batch receive genuinely has many
producer contexts behind it, and a receive can be nested inside another span entirely (a broker
pushing over HTTP, say) where forcing the message's own creation context to be the parent would
break that enclosing trace. This topic's own `examples.py` makes the first reason concrete: five
producer contexts forced through a parent field collapse to whichever was assigned last, while the
same five held as links all survive. Even links aren't unlimited, though — the SDK specification
caps the count per span (128 by default), so the chapter's own nightly aggregate reading a million
records keeps a sample of its producers' contexts, not all of them, once that cap is reached.

</section>

<section data-section="lab">

## Lab: tracing a CDC-to-warehouse record

This topic hosts the tracing half of the §13.1 chapter lab: instrument a produce, a consume and an
aggregate step with OpenTelemetry, propagate context through Kafka headers, and follow one record
from a database change through to a warehouse write. Where the build machine has no Kafka broker,
the record carrier is a local file or in-memory queue with a header map standing in for Kafka's
own, and the Kafka-specific attribute names are sourced from the semantic conventions rather than
reproduced against a running broker — disclosed here rather than silently assumed, per
`CHAPTER.md`'s own "Engine of record" rule.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a CDC pipeline's trace is automatic end to end.** Debezium's own documentation is blunt
that a database write is the point where the active trace is "demarcated" — this topic's own
measured comparison (`examples.py` → `cdc_to_warehouse_trace_with_one_break`) shows a trace id
surviving three later hops without any special handling, and vanishing at exactly that first one
unless the application explicitly passes trace metadata into the write.

**Reading a dropped link as a data-correctness problem.** The link limit is a tracing-SDK setting,
not a processing one: a batch aggregate still reads and folds in every record regardless of how
many links its own consumer span is allowed to keep. What's lost when the limit is hit is
visibility into where most producers came from, not the data itself — conflating the two can send
an incident response chasing a data bug that was never there.

</section>

<section data-section="frontier">

## Frontier

OpenTelemetry's own signal list already names Events (a specific type of log) and Profiles as
under development or at the proposal stage, alongside the four stable signals (traces, metrics,
logs, baggage) this topic and topic 1 build on — named here only as a marker of where the
specification is still moving, not built or measured.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Now there is telemetry worth reading. A dashboard that nobody watches changes nothing; an alert
that fires on every blip teaches people to ignore it. The next topic is the rule that decides when
a symptom is worth waking someone: SLO burn-rate alerting.

</section>
