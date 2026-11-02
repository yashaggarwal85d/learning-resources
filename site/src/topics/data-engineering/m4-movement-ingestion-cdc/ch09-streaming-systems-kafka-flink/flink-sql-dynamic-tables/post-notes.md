<section data-section="outcomes">

## Outcomes

A real toy changelog-mode interpreter confirms append, upsert, and retract modes agree on the
same final table from the same input events, while genuinely differing in message count — retract
emits more messages than upsert for the identical sequence of changes. A real regular-vs-interval
join state-size simulation confirms a regular join's state only ever grows while an interval
join's state plateaus once its time window fills. A real freshness-driven refresh-mode chooser
confirms a tight freshness target selects continuous mode and a loose one selects full mode. All
measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (CHAPTER.md).

</section>

<section data-section="production">

## Production failures this topic warns about

**Choosing retract mode by default "to be safe."** Retract needs no unique key, but it pays real,
measurable extra cost per update compared to upsert — reaching for it without a reason to avoid a
unique key is a cost paid for nothing.

**Writing a regular join between two genuinely unbounded streams without checking state growth.**
A regular join's state has no natural ceiling; what looks fine in a demo with a small input can
become the job's actual bottleneck once real volume arrives.

**Assuming a lookup join's external system can absorb per-row traffic at streaming scale.** A
lookup join trades kept-in-Flink state for load on whatever system it reaches out to — that system
needs to actually handle the resulting query rate.

</section>

<section data-section="frontier">

## Frontier

Delta joins and multi-way joins are both named here only at the level the current Flink SQL
configuration reference and the 2.2.0 release announcement describe them — their own detailed
mechanics, and exactly which query shapes the optimizer can rewrite into a delta join, are a
currency fact to reconfirm against the build-time docs rather than assumed to stay fixed.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Flink SQL formalised streams as changelogs of dynamic tables, run by a separate cluster. Kafka
Streams builds almost the identical idea — a stream and a table as two views of the same thing —
as a library with no cluster of its own at all, and that contrast is next.

</section>
