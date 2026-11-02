# Fact-check: Dead-letter and retry topics (de.dead-letter-retry-topics)

## Claims table

| Claim | Status | Source |
|---|---|---|
| Kafka Connect provides error reporting, and by default any conversion/transform error fails the connector | Confirmed | Kafka Connect user guide |
| Connectors can be configured to tolerate errors and write them to a dead letter queue topic | Confirmed | Kafka Connect user guide |
| `errors.tolerance=all` tolerates all errors instead of failing fast | Confirmed | Kafka Connect user guide |
| KIP-1034 adds dead letter queue support to Kafka Streams via `errors.dead.letter.queue.topic.name` | Confirmed | KIP-1034 wiki |
| KIP-1034 (KAFKA-16505) shipped in Kafka 4.2.0 | Confirmed | Apache Kafka 4.2.0 release notes |
| A retry topic lets most events process immediately while delaying others until conditions are met | Confirmed | Confluent error-handling-patterns blog |
| Events routed through a retry topic are not guaranteed to be processed in the original source-topic sequence | Confirmed | Confluent error-handling-patterns blog |

## Red-team

**Predict step 3 (does the main partition keep moving once a poison record is diverted?)** — the
tempting wrong answer is "it still blocks, just somewhere else." The toy
`NonBlockingRetryFlow.process` run confirms the main flow (`order-1, order-2, order-4, order-5`)
completes with the poison record (`order-3`) cleanly absent from it, not stalled on it.

**Predict step 6 (what happens to a record that fails through every retry tier?)** — the tempting
wrong answer is "it gets dropped silently" or "it retries forever." Both the Kafka Connect and
Kafka Streams mechanisms confirm the actual answer: a DLQ topic, not silent loss and not an
infinite loop — a bounded, observable endpoint.

**Toy measurements (`examples.py`)** — `BlockingPartition`, `NonBlockingRetryFlow`, and
`build_dlq_record` are simplified standalone models of the pattern described in the sources, not
ports of Kafka Connect's or Kafka Streams' actual error-handling code (no real Kafka Connect
worker or Streams app runs in this sandbox). `BlockingPartition.process_in_place` models an
infinite block as "stuck after N attempts" for a concrete, bounded demonstration, not a claim
that real in-place retry self-terminates.

## Corrections

Uber's own "Building Reliable Reprocessing and Dead Letter Queues with Apache Kafka" post, the
specific secondary source CHAPTER.md names for the tiered-retry-topic pattern, returned HTTP 406
from every URL tried in this sandbox (both `eng.uber.com` and multiple `uber.com` locale mirrors).
Confluent's own "Error Handling Patterns in Kafka" blog post was substituted in its place — it
documents the identical pattern (a retry topic, delayed re-execution, and the explicit ordering
trade-off, directly quoted) and is disclosed as the secondary source actually used; see SOURCES.md.
The specific `retry-5s`/`retry-1m`/`retry-1h` naming convention CHAPTER.md's scope line names is
taught as an illustrative convention, not as a claim independently confirmed by any source fetched
in this sandbox.
