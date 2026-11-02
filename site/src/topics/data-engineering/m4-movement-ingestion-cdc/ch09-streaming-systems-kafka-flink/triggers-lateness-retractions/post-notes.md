<section data-section="outcomes">

## Outcomes

A real toy windowed aggregator confirms the same window produces three distinct, real totals
across an early, an on-time, and a late firing. A real pane model confirms a record arriving
after the allowed-lateness boundary is dropped outright, with the final total excluding it. A
real downstream sum-of-sums model confirms discarding and accumulating-and-retracting both land
on the correct ground-truth total, while accumulating mode alone makes that same naive sum
over-count. All four are measured directly against the models' own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic contributes no reel step of its own to the 9.2 chapter lab; the kill-mid-commit
measurement's ground-truth aggregation baseline is hosted properly in
`consensus-inside-data-systems`.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming allowed lateness means "wait as long as it takes."** It is a fixed, bounded window —
once it passes, a late record is dropped, not queued for eventual processing.

**Treating accumulation mode as an implementation detail.** A downstream consumer that doesn't
know whether it's receiving discarding, accumulating, or accumulating-and-retracting values will
compute the wrong total under at least one of those modes.

**Ignoring a retraction as noise.** A retraction is a real, negative-valued record a correct
downstream aggregation must apply — skipping it silently corrupts the running total.

</section>

<section data-section="frontier">

## Frontier

Flink SQL's own changelog-table formalization of this idea (append, upsert, and retract streams
as a first-class concept) is the next cluster of topics' territory, named here, not retaught.
Kafka Streams' own suppression and accumulation knobs are implicitly covered by a later topic's
duality with Flink, not retaught in detail here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything so far has been about correctness inside a single stream-processing step. The engines
that actually run these steps continuously, at scale, recovering from failure without losing or
duplicating state, are the subject of the rest of this chapter — starting with how such an engine
is even structured.

</section>
