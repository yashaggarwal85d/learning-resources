<section data-section="outcomes">

## Outcomes

A toy in-place retry confirms a poison record stops a partition cold, with nothing behind it
ever running. A toy non-blocking retry-topic flow confirms the main partition processes
everything behind the poison record immediately, with the diverted record's original relative
order broken. A real DLQ record confirms it carries the original topic, partition, offset,
exception, and retry count. All three are measured directly against the models' own state, not
asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Retrying a poison record in place.** Nothing behind it in the same partition ever runs again —
a growing, often silent backlog until someone notices the partition has stalled.

**Treating a dead-letter record as a dead end.** Without enough metadata (original topic,
partition, offset, the exception, a retry count), an operator can't diagnose what went wrong or
safely replay it once fixed.

**Assuming a retry topic preserves order.** A record routed through a retry topic is not
guaranteed to land in its original relative position — code downstream that depends on strict
ordering across all records, poison or not, will see that assumption broken.

</section>

<section data-section="frontier">

## Frontier

Replaying a dead-lettered or retry-topic record back into the main flow once it's fixed overlaps
with general replay mechanics, the next topic's job (used there). The dedup machinery a replay
needs is this chapter's earlier deduplication topic (used here by name).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A dead-lettered record, once fixed, needs to be put back into the flow — and so does an entire
pipeline that was simply wrong for a while. Doing that safely, for a single record or for a whole
time range, is the next topic.

</section>
