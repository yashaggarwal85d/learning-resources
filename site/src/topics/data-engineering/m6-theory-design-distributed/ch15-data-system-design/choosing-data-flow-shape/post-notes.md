<section data-section="outcomes">

## Outcomes

A freshness SLO is a floor, not a preference: any shape whose latency floor sits above the line
is eliminated outright, no tuning will save it. Among the shapes that clear the floor, the
decision card picks the cheapest one to run — not the fastest available, since headroom beyond
what the SLO requires is itself a cost, not a free bonus. Lambda and Kappa place on that same
card as two different answers to the same reprocessing need: Lambda keeps two code paths in
permanent sync, Kappa replays the same job from a retained log into a new output table. Neither
cost disappears — Lambda's is organizational, Kappa's is a real, temporary doubling of output
storage — and a unified engine's whole appeal is getting Kappa's one-code-path property without
hand-building that replay harness. Separately, every source boundary makes its own push-or-pull
choice, and that choice decides whose pager goes off, and how loudly, when the data stops.

</section>

<section data-section="internals">

## Internals

Akidau, Chernyak and Lax's Dataflow Model (the paper behind Google Cloud Dataflow and later
Apache Beam) frames batch and streaming as two points on one continuous model, not two
unrelated techniques: a bounded dataset is just an unbounded one that happens to stop. A unified
execution engine (this topic names Flink's unified batch/stream runtime and Spark Structured
Streaming's `availableNow` trigger) is the practical implementation of that same idea — one
processing model, run either continuously or triggered once over a bounded slice, which is
exactly how it gets Kappa's single-code-path property without a hand-rolled replay job.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the decision card as data: `DECISION_CARD` holds each shape's
latency floor and cost rank, `shapes_clearing_slo()` filters by a given SLO, and
`cheapest_clearing_shape()` applies the "cheapest that clears" rule. Exercise: change the SLO
passed to `shapes_clearing_slo()` and watch which shapes survive the card — then compare that
against `tighten_slo_to_fraud_review()`'s own before-and-after, which models exactly the
"Prove it" scenario this topic ends on.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking the fastest shape because it's available, not because the SLO needs it.** Streaming
always clears a fifteen-minute floor with room to spare, which makes it tempting to pick by
default. But that headroom is infrastructure that runs continuously whether or not the SLO
requires it — the cost of "always ready" is paid every hour, not just during the hours it
matters.

**LinkedIn's own lived "transparent" dual-run API.** Kreps describes building a domain-specific
API meant to let the same code run either in real time or in Hadoop — and reports plainly that
it worked, but was never pleasant or productive. Keeping code written for two different systems
perfectly in sync was, in his own account, really, really hard — the concrete shape "Lambda's
cost is organizational" takes once a team actually lives with it.

</section>

<section data-section="frontier">

## Frontier

Unified batch/streaming execution is still maturing, not settled: Flink's unified runtime and
Spark's `availableNow` trigger both let one job definition run continuously or over a bounded
slice, but the ecosystem hasn't converged on a single dominant approach the way it has around,
say, log-based replication. Teams adopting this pattern today are still closer to the frontier
than to a well-worn, textbook default.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The data-flow shape decides when work happens; the next question is where the results live once
produced, and how they're laid out for the access patterns that will actually read them. The
next topic is storage, layout, and lifecycle — the data-flow shape chosen here and the dominant
access path jointly decide it.

</section>
