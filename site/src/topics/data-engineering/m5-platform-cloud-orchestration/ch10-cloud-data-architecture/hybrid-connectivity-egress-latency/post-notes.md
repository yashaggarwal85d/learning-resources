---
id: de.hybrid-connectivity-egress-latency
title: 'Hybrid connectivity, egress and latency'
---

<section data-section="outcomes">

## Outcomes

- Choose between a dedicated interconnect and a VPN for a given bandwidth, latency and cost
  requirement.
- Compute a link's bandwidth-delay product and explain why a single stream can't use it without
  tuning or parallelism.
- Design a cross-WAN replication setup and state exactly what it buffers and guarantees across a
  link failure.
- Derive a latency budget for a near-real-time pipeline.
- Decide, with the data-gravity rule, where compute should live for a given workload.

</section>

<section data-section="internals">

## Internals

- **A link's bandwidth-delay product, not its advertised bandwidth tier, decides whether one
  stream can use it.** A 400 Gbps circuit with enough round-trip delay still leaves most of its
  capacity unused by a single, untuned stream — the fix is parallel streams or a larger window,
  not a bigger circuit.
- **"Never block the source" is the same lesson this chapter already taught for a PLC, now
  applied to a WAN link.** A cross-WAN replication producer that blocks when the link drops is
  making the same mistake topic 20 already named for OT ingestion; buffering locally and
  draining in order on reconnection is the fix in both cases.
- **A matching row count proves no loss, not that order survived.** The drill's two separate
  assertions — same count, same sequence of ids — exist because either one alone leaves a real
  failure mode unchecked: a count can match while a backlog quietly reordered, and an in-order
  sequence can still be short a record if duplicates masked a loss.
- **A latency budget is arithmetic, not a target to hit by trying harder.** Once the WAN hop's
  own latency and any fixed overhead are named, what's left for processing is fixed — the
  question a design answers is whether the processing it needs actually fits in what's left.
- **The ADR's four earlier decisions are cited, not re-derived.** This topic's own contribution
  is the wire between them — sized, measured, and proven to survive going down — not a
  restatement of why the SAP path, the OT buffer, the hybrid split or the residency rule were
  each chosen.

</section>

<section data-section="production">

## Production

A platform team sizes a dedicated interconnect for a plant's steady replication volume and
ships it without checking its bandwidth-delay product against the pipeline's own stream count.
The circuit's bandwidth tier is more than enough on paper; the pipeline still runs at a fraction
of that bandwidth in production, because a single replication stream can't keep enough data in
flight to use a link with that much round-trip delay — the fix is adding parallel streams, not
buying more bandwidth.

</section>

<section data-section="frontier">

## Frontier

The specific circuit pricing, product names (Direct Connect, ExpressRoute, Cloud Interconnect)
and MirrorMaker 2's exact configuration are this topic's dated, sourced snapshot, not a
permanent verdict. The bandwidth-delay product itself, the buffer-and-count proof pattern, and
the latency-budget arithmetic are the parts that outlive any one vendor's current offering.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This chapter answered where things run and under what legal and physical constraint. None of it
answered how the work actually gets scheduled onto that platform, retried when it fails,
backfilled when it's late, or kept inside its own promised time budget — which is exactly where
Chapter 11 begins.

</section>
