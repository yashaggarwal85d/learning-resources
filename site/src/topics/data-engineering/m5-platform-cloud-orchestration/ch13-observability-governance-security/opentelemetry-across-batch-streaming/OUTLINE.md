# Outline — de.opentelemetry-across-batch-streaming

**Kind:** full, §13.1. About 15 minutes. Hosts the tracing half of the §13.1 chapter lab.

## Scope (full syllabus line, six clauses)

"OTel signals and the Collector, W3C trace-context propagation through Kafka headers, span
links for fan-in batch steps, semantic conventions for messaging and databases, following one
record from CDC to warehouse; OTel (operational telemetry) vs OpenLineage (lineage metadata) as
complements (§13.3)."

- Clause 1: OTel's signals (traces, metrics, logs, baggage) and the Collector as a vendor-agnostic
  receive/process/export pipeline, so applications export once (OTLP) and routing is config.
- Clause 2: `traceparent`'s fixed version-trace_id-parent_id-flags format, injected into a Kafka
  record's headers by the producer and extracted by the consumer, since a Kafka hop carries no
  HTTP request to carry it automatically.
- Clause 3: span links as the default correlation for a batch receive, because a span has only
  one parent, a batch has many producers, and a consumer may already be inside another ambient
  span — and the SDK's own configurable `LinkCountLimit` (default 128), so a receive spanning more
  messages than that drops links beyond it.
- Clause 4: the shared and Kafka-specific semantic-convention attribute names
  (`messaging.destination.name`, `messaging.destination.partition.id`) that make a Kafka trace and
  a database trace queryable the same way.
- Clause 5: following one record from a CDC write, through Kafka, through a Spark aggregation, to
  a warehouse row — with the honest edge named directly from Debezium's own documentation: the
  database write is where automatic propagation breaks, and trace metadata must be explicitly
  carried across it.
- Clause 6: OTel versus OpenLineage as complements — operational, per-execution telemetry versus
  per-run lineage metadata — sharing only the idea of a run identifier, not a data model.

## Outcomes

Draw the path of a trace context through a produce, a consume and a batch step and say where each
header is injected and extracted; explain why a batch receive uses links and not a parent; name
the semantic-convention attributes a Kafka consumer span should carry; run a record from a CDC
source to a warehouse write and show the trace, naming the one real break in automatic propagation;
say in one sentence what OpenTelemetry records that OpenLineage does not, and the reverse.

## Concept ledger

- **Introduces:** `otel-signals-collector`, `trace-context-propagation-kafka-headers`,
  `span-links-fan-in`, `otel-vs-openlineage`.
- **Uses:** `structured-logs-correlation-ids`, `pipeline-golden-signals`, `push-vs-pull-metrics`
  (topic 1, live in this chapter).
- **Declared (gap, logged per CHAPTER.md §"Cross-chapter ids"):** Chapter 5's `queues-vs-logs` and
  `physical-vs-logical-replication` concepts are cited by `CHAPTER.md` as live Chapter 5 ids, but
  at this topic's build time Chapter 5 itself is mid-build (tail unfinished; checked against
  `registry.ts` — `physical-vs-logical-replication` is live, `queues-vs-logs` is **not** in
  `registry.ts` under that id). Treated as `declared`, not `uses`, since the id cannot be resolved.
  Chapter 8's CDC architecture and Chapter 9's Kafka records/headers and Flink/Spark consumers
  (both named `uses` by `CHAPTER.md`) are also `declared`: both chapters are unbuilt, confirmed by
  the absence of any `ch08`/`ch09` folder under `data-engineering/m4-movement-ingestion-cdc` at
  this topic's build time (a `ch09-streaming-systems-kafka-flink` `CHAPTER.md` has just landed
  from a sibling thread, planning only — no topics built yet, so no `introduces` id exists).

## Storyboard (10 steps)

1. **Hook + Predict.** One order is wrong in the warehouse. It entered through a database change,
   crossed a Kafka topic, was folded into a nightly Spark aggregate and landed in a table. The
   three systems log perfectly and independently. How do you find the one hop where it went wrong
   without grepping three clusters by order id? Predict: a parent-child chain, a shared order id,
   or links.
2. **Reveal: OTel's signals and the Collector.** Traces, metrics, logs and baggage, all exported
   once (OTLP) through a Collector that receives, processes and exports — so an application
   doesn't pick a backend, the Collector's config does.
3. **Reveal: the traceparent header.** The fixed version-trace_id-parent_id-flags format, injected
   into a Kafka record's own headers at produce time; nothing like an HTTP request carries it
   across that hop on its own.
4. **Reveal: why links, not parent-child, for a batch receive.** A span has exactly one parent. A
   batch receive has many producers behind it, and a consumer may already be inside another span
   entirely. Links are the only structure that survives all three cases at once.
5. **Reveal: the link limit, and what it costs.** The SDK's own configurable cap (128 by default)
   on how many links one span can carry; a nightly aggregation folding in far more messages than
   that drops the rest. Takeaway.
6. **Reveal: semantic conventions.** The same attribute names — a destination, a partition — making
   a Kafka consumer span and a database span queryable identically, not as two different
   vocabularies.
