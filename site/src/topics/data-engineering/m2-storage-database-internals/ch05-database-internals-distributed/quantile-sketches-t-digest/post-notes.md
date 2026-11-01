<section data-section="outcomes">

## Outcomes

A rank-error guarantee (KLL) is contrasted directly against a relative-error guarantee (t-digest,
DDSketch), both named from their own papers. Averaging per-partition percentiles is demonstrated
directly, with a real counterexample on a real partitioned dataset, to be mathematically wrong.
Real quantile sketches, merged across simulated partitions, are confirmed to stay a valid
approximation where the naive average does not. Real engines and observability tools (a
warehouse's own t-digest-backed function, Datadog's own DDSketch at wide scale) are named for
which sketch they actually use.

</section>

<section data-section="internals">

## Internals

A rank-error guarantee bounds how far an estimated rank can be from the true rank; a
relative-error guarantee instead bounds how far an estimated value can be from the true value,
and the two diverge sharply once data has a heavy tail. Mergeability is a deliberate design
choice: a mergeable sketch is built from centroids (clusters of nearby values, stored as a mean
and a count) that can be combined from two sketches and re-compressed into one, a real mechanism
named directly in these structures' own original papers, not an accidental property.

</section>

<section data-section="production">

## Production failures this topic warns about

**Averaging per-instance or per-partition percentiles into one dashboard number.** This is the
same mathematically wrong move this topic's own counterexample measures directly: a single
struggling instance's own real tail latency gets diluted into an average instead of showing up
in it, which is exactly why a dashboard's own number can look fine while real users are
genuinely experiencing slow requests.

**Choosing a rank-error sketch (like KLL) for a monitoring use case that actually needs a
relative-error guarantee.** A rank-error bound on a heavy-tailed latency distribution can
translate into a swing of many real seconds at the value level — the exact gap a relative-error
sketch like DDSketch or t-digest is built to close instead.

</section>

<section data-section="frontier">

## Frontier

Stream sampling (reservoir and weighted reservoir sampling), a *(skipped)* syllabus entry with no
topic of its own, is named here as a related but genuinely distinct tool: sampling keeps actual
raw data points rather than a compressed summary, trading a different set of costs than any
sketch in this chapter does.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This chapter opened at the single physical page an engine reads and writes and closed at a
sketch that approximates an entire distribution in a few kilobytes — the full range between an
engine's own internals and the statistics built on top of it. The next chapter turns to the files
these engines and sketches actually read and write at rest, starting with the oldest and most
trap-ridden of them: plain-text interchange formats like CSV and JSON.

</section>
