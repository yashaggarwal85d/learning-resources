<section data-section="outcomes">

## Outcomes

A real compatibility checker confirms an optional field with a default passes backward
compatibility, while a required field with no default fails it, and that transitive checking
catches a break backward-only checking misses. A real Protobuf field-number check confirms a
rename at the same number is safe while reusing that number is not. A real wire-format round trip
confirms a schema id, not the whole schema, travels with the record. A real subject-naming
comparison confirms the three strategies scope compatibility checks differently on the same
multi-type topic. All four are measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Choosing backward-only compatibility by default without checking the upgrade order.** It's the
right choice when consumers upgrade first, but it silently permits changes that break a consumer
still running the old schema if producers upgrade first instead.

**Treating all three schema formats as interchangeable.** Avro, Protobuf, and JSON Schema
resolve a mismatch by different identities (name, number, and neither natively) — the same
evolution that's safe in one can be unsafe in another.

**Mistaking schema compatibility for correctness.** A technically compatible evolution can still
be semantically wrong — a currency field changing units without changing its type passes every
compatibility check and corrupts every downstream calculation anyway.

</section>

<section data-section="frontier">

## Frontier

The full mechanics of a data contract — the business rules layered on top of a compatible schema
evolution — are Chapter 3's own territory (`data-contract-specification`), used here by name.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every topic in this section so far assumed a stream of individual events with no particular
relationship to real-world time. The next cluster is about exactly that relationship: when an
event happened, versus when it was processed, and what a stream processor can honestly claim
about how complete its view is at any moment.

</section>