7. **Reveal: the honest break — CDC to warehouse.** The record's own path, traced end to end,
   except at one real seam: a database write is where Debezium's own documentation says automatic
   propagation stops, and trace metadata has to be carried across it on purpose. Takeaway.
8. **Reveal: OTel vs OpenLineage.** One answers "what happened to this execution and how long did
   it take," the other "which datasets did this job read and write, this run." They share only the
   idea of a run id — not a data model, not a question. Takeaway.
9. **Recap.** A header crossing a hop with no request to carry it; links where a parent can't
   exist; one real seam named honestly; two standards answering two different questions.
10. **Prove it.** A nightly Spark job reads a million Kafka records in one batch and writes one
    row. The consumer span's links are capped at 128. What does the trace actually show for
    message 129, and does that mean the data itself is wrong, or only that the trace is
    incomplete?

Engagement arc: hook + predict on step 1 (within the first four steps); mechanism built through
contrast (steps 2-4, 6); the surprising cost at step 5 (the link limit, a real dropped-link count
from `examples.py`); a second surprising number at step 7 (the CDC break, honestly disclosed, not
glossed over); takeaways at steps 5, 7, 8 (all at or after the midpoint of step 5); recap at step
9; Prove it at step 10.

## Examples to execute

`examples.py`, synthetic (no real Kafka broker required on this build machine; the record carrier
is a local in-memory queue with a header map, and the Kafka-specific attribute names are sourced
from the semantic conventions rather than reproduced live, disclosed per `CHAPTER.md` §"Engine of
record"):

1. `traceparent_injected_and_extracted`: build a synthetic `traceparent` string in the documented
   format, inject it into a record's header dict at "produce," extract and parse it at "consume,"
   and assert the parsed trace_id matches exactly across the hop.
2. `batch_receive_needs_links_not_parent`: simulate a batch receive accounting for multiple
   producer messages; assert a single-parent span object cannot represent more than one producer
   context, while a links list can hold all of them.
3. `link_count_limit_drops_excess`: simulate a batch of n messages against the documented default
   `LinkCountLimit` of 128; assert exactly 128 links are kept and `n - 128` are counted as dropped
   for n greater than the limit, and 0 are dropped for n at or under it.
4. `cdc_to_warehouse_trace_with_one_break`: simulate a four-hop trace (CDC write, Kafka produce,
   Spark aggregate, warehouse write) carrying one shared trace_id through three hops
   automatically and assert the fourth (the CDC write itself) requires the trace_id to be passed
   explicitly — assert a run without that explicit pass loses the trace_id at that hop.
5. `otel_vs_openlineage_overlap`: two synthetic event records (an OTel span, an OpenLineage
   RunEvent) for the same job run; assert their field sets intersect only on a run identifier and
   otherwise share no keys.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 1's handoff verbatim): "Logs and metrics are written
  by one process and read in one place. A single order, though, crosses a Kafka topic, a Spark job
  and a warehouse, and no process sees the whole journey. This topic is how a trace follows one
  record across those hops."
- **Handoff** (to topic 3, verbatim): "Now there is telemetry worth reading. A dashboard that
  nobody watches changes nothing; an alert that fires on every blip teaches people to ignore it.
  The next topic is the rule that decides when a symptom is worth waking someone: SLO burn-rate
  alerting."

## Claims list

1. OpenTelemetry's signals are traces, metrics, logs and baggage (profiles/events proposal-stage).
   — OpenTelemetry Signals docs.
2. The Collector is a vendor-agnostic receive/process/export pipeline. — OpenTelemetry Collector
   docs.
3. `traceparent` is a fixed, portable format; compliant tools must at minimum forward it. — W3C
   Trace Context Recommendation.
4. Messaging spans use links as the default correlation because of the single-parent limit, batch
   fan-in, and ambient-context cases. — OpenTelemetry messaging-spans semantic conventions.
5. The default span link count limit is 128 (`LinkCountLimit`). — OpenTelemetry Tracing SDK spec.
6. `messaging.destination.partition.id` identifies a partition uniquely within
   `messaging.destination.name`. — OpenTelemetry Kafka semantic conventions.
7. Debezium supports OpenTelemetry tracing, but a database write is a real propagation break
   requiring explicit trace metadata. — Debezium Distributed Tracing docs.
8. OpenLineage's object model (Job, Dataset, Run, RunEvent) describes what a job read/wrote per
   run. — OpenLineage Object Model docs.
9. The `examples.py` measured experiments (1-5 above), executed and asserted. — `FACT-CHECK.md`.

## Changes from the chapter plan

Two gaps, both logged rather than guessed, neither changing what the topic teaches:

1. `CHAPTER.md` cites Chapter 5's `queues-vs-logs` as a live `uses` id; at this topic's build time
   it is not in `registry.ts` (Chapter 5's own tail, including this concept, is still being built
   by a sibling thread). Re-classified `declared`.
2. `CHAPTER.md` cites Chapter 8 §8.2 (CDC architecture) and Chapter 9 §9.1/§9.3 (Kafka
   records/headers; Flink/Spark as consumers) as `uses` sources; both chapters are unbuilt (Chapter
   9 has a fresh `CHAPTER.md` from a sibling thread as of this build, but no topics yet). Both
   `declared`, per `CHAPTER.md`'s own anticipated resolution.
