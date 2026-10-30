<section data-section="outcomes">

## Outcomes

Rewrite an unstructured pipeline log as structured records carrying the correlation key and say
what query becomes possible; pick counter, gauge or histogram for six given pipeline measurements
and justify each; list the six pipeline golden signals and name the metric that carries each, with
freshness measured as time since the newest successful partition; decide push or pull for a given
job, citing what each loses.

</section>

<section data-section="internals">

## Internals

A histogram is "essentially a bucketed counter" plus a running sum of observed values, and comes
in two forms: a classic histogram as several independent time series (`_bucket`, `_sum`, `_count`)
that can suffer partial transfer over the remote-write protocol, and a newer native histogram as
one composite sample with a dynamic bucket set, more efficient and always aggregatable even across
differing resolutions. Either way, a quantile read off the buckets is an estimate interpolated
between bucket boundaries, not the exact value — the same caveat this course's own quantile-sketch
material gives for approximate structures generally: a quantile is not a quantity you can average
across instances and expect a meaningful result, because the p99 of two machines is not halfway
between their two individual p99s. This topic's own metric-type classifier (`examples.py`) shows
the sharper version of the counter/gauge line: it isn't just that a counter "shouldn't" represent a
falling value, it structurally cannot — its only operations are increase and reset-to-zero, so the
only way to force a decrease through it is a reset that discards the real value entirely.

</section>

<section data-section="lab">

## Lab: the series-explosion extension

Adding one label to a metric does not cost a few extra bytes — every unique combination of label
values is an entirely new time series. This topic's own measurement (`examples.py` →
`series_explosion_per_customer_label`) takes a single counter from one series to exactly as many
series as there are customers: ten at ten customers, ten thousand at ten thousand, each carrying
its own storage and query cost. Prometheus' own instrumentation guidance gives a concrete rule of
thumb: keep a metric's cardinality under roughly ten, and treat anything over a hundred as a sign
to redesign rather than instrument further — reduce the dimensions, or move the analysis to a
general-purpose processing system instead of monitoring. The *(skipped)* syllabus topic "Metric
cardinality and observability cost" would go further into the cost side of this trade-off (storage
and query-time cost per series, cardinality limits in managed Prometheus services); it is not built
here, only named, per `CHAPTER.md`.

</section>

<section data-section="production">

## Production failures this topic warns about

**"Every task succeeded" read as "the data is healthy."** The hook is not a contrived case: a
scheduled job that runs against an already-stale upstream partition exits zero and writes its
(unchanged) row count every single night. Only a freshness signal — the age of the newest data a
reader can see — catches that a job can be green and the data behind it stale at the same time.

**Instrumenting a pull-based metric for a job shorter than the scrape interval.** A batch job that
starts and finishes between two scrapes is invisible to a pure pull collector, not flaky — this
topic's own simulation shows a four-second job against a fifteen-second scrape interval is missed
with certainty, not probability. The fix is to push, but naively treating the Pushgateway as a
general metrics sink reintroduces the single-point-of-failure and "series that never expires"
problems Prometheus' own documentation warns against.

</section>

<section data-section="frontier">

## Frontier

OpenTelemetry's Logs specification already lets a log record carry `TraceId` and `SpanId` so a log
line can be correlated directly with the trace of the same execution — named here only as the seam
the next topic builds on; this topic teaches logs and metrics on their own terms, before a trace
exists to correlate them with.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Logs and metrics are written by one process and read in one place. A single order, though, crosses
a Kafka topic, a Spark job and a warehouse, and no process sees the whole journey. The next topic
is how a trace follows one record across those hops: OpenTelemetry. The *(skipped)* syllabus topic
"Metric cardinality and observability cost" sits here in the syllabus order; this topic's own Lab
section above is where its lab leg is carried, with Prometheus' own naming and instrumentation
guidance cited, per `CHAPTER.md`.

</section>
