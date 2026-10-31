<section data-section="outcomes">

## Outcomes

Show a mean latency staying nearly flat while p99 and p99.9 move sharply under an injected rare
stall; report p50 through max together and say what real question each answers; merge two hosts'
histograms correctly and show the naive average of their percentiles disagreeing with the true
merged value; derive the fan-out tail-amplification probability for a stated shard count and
reproduce it on a simulated fan-out query. Run the chapter lab's core: a closed-loop generator and
a constant-rate generator at the same offered load against the shop's query, with a two-second
stall injected, and show the closed-loop generator's own self-slowdown hides exactly the worst
samples the constant-rate generator reports, then report the corrected (constant-rate) p99 as the
number that should actually be published.

</section>

<section data-section="internals">

## Internals

HdrHistogram's own documentation states plainly that "since Histogram objects are additive, it is
common practice to use per-thread non-synchronized histograms... and use a summary/reporting
thread to perform histogram aggregation math across time and/or threads." wrk2's own documentation
names the closed-loop failure directly: a model that "computes the latency for a given request as
the time from the sending of the first byte of the request to the time the complete response was
received... exhibits a strong Coordinated Omission effect," fixed by "measur[ing] response latency
from the time the transmission *should* have occurred according to the constant throughput
configured for the run." Dean and Barroso's "The Tail at Scale" states the fan-out mechanism's own
worked example: a single server with a ninety-ninth-percentile latency of one second makes "one
user request in 100... slow," while the same server fanned out to "100 such servers in parallel"
makes "63% of user requests... take more than one second."

</section>

<section data-section="lab">

## Lab

A real measurement against this sandbox's own Postgres. `examples.py` runs five hundred
order-lookup requests with one large injected stall and reports the mean beside the full
percentile ladder (p50/p95/p99/p99.9/max), using a nearest-rank percentile convention so a single
rare sample registers cleanly at the ladder's far end. A second experiment runs two genuinely
different real query shapes (a point lookup and a range aggregate) as stand-ins for two hosts,
comparing the naive average of their separately-computed p99s against the true p99 of their
merged, combined samples. A third experiment derives the fan-out tail-amplification probability
from first principles and reproduces it by Monte Carlo simulation. The chapter lab's core runs a
closed-loop generator and a constant-rate generator against the identical sequence of requests,
with the identical injected stall, and reports both generators' own p99 side by side.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reporting only a mean latency from a load test.** The hook's gap (a calm mean, a real shopper
who waited far longer) is not a measurement error — it is exactly what a mean is designed to do:
dilute a rare extreme value across everything else in the batch.

**Benchmarking with a closed-loop load generator and trusting its reported tail.** A closed-loop
generator cannot report what it never measured; every request queued behind a stall vanishes from
its own statistics by construction, not by accident.

</section>

<section data-section="frontier">

## Frontier

The two-hosts histogram-merge demonstration and the fan-out tail-amplification demonstration are
two distinct errors, often confused: one is about combining measurements that were taken
correctly (merge, don't average); the other is about a single measurement's own structural risk
multiplying under parallel composition (fan-out). A benchmark that gets the first right can still
get the second wrong.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every number in this topic came from requests generated against the shop's real schema with a
uniform customer id — data far tidier than any real traffic actually is. The next topic asks what
changes once the data looks the way real data looks: a few customers dominating the traffic, not
an even spread.

</section>
