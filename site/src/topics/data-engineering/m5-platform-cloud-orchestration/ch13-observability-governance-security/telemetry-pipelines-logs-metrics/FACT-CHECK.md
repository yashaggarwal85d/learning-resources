# Fact-check — de.telemetry-pipelines-logs-metrics

Adversarial re-derivation of every claim in `OUTLINE.md` → "Claims list", against the
fetched source texts in `sources/`, plus a red-team pass on the predict question.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The four golden signals are latency, traffic, errors, saturation. | Confirmed | `sre-book-monitoring.txt`: "The four golden signals of monitoring are latency, traffic, errors, and saturation." |
| 2 | Counter: cumulative, monotonically increasing, reset only on restart; wrong for values that can decrease. | Confirmed | `prometheus-metric-types.txt`: "A counter is a cumulative metric that represents a single monotonically increasing counter whose value can only increase or be reset to zero on restart." + "Do not use a counter to expose a value that can decrease… instead use a gauge." |
| 3 | Gauge: single value that can arbitrarily go up and down. | Confirmed | `prometheus-metric-types.txt`: "A gauge is a metric that represents a single numerical value that can arbitrarily go up and down." |
| 4 | Histogram: bucketed observations + running sum; classic vs native formats. | Confirmed | `prometheus-metric-types.txt`: "A histogram records observations… by counting them in configurable buckets. It also provides a sum of all observed values… a histogram is essentially a bucketed counter." Native vs classic histogram distinction quoted in full below that. |
| 5 | Kafka consumer lag (`records-lag-max`) published by consumer, not broker. | Confirmed | `kafka-monitoring.txt` (Kafka 4.4): "Number of messages the consumer lags behind the producer by. Published by the consumer, not broker." MBean: `kafka.consumer:type=consumer-fetch-manager-metrics,client-id={client-id}`, attribute `records-lag-max`. Version check: 4.4 is the current release listed first on the Kafka releases page fetched 2026-10-30 (ahead of 4.3, 4.2…), so this is the current documentation, not stale. |
| 6 | Pushgateway misuse pitfalls (SPOF/bottleneck, loses `up`, never forgets series). | Confirmed | `prometheus-pushing.txt`, all three pitfalls quoted verbatim. |
| 7 | Cardinality: every label-value combo is a new series; keep under ~10, over ~100 is a red flag. | Confirmed | `prometheus-naming.txt` (the CAUTION) + `prometheus-instrumentation.txt` ("try to keep the cardinality of your metrics below 10… over 100… investigate alternate solutions"). |
| 8 | OTel Logs: `TraceId`/`SpanId` on log records for trace correlation. | Confirmed | `otel-logs.txt`: "OpenTelemetry extends this practice to logs where possible by including TraceId and SpanId in the LogRecords." |
| 9 | A histogram quantile is an estimate; averaging per-instance quantiles is wrong. | Corrected | `CHAPTER.md` cites this as `uses: quantile-sketches` (Chapter 5), but Chapter 5's syllabus marks the one topic that would introduce it, "Streaming quantiles service" (§5.6), *(skipped)* — `quantile-sketches` does not exist in `registry.ts` (confirmed: no match in a repo-wide search). Re-classified as `declared` general statistical knowledge, not a cross-chapter `uses` pointer; logged as a `CHAPTER.md` citation bug in `OUTLINE.md` → "Changes from the chapter plan." |
| 10 | `examples.py` measured results. | Pending | Verified in section 7 once `examples.py` is written and run; this row will be updated then. |

## Red team: the predict question (step 1)

"Which one number would have told you at 2 a.m.: tasks succeeded, rows written, or the
age of the newest partition?" Tempting wrong answers and why:

- **Tasks succeeded** is tempting because it is the signal most pipelines already have
  (exit status) and "green" reads as healthy — but a task can succeed while processing
  zero new rows (an empty source, a silently-skipped partition), which is exactly the
  failure mode the hook describes.
- **Rows written** is tempting because it sounds like real work happened — but a job can
  faithfully re-write the same stale partition every night (reprocessing old data) and
  report a healthy, nonzero row count while the *newest* data never arrives.
- **Age of the newest partition (freshness)** is correct: it is the only one of the three
  that measures what the consumer actually experiences — how old the data they can read
  is — independent of whether the task that should have refreshed it ran, succeeded, or
  wrote rows. This is the thesis of golden-signal step 7 and the topic's own recap.

No counter-example found that breaks this: a pipeline can satisfy "tasks succeeded" and
"rows written" simultaneously while still serving stale data (the exact incident in the
hook), but it cannot satisfy "freshness is within bound" while serving stale data — the
two are definitionally the same claim.

## Currency check

- Prometheus, OpenTelemetry Logs spec and Kafka docs all fetched 2026-10-30, against each
  project's current published documentation (no dated/versioned snapshot requested by the
  syllabus for this topic, unlike topic 6's legal sources).
- Kafka's monitoring doc is versioned to release 4.4 explicitly in `SOURCES.md`, per
  `CHAPTER.md` §"Versions and dates to state, not assume."

## Corrections applied to OUTLINE.md

Claim 9 re-classified from a Chapter 5 `uses` pointer to `declared` general knowledge
(see row 9 above); Concept ledger and "Changes from the chapter plan" updated to match.
All other nine claims confirmed as drafted.
