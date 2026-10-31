<section data-section="outcomes">

## Outcomes

A real toy per-partition-segment model confirms each partition builds its own independent
sequence of segments. A real toy commit model confirms an atomic offset-and-segment commit
leaves state completely untouched on a forced failure, while a naive non-atomic commit leaves
the offset ahead of the segment it was supposed to match after the identical failure. A real
toy upsert-overlay model confirms a query answers with a key's newer value while the sealed
segment physically holding its original row stays provably unchanged. All measured directly
against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (CHAPTER.md).

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a crash between committing an offset and sealing its segment is harmless, because
"the data is still in Kafka."** It isn't harmless to the OLAP store's own bookkeeping — a
non-atomic commit leaves the offset looking advanced with no matching segment behind it, a real
gap this topic's toy model reproduces directly.

**Planning capacity for an upsert table the same way as an append-only one.** An upsert table
keeps per-row bookkeeping in memory to know which rows in a segment are still current, a real
and ongoing memory cost append-only ingestion never pays.

**Choosing a managed ingestion service and assuming the underlying trade-off disappears.**
ClickPipes still runs the same consumer logic the Kafka table engine would; it changes who
operates it, not whether the work happens.

</section>

<section data-section="frontier">

## Frontier

Serving-side trade-offs across these three stores and their storage-engine internals are
explicitly deferred to the sections named in CHAPTER.md's own syllabus clause — this topic
covers ingestion only, and those two areas are a currency fact to check against this
syllabus's actual section numbers once they're built.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This chapter opened on a question earlier milestones never had to ask: what do you do with data
that never stops arriving. Everything from the partitioned log to a windowed aggregation to a
checkpointed, rescaled Flink job was an answer to some piece of that question, ending in a
result someone can actually query in near real time. The next milestone moves the question up a
level: not how a single system computes correctly, but how a whole platform of such systems is
run, paid for, and kept compliant in production.

</section>
