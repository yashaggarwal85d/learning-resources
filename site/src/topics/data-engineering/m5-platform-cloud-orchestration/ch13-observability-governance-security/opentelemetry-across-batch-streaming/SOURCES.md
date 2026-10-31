## OpenTelemetry — Signals

URL: https://opentelemetry.io/docs/concepts/signals/
Version: OpenTelemetry documentation, "Signals" concepts page (fetched 2026-10-30)

> The purpose of OpenTelemetry is to collect, process, and export signals. Signals are system outputs that describe the underlying activity of the operating system and applications running on a platform.

> OpenTelemetry currently supports: Traces Metrics Logs Baggage Also under development or at the proposal stage: Events, a specific type of log Profiles

Contents:
1. OpenTelemetry's defined signals: traces, metrics, logs, baggage; profiles and events as proposal/development-stage.

## OpenTelemetry — Collector

URL: https://opentelemetry.io/docs/collector/
Version: OpenTelemetry documentation, "Collector" page (fetched 2026-10-30)

> The OpenTelemetry Collector offers a vendor-agnostic implementation of how to receive, process and export telemetry data. It removes the need to run, operate, and maintain multiple agents/collectors.

Contents:
1. The Collector's role: a vendor-agnostic receive/process/export pipeline between instrumented applications and one or more backends.

## W3C Trace Context (Recommendation)

URL: https://www.w3.org/TR/trace-context/
Version: W3C Recommendation (fetched 2026-10-30)

> traceparent describes the position of the incoming request in its trace graph in a portable, fixed-length format.

> traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01

> tracestate extends traceparent with vendor-specific data represented by a set of name/value pairs. Storing information in tracestate is optional.

> At a minimum they MUST propagate the traceparent and tracestate headers and guarantee traces are not broken. This behavior is also referred to as forwarding a trace.

Contents:
1. `traceparent`'s format (version-trace_id-parent_id-flags) and its minimum propagation requirement.
2. `tracestate` as the optional vendor-specific extension.

## OpenTelemetry — Semantic conventions for messaging spans

URL: https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/
Version: OpenTelemetry semantic conventions (fetched 2026-10-30)

> The "Send" span SHOULD always link to the creation context that was injected into a message either from a "Create" span or as a custom creation context.

> For each message it accounts for, the "Process" or "Receive" span SHOULD link to the message's creation context.

> These conventions use spans links as the default mechanism to correlate producers and consumer(s) because: It is the only consistent trace structure that can be guaranteed, given the many different messaging systems models available. It is the only option to correlate producer and consumer(s) in batch scenarios as a span can only have a single parent. It is the only option to correlate producer and consumer(s) when message consumption can happen in the scope of another ambient context such as a HTTP server span.

Contents:
1. Why links, not parent/child, are the default correlation mechanism for messaging: single-parent limit, batch fan-in, and ambient-context cases.
2. Send/Process/Receive span naming and when each applies (pull vs push consumption).

## OpenTelemetry — Semantic conventions for Kafka

URL: https://opentelemetry.io/docs/specs/semconv/messaging/kafka/
Version: OpenTelemetry semantic conventions (fetched 2026-10-30)

> The identifier of the partition messages are sent to or received from, unique within the messaging.destination.name.

Contents:
1. Kafka-specific and shared messaging attributes: `messaging.destination.name`, `messaging.destination.partition.id`, `messaging.kafka.message.key`, `messaging.kafka.message.tombstone`.

## OpenTelemetry — Tracing SDK specification

URL: https://opentelemetry.io/docs/specs/otel/trace/sdk/
Version: OpenTelemetry specification (fetched 2026-10-30)

> LinkCountLimit (Default=128) - Maximum allowed span link count

Contents:
1. Span limits are configurable, including a default maximum link count of 128 per span (`LinkCountLimit`), so a batch receive accounting for more messages than the limit drops links beyond it.

## Debezium — Distributed Tracing

URL: https://debezium.io/documentation/reference/stable/integrations/tracing.html
Version: Debezium documentation, stable release (fetched 2026-10-30)

> You can add tracing support to Debezium through the OpenTelemetry specification.

> It is necessary to provide additional precautions when an application writes a record to a database that is later processed by Debezium. The active trace is effectively demarcated by the write to the database. If you want to include Debezium data in your application tracer, you must pass the trace metadata to Debezium.

Contents:
1. Debezium supports OpenTelemetry tracing, but a CDC write to a database is a real break point in automatic propagation: the trace must be explicitly carried across it.

## OpenLineage — Object Model

URL: https://openlineage.io/docs/spec/object-model
Version: OpenLineage documentation (fetched 2026-10-30)

> OpenLineage was designed to enable large-scale observation of datasets as they move through a complex pipeline.

> Logically, an OpenLineage backend learns about Datasets primarily by receiving information about Jobs. Most Jobs have at least one input or output Dataset, and a lineage graph can be created by weaving together observations of many Jobs across multiple platforms.

> The RunEvent is prepared and sent when something important occurs within your pipeline, and each one can be thought of as a distinct observation. This commonly happens when a Job starts or finishes.

Contents:
1. OpenLineage's object model: Jobs, Datasets, Runs and RunEvents — named here only as the complement OTel is contrasted against; the full event/facet model is topic 11's.
