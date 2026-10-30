# Outline — de.telemetry-pipelines-logs-metrics

**Kind:** full, §13.1. About 15 minutes. Opens Chapter 13 and answers Chapter 12's
final handoff.

## Scope (full syllabus line, four clauses)

"structured logs with correlation IDs (run, task, asset, partition), metric types
(counter, gauge, histogram), the pipeline golden signals (throughput, latency, error
rate, consumer lag, freshness, backlog), push vs pull collection."

- Clause 1: structured logs with correlation IDs — a log record as named fields, the
  correlation key `run_id · task_id · asset · partition` stamped on every record of one
  run, and the cost of an unstructured log at a hundred tasks.
- Clause 2: metric types — counter (monotonic), gauge (up/down), histogram (bucketed
  distribution + sum), and which question each can and cannot answer (a histogram's
  quantile is an estimate; averaging per-instance quantiles is wrong, per Chapter 5).
- Clause 3: the pipeline golden signals — throughput, latency, error rate, consumer lag,
  freshness, backlog; freshness as the one signal with no service analogue, measured as
  time since the newest successful partition; Kafka's `records-lag-max` as the concrete
  lag signal.
- Clause 4: push vs pull — Prometheus pulls from long-lived targets; a batch job that
  exits before a scrape needs the Pushgateway, with its documented pitfalls (single
  point of failure/bottleneck, loses `up`-based health, never forgets stale series).

## Outcomes

Rewrite an unstructured pipeline log as structured records carrying the correlation
key and say what query becomes possible; pick counter, gauge or histogram for six given
pipeline measurements and justify each; list the six pipeline golden signals and name
the metric that carries each, with freshness measured as time since the newest
successful partition; decide push or pull for a given job, citing what each loses.

## Concept ledger

- **Introduces:** `structured-logs-correlation-ids`, `metric-types-counter-gauge-histogram`,
  `pipeline-golden-signals`, `push-vs-pull-metrics`.
- **Uses:** `latency-percentiles`, `quantile-sketches`, `cron`, `process-model`, `exit-status`
  (all Chapter 1/4/5, live in `registry.ts`).
- **Declared (gap, logged per CHAPTER.md §"Cross-chapter ids"):** Chapter 11 §11.3 "Data
  SLIs, SLOs and error budgets" (freshness as an SLI) — Chapter 11 is not yet planned or
  built, so its `introduces` id does not exist in `registry.ts`. This topic treats
  freshness only as a metric to emit, never as an SLO target (that is topic 3's job,
  which has the same gap and the same resolution), and the gap closes automatically once
  Chapter 11 ships and a seam pass reconciles the pointer.

## Storyboard (11 steps)

1. **Hook + Predict.** The shop's `analytics.daily_revenue` table is stale. Every task
   shows green, no alert fired, a stakeholder found it at 9 a.m. Which one number, which
   the pipeline already had, would have told you at 2 a.m.? Predict: tasks succeeded,
   rows written, or the age of the newest partition.
2. **Reveal: a log record as fields, not a sentence.** The same incident as 300
   unstructured lines versus one filtered query, by the correlation key
   `run_id · task_id · asset · partition` stamped on every record of one run.
3. **Reveal: what a hundred-task pipeline costs without it.** The split-view count: how
   many lines a human greps versus how many a correlation-key query returns. Takeaway.
4. **Reveal: counter.** Rows processed, monotonic, reset only at restart; wrong for
   anything that can fall (queue depth).
5. **Reveal: gauge.** Queue depth and the last-success timestamp, arbitrary up and down,
   contrasted directly against the counter on the same pipeline strip.
6. **Reveal: histogram.** Task duration, bucketed with a running sum; a quantile read off
   the buckets is an estimate, and averaging per-instance quantiles is wrong (Chapter 5's
   own result, named not re-derived). Takeaway.
7. **Reveal: the six golden signals.** Throughput, latency, error rate, consumer lag,
   freshness, backlog — the service four (SRE book) plus the two a pipeline needs; the
   freshness sawtooth climbing between runs and dropping at each success, with the stale
   night drawn as the sawtooth climbing past its limit while every task bar stays green.
   Resolves the hook: freshness was the number. Takeaway.
8. **Reveal: push vs pull.** Prometheus pulls from long-lived targets; a batch job that
   finishes before a scrape cannot be pulled; the Pushgateway's own documented pitfalls
   (single point of failure/bottleneck, loses `up`, never forgets stale series) when
   misused as a general collector, with the OTel Collector named as the receiving-push
   alternative topic 2 builds. Takeaway.
9. **Lab beat: the series-explosion extension.** Add a per-customer label to a counter;
   the resulting series count and memory climb with customer count; remove the label. The
   full cost/cardinality syllabus topic is *(skipped)*; this beat and "Where this goes
   next" are where it's named, with Prometheus' own cardinality guidance quoted.
