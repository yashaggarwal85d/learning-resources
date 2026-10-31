# Fact-check — de.opentelemetry-across-batch-streaming

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | OTel signals: traces, metrics, logs, baggage (profiles/events proposal-stage). | Confirmed | `otel-signals.txt`: "OpenTelemetry currently supports: Traces Metrics Logs Baggage Also under development or at the proposal stage: Events... Profiles." |
| 2 | Collector: vendor-agnostic receive/process/export pipeline. | Confirmed | `otel-collector.txt`, quoted verbatim. |
| 3 | `traceparent`: fixed, portable format; must be forwarded at minimum. | Confirmed | `w3c-trace-context.txt`, both quotes verified. |
| 4 | Links as default correlation: single-parent limit, batch fan-in, ambient-context case. | Confirmed | `otel-messaging-spans.txt`, all three reasons quoted verbatim from the spec's own "Important" box. |
| 5 | Default `LinkCountLimit` is 128. | Confirmed | `otel-trace-sdk.txt`: "LinkCountLimit (Default=128) - Maximum allowed span link count." |
| 6 | `messaging.destination.partition.id` is unique within `messaging.destination.name`. | Confirmed | `otel-kafka-conventions.txt`, quoted verbatim. |
| 7 | Debezium supports OTel tracing; a DB write is a real propagation break. | Confirmed | `debezium-tracing.txt`, both quotes verified; the doc's own wording ("must pass the trace metadata to Debezium") is the basis for calling this an honest, named break rather than glossing over it as automatic. |
| 8 | OpenLineage's object model: Job, Dataset, Run, RunEvent. | Confirmed | `openlineage-object-model.txt`, quoted verbatim. |
| 9 | `examples.py` measured results. | Pending | Verified once `examples.py` is written and run; updated then. |

## Red team: the predict question (step 1)

"A parent-child chain, a shared order id, or links?" Tempting wrong answers:

- **A parent-child chain** is tempting because that's the ordinary single-service trace shape
  (one span, one parent) — but the spec itself rules this out structurally for a batch: a span can
  have only one parent, and a Spark aggregate reading many Kafka records has many producer
  contexts behind it, not one.
- **A shared order id alone** (without the tracing machinery) is tempting because it's what a data
  engineer already has today — but that's exactly topic 1's own correlation-key idea, and the hook
  itself says the three systems "log perfectly and independently": a shared id across three
  separately-indexed logging systems still means three separate greps, not one query.
- **Links** is correct: it is the one structure the specification itself says survives all three
  constraints — single parent, batch fan-in, ambient context — at once, confirmed directly from
  the "Important" box in the messaging-spans semantic conventions (claim 4).

No counter-example found: a parent-child chain would require collapsing many producer contexts
into one parent, which the spec's own data model forbids (a span has exactly one parent field).

## Currency check

OpenTelemetry's Signals/Collector/messaging-spans/Kafka-conventions/Tracing-SDK pages, the W3C
Trace Context Recommendation, the Debezium stable-release docs, and OpenLineage's Object Model page
were all fetched 2026-10-30 against each project's current published documentation. No
dated/versioned snapshot is required by the syllabus for this topic (unlike topic 6's legal
sources).

## Corrections applied to OUTLINE.md

None required — all eight sourced claims confirmed as drafted. The two cross-chapter `uses` → 
`declared` reclassifications (Chapter 5's `queues-vs-logs`; Chapter 8/9) were already applied while
drafting `OUTLINE.md` → "Changes from the chapter plan," confirmed here by directly checking
`registry.ts` (no `queues-vs-logs` id present) and the `ch08`/`ch09` folders (CHAPTER.md only, no
topic folders).
