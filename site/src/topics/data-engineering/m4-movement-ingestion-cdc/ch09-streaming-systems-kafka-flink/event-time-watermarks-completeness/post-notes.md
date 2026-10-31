<section data-section="outcomes">

## Outcomes

A real synthetic event stream (late and duplicate events, reused by this chapter's lab) confirms
a tighter watermark bound marks strictly more events late than a looser bound, on the exact same
stream. A real idle-source model confirms a naive minimum-based watermark stalls forever once one
partition goes quiet, and that an idle-aware watermark recovers past that stall. A real alignment
model confirms a fast partition's drift ahead of a slow one can be bounded to a chosen cap. All
three are measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic generates the 9.2 chapter lab's synthetic late/duplicate event stream and shows the
raw watermark-vs-arrival picture; topics 11 and 18 host the rest of the lab.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a watermark as a correctness guarantee.** A watermark that has passed does not mean
every relevant event has truly arrived — it means the system has stopped waiting, which is a
different and weaker claim.

**Forgetting idle-source detection.** A single partition that goes quiet — not crashed, just
quiet — can freeze every downstream window's watermark indefinitely if nothing explicitly
accounts for it.

**Ignoring watermark alignment on uneven sources.** A fast source racing far ahead of a slow one
can force a downstream operator to buffer an unbounded amount of state waiting for the slow
source to catch up.

</section>

<section data-section="frontier">

## Frontier

What a downstream window operator actually does once a watermark passes its boundary — closing,
emitting, or waiting for allowed lateness — is the next cluster of topics' territory, not this
one's. The specific MillWheel/Dataflow Model lineage behind this idea is this milestone's broader
production material, named here, not retaught.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A watermark is the signal that a window of time is probably complete enough to act on. What "a
window" actually is — its shape, its boundaries, its cost in memory — is the next topic.

</section>
