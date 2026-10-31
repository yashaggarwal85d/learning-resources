# Fact-check: Delivery semantics and where duplicates arise (de.delivery-semantics-duplicates)

## Claims table

| Claim | Status | Source |
|---|---|---|
| At-most-once, at-least-once, exactly-once, stated as promises about the effect's delivery count | Confirmed, Kafka's own definitions | Kafka 4.4 design docs, "Message Delivery Semantics" |
| A lost producer ack creates ambiguity about whether the message committed | Confirmed | Kafka 4.4 design docs |
| Pre-0.11.0.0, a producer retry after a lost ack can duplicate a committed write | Confirmed | Kafka 4.4 design docs |
| Process-then-save-position on the consumer side reproduces the same record after a crash (at-least-once) | Confirmed | Kafka 4.4 design docs |
| Exactly-once in Kafka Streams is scoped to Kafka's own internal processing, not to arbitrary side effects (an RPC, a direct write) | Confirmed | Confluent engineering blog |

## Red-team

**Predict steps 3 and 5 (the two crash windows)** — the tempting wrong answer in each case is "the
broker just handles it correctly," skipping past the actual mechanism. The reel's reveals name the
precise sequence of events (ack lost → retry → duplicate; process → crash → unsaved position →
reprocess) rather than asserting the outcome without the mechanism, matching how the design docs
themselves walk through each ordering.

**Reveal step 7 (exactly-once is incomplete without naming the boundary)** — this claim is
deliberately falsifiable with a concrete counter-example per the outcome CHAPTER.md asks for: a
consumer that writes to a non-idempotent, non-transactional sink (e.g. an HTTP call with no
dedup key) turns Kafka's own at-least-once delivery straight back into duplicate side effects,
regardless of what guarantee the broker itself provides. This is the Confluent post's own stated
limitation (RPC calls and custom direct reads/writes are not covered), not an invented edge case.

**Toy measurements (`examples.py`)** — `producer_retry_window`, `consumer_crash_window`, and
`effect_count` are simplified standalone state machines modeling the rules stated in the design
docs, not a port of Kafka's actual producer/consumer code (no real broker runs in this sandbox).
The four producer outcomes and three consumer outcomes are exhaustive over the inputs the toy
model takes, not a claim of exhaustively modeling every real Kafka failure mode.

## Corrections

None needed — every claim traces directly to Kafka's own current design documentation (or, for
the end-to-end framing point, a disclosed secondary engineering source), matching the pattern from
topics 5-8: no unconfirmed version or behavior claim required downgrading.
