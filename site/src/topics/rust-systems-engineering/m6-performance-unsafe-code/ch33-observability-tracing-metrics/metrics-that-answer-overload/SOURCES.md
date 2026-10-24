# Sources — Metrics that answer overload questions

## Metric types — Prometheus
URL: https://prometheus.io/docs/concepts/metric_types/
Fetched: 2026-10-24, cached at `sources/prometheus-metric-types.txt`.

> A counter is a cumulative metric that represents a single monotonically increasing counter whose value can only increase or be reset to zero on restart.

> A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.

> A histogram records observations (usually things like request durations or response sizes) by counting them in configurable buckets.

## RuntimeMetrics — docs.rs (tokio)
URL: https://docs.rs/tokio/latest/tokio/runtime/struct.RuntimeMetrics.html
Fetched: 2026-10-24, cached at `sources/tokio-runtime-metrics.txt`.

> Returns the current number of alive tasks in the runtime.

Last verified: 2026-10-24. Expert sign-off: pending.
