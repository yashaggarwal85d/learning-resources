<section data-section="outcomes">

## Outcomes

Design a raw record envelope with the three source-metadata fields. Rebuild a downstream table
by replay and prove it equals the original. Explain what an immutable raw layer costs in storage
and in PII risk and name the mitigations.

</section>

<section data-section="internals">

## Internals: built on the medallion architecture, not a replacement for it

This topic introduces no new layering scheme of its own. Chapter 3 topic 19's medallion
architecture (bronze, silver, gold) and its own failure modes are the structure this topic's raw
layer sits inside; this topic's own contribution is the envelope a bronze record needs (the
three metadata fields) and the replay discipline that makes bronze worth keeping at all. Topic
6's deterministic batch id and exactly-once-effect recipe reappear here as the reason a replay
can be run more than once without changing the answer, and topic 5's commit protocols are the
reason the files a raw layer captures can be trusted as a complete batch in the first place.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a bug fix as requiring re-extraction.** The hook's own scenario — a silver table
overwritten in place, the raw files already deleted — is what happens when a team never kept the
one thing that would have let them fix the bug cheaply. A team that keeps no raw layer at all
pays for every historical bug with a fresh extraction from a source that may no longer hold the
old data, or may not exist in its old form at all.

**Satisfying an erasure request by mutating raw history.** Step 9's own measurement shows a
plaintext raw layer requiring three historical records to be altered for one erasure request —
and that number only grows with how often the same person appears. A team that designs its raw
layer around plaintext identifiers inherits this cost on every single erasure, not just a rare
one; tokenizing the one field that actually identifies a person turns the identical request into
a single, isolated deletion.

</section>

<section data-section="frontier">

## Frontier

None claimed. Append-only capture, replay and field-level tokenization are each established,
long-documented practice — this topic measures their real behaviour directly rather than
describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything built in this section so far can be hand-rolled, and every part of it is ongoing
maintenance: cursors, pagination, commit protocols, idempotent checkpoints, and now a raw
layer's own envelope. Whether to build all of this at all, or buy a connector that someone else
maintains, is the next topic.

</section>
