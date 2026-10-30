## Google SRE Book — Monitoring Distributed Systems

URL: https://sre.google/sre-book/monitoring-distributed-systems/
Version: Google SRE Book, chapter "Monitoring Distributed Systems" (as published at sre.google)

> The four golden signals of monitoring are latency, traffic, errors, and saturation. If you can only measure four metrics of your user-facing system, focus on these four.

> The time it takes to service a request. It's important to distinguish between the latency of successful requests and the latency of failed requests.

> A measure of how much demand is being placed on your system, measured in a high-level system-specific metric.

> The rate of requests that fail, either explicitly (e.g., HTTP 500s), implicitly (for example, an HTTP 200 success response, but coupled with the wrong content), or by policy

> How "full" your service is. A measure of your system fraction, emphasizing the resources that are most constrained

> If you measure all four golden signals and page a human when one signal is problematic (or, in the case of saturation, nearly problematic), your service will be at least decently covered by monitoring.

Contents (used for coverage.json):
1. The four golden signals: latency, traffic, errors, saturation (definitions and the caveat on error latency).
2. Dashboards should include some form of the four golden signals.
3. Saturation includes predictive signals ("will fill its hard drive in 4 hours").

## Prometheus — Metric types

URL: https://prometheus.io/docs/concepts/metric_types/
Version: Prometheus docs, "Metric types" page (fetched 2026-10-30)

> A counter is a cumulative metric that represents a single monotonically increasing counter whose value can only increase or be reset to zero on restart.

> Do not use a counter to expose a value that can decrease. For example, do not use a counter for the number of currently running processes; instead use a gauge.

> A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.

> Gauges are typically used for measured values like temperatures or current memory usage, but also "counts" that can go up and down, like the number of concurrent requests.

> A histogram records observations (usually things like request durations or response sizes) by counting them in configurable buckets. It also provides a sum of all observed values. As such, a histogram is essentially a bucketed counter.

Contents:
1. Counter: monotonically increasing, reset only on restart; wrong for values that can decrease.
2. Gauge: arbitrary up/down value (temperature, memory, concurrent requests).
3. Histogram: bucketed observation counts plus a sum; classic vs native histogram formats.

## Prometheus — When to use the Pushgateway

URL: https://prometheus.io/docs/practices/pushing/
Version: Prometheus docs, "When to use the Pushgateway" page (fetched 2026-10-30)

> We only recommend using the Pushgateway in certain limited cases. There are several pitfalls when blindly using the Pushgateway instead of Prometheus's usual pull model for general metrics collection:

> When monitoring multiple instances through a single Pushgateway, the Pushgateway becomes both a single point of failure and a potential bottleneck.

> You lose Prometheus's automatic instance health monitoring via the up metric (generated on every scrape).

> The Pushgateway never forgets series pushed to it and will expose them to Prometheus forever unless those series are manually deleted via the Pushgateway's API.

Contents:
1. The Pushgateway exists for jobs that cannot be pulled (short-lived batch jobs).
2. Its pitfalls when misused as a general collector: single point of failure/bottleneck, loses `up`-based health, never forgets stale series.

## Prometheus — Metric and label naming

URL: https://prometheus.io/docs/practices/naming/
Version: Prometheus docs, "Metric and label naming" page (fetched 2026-10-30)

> Remember that every unique combination of key-value label pairs represents a new time series, which can dramatically increase the amount of data stored. Do not use labels to store dimensions with high cardinality (many different label values), such as user IDs, email addresses, or other unbounded sets of values.

Contents:
1. Every unique label-value combination is a new time series; high-cardinality labels (user IDs, emails) multiply series count. Used for this topic's Deep-dive "Lab" series-explosion extension and to name the *(skipped)* cardinality/cost syllabus topic.

## Prometheus — Instrumentation (best practices)

URL: https://prometheus.io/docs/practices/instrumentation/
Version: Prometheus docs, "Instrumentation" best-practices page (fetched 2026-10-30)

> As a general guideline, try to keep the cardinality of your metrics below 10, and for metrics that exceed that, aim to limit them to a handful across your whole system. The vast majority of your metrics should have no labels.

> If you have a metric that has a cardinality over 100 or the potential to grow that large, investigate alternate solutions such as reducing the number of dimensions or moving the analysis away from monitoring and to a general-purpose processing system.

Contents:
1. Concrete cardinality guidance (below 10 typical, over 100 is a red flag) — used in the series-explosion lab extension.

## OpenTelemetry — Logging

URL: https://opentelemetry.io/docs/specs/otel/logs/
Version: OpenTelemetry specification, "Logs" overview page (fetched 2026-10-30)

> Distributed tracing introduced the notion of trace context propagation. Fundamentally, though, nothing prevents the logs to adopt the same context propagation concepts. If the recorded logs contained trace context identifiers (such as trace and span IDs or user-defined baggage) it would result in much richer correlation between logs and traces, as well as correlation between logs emitted by different components of a distributed system.

> OpenTelemetry extends this practice to logs where possible by including TraceId and SpanId in the LogRecords. This allows to directly correlate logs and traces that correspond to the same execution context.

Contents:
1. Logs can optionally carry trace and span IDs for correlation with traces.
2. This is named here only as the bridge to topic 2 (context propagation); this topic does not teach propagation itself.

## Apache Kafka 4.4 — Monitoring

URL: https://kafka.apache.org/44/operations/monitoring/
Version: Apache Kafka 4.4 documentation, "Monitoring" page (fetched 2026-10-30)

> Number of messages the consumer lags behind the producer by. Published by the consumer, not broker.

> kafka.consumer:type=consumer-fetch-manager-metrics,client-id={client-id} Attribute: records-lag-max

Contents:
1. `records-lag-max` is the consumer-side fetch-manager metric for maximum consumer lag, published by the consumer (not the broker).