10. **Recap.** A record's own fields and key; the right metric type for the right
    question; six signals, one with no service analogue; push or pull, and what each
    loses.
11. **Prove it.** Given a new pipeline stage with no instrumentation yet, pick the
    correlation key, the metric type for three named measurements, and whether it should
    be pushed or pulled — and say which golden signal would have caught last night's
    stale table fastest.

Engagement arc: hook + predict on step 1 (within the first four steps, as required);
mechanism built through contrast (steps 2–6); the surprising number and the hook's
resolution at step 7 (the sawtooth past its limit while every task bar stays green);
three takeaways at steps 3, 6, 7 (all at or after the midpoint); step 8's push/pull
takeaway as a fourth; recap at step 10; Prove it at step 11.

## Examples to execute

`examples.py`, synthetic shop data (no real PII — see `CHAPTER.md`'s running example):

1. `unstructured_vs_structured_log_search`: generate ~300 synthetic unstructured log
   lines for one run plus the same run's structured records; measure and assert the line
   counts a human must grep versus the one correlation-key query's result count.
2. `counter_gauge_histogram_pick`: six synthetic pipeline measurements (rows processed,
   queue depth, task duration, consumer lag, last-success timestamp, error count); assert
   the correct metric type is picked for each by a simple classifier function and show why
   the wrong type fails (e.g. a counter can't represent queue depth falling).
3. `freshness_sawtooth_and_stale_night`: simulate 30 nightly runs' freshness curve
   (seconds since newest partition) and inject one stale night; assert the freshness
   metric crosses its threshold while a naive "tasks succeeded" check stays green the
   whole time — the hook's resolution, made numeric.
4. `pushgateway_vs_collector_batch_job`: simulate a batch job shorter than the scrape
   interval; assert a pull-only scraper misses it while a push (Pushgateway stand-in)
   records it; assert the Pushgateway's stale-series behavior (a job that stops pushing
   still reports its last value forever until deleted).
5. `series_explosion_per_customer_label`: compute the number of time series and estimated
   memory for a counter before and after adding a `customer_id` label across a growing
   synthetic customer count (10, 100, 1,000, 10,000), against Prometheus' own ~10/~100
   cardinality guidance.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers Chapter 12's final handoff verbatim): "The
  platform is now delivered and kept converged. That says nothing about whether it is
  healthy. This topic opens exactly that question: what a pipeline must emit, in logs,
  metrics and traces, for an incident to be visible in minutes instead of when a
  stakeholder notices."
- **Handoff** (to topic 2, verbatim): "Logs and metrics are written by one process and
  read in one place. A single order, though, crosses a Kafka topic, a Spark job and a
  warehouse, and no process sees the whole journey. The next topic is how a trace follows
  one record across those hops: OpenTelemetry."

## Claims list

1. The four golden signals are latency, traffic, errors, saturation. — Google SRE book.
2. A counter is a cumulative, monotonically increasing metric, reset only on restart; not
   for values that can decrease. — Prometheus metric types.
3. A gauge is a single numerical value that can arbitrarily go up and down. — Prometheus
   metric types.
4. A histogram records observations into configurable buckets plus a running sum; classic
   vs native histogram formats differ in efficiency and transfer atomicity. — Prometheus
   metric types.
5. Kafka's consumer lag (`records-lag-max`) is published by the consumer, not the broker,
   under the consumer-fetch-manager JMX metrics. — Apache Kafka 4.4 Monitoring docs.
6. The Pushgateway, misused as a general collector, becomes a single point of
   failure/bottleneck, loses the `up`-based health check, and never forgets a pushed
   series until it's manually deleted. — Prometheus pushing docs.
7. Every unique label-value combination is its own time series; keep per-metric
   cardinality under ~10 as a rule of thumb, treat over ~100 as a design problem. —
   Prometheus naming/instrumentation docs.
8. OpenTelemetry's Logs spec lets a log record carry `TraceId`/`SpanId` for correlation
   with a trace of the same execution context. — OpenTelemetry Logs spec (named as the
   bridge to topic 2; propagation mechanics are topic 2's, not taught here).
9. A quantile read off histogram buckets is an estimate, and averaging per-instance
   quantiles across machines is mathematically wrong. — Chapter 5's quantile-sketch topic
   (`uses`, not re-derived here).
10. The `examples.py` measured experiments (1–5 above), executed and asserted. —
    `FACT-CHECK.md`.

## Changes from the chapter plan

None yet identified; one open item to track through fact-check: Chapter 11 §11.3's
`introduces` id for the freshness-as-SLI concept does not exist in `registry.ts` because
Chapter 11 is unbuilt (see Concept ledger → Declared). Logged here per `CHAPTER.md`'s own
"Cross-chapter ids" rule rather than guessed.
