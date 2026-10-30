Last verified: 30 October 2026. Expert sign-off: pending. Five synthetic experiments run in
`examples.py` (no real system, no real personal data — same fictional shop as earlier chapters):
log-search cost, metric-type classification, the freshness/stale-night contrast, push-vs-pull
batch-job visibility, and the per-customer label series explosion — all five pass their asserts.

- Google SRE Book, "Monitoring Distributed Systems": [sre.google](https://sre.google/sre-book/monitoring-distributed-systems/). The four golden signals this topic's six specialize.
- Prometheus documentation, "Metric types": [prometheus.io](https://prometheus.io/docs/concepts/metric_types/). Counter, gauge and histogram, named directly from the source.
- Prometheus documentation, "When to use the Pushgateway": [prometheus.io](https://prometheus.io/docs/practices/pushing/). The Pushgateway's own documented pitfalls.
- Prometheus documentation, "Metric and label naming": [prometheus.io](https://prometheus.io/docs/practices/naming/). The cardinality caution behind the series-explosion extension.
- Prometheus documentation, "Instrumentation": [prometheus.io](https://prometheus.io/docs/practices/instrumentation/). The concrete cardinality guidance (under ~10, over ~100).
- OpenTelemetry specification, "Logging": [opentelemetry.io](https://opentelemetry.io/docs/specs/otel/logs/). Trace/span correlation on log records, named as the bridge to the next topic.
- Apache Kafka 4.4 documentation, "Monitoring": [kafka.apache.org](https://kafka.apache.org/44/operations/monitoring/). `records-lag-max`, the concrete consumer-lag signal.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=telemetry-pipelines-logs-metrics:%20).
