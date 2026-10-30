Last verified: 30 October 2026. Expert sign-off: pending. Five synthetic experiments run in
`examples.py` (no real Kafka broker or Collector; a local header-carrying queue stands in,
disclosed per `CHAPTER.md` §"Engine of record"): traceparent injection/extraction, parent-vs-links
fan-in, the link-count-limit drop, the CDC-to-warehouse trace break, and the OTel/OpenLineage
field-overlap comparison — all five pass their asserts.

- OpenTelemetry documentation, "Signals": [opentelemetry.io](https://opentelemetry.io/docs/concepts/signals/).
- OpenTelemetry documentation, "Collector": [opentelemetry.io](https://opentelemetry.io/docs/collector/).
- W3C Recommendation, "Trace Context": [w3.org](https://www.w3.org/TR/trace-context/).
- OpenTelemetry semantic conventions, "Semantic conventions for messaging spans": [opentelemetry.io](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/).
- OpenTelemetry semantic conventions, "Semantic conventions for Kafka": [opentelemetry.io](https://opentelemetry.io/docs/specs/semconv/messaging/kafka/).
- OpenTelemetry specification, "Tracing SDK": [opentelemetry.io](https://opentelemetry.io/docs/specs/otel/trace/sdk/). The default `LinkCountLimit` (128) this topic measures against.
- Debezium documentation, "Distributed Tracing": [debezium.io](https://debezium.io/documentation/reference/stable/integrations/tracing.html). The one real break in automatic propagation.
- OpenLineage documentation, "Object Model": [openlineage.io](https://openlineage.io/docs/spec/object-model). The complement this topic contrasts OpenTelemetry against.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=opentelemetry-across-batch-streaming:%20).
