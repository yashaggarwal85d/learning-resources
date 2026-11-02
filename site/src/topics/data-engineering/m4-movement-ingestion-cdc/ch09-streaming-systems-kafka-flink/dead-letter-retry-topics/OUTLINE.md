# Storyboard: Dead-letter and retry topics (de.dead-letter-retry-topics)

10 steps. Covers poison messages blocking a partition, non-blocking tiered-delay retry topics and
the ordering they sacrifice, DLQ payload/metadata design, and the current Kafka Connect and Kafka
Streams mechanisms. No lab leg of its own, per CHAPTER.md.

1. **Hook** — a single malformed record blocks every record behind it in the same partition,
   forever, if retried in place.
2. **Setup** — dedup assumes a record can eventually be processed; some records never can, and
   retrying one in place blocks everything behind it in an ordered partition.
3. **Predict** — a poison record is diverted to a separate retry topic instead of retried in
   place. Does the main partition keep moving?
4. **Reveal** — yes: the main flow processes everything behind the poison record immediately,
   confirmed by the toy run's own main-flow order.
5. **Reveal** — the cost, named explicitly: a diverted record is now out of its original relative
   order (Confluent's own error-handling post: "not guaranteed to be processed in the same
   sequence").
6. **Predict** — a retry topic scheme uses tiered delays (5s, 1m, 1h lanes). What happens to a
   record that keeps failing through every tier?
7. **Reveal** — it lands in a dead-letter queue: a separate topic, carrying the original payload
   plus metadata, for an operator or replay tool to diagnose and act on.
8. **Reveal** — the two current, named mechanisms: Kafka Connect's `errors.tolerance` setting,
   and Kafka Streams' own DLQ handler support (KIP-1034, Kafka 4.2).
9. **Prove it** — the toy run: the in-place block stopping cold at the poison record, the
   non-blocking flow's main order skipping past it, and a real DLQ record's metadata fields.
10. **Recap** — poison messages, non-blocking tiered retry, the ordering cost, and DLQ metadata
    plus the current Connect/Streams mechanisms.

Prerequisites panel (CHAPTER.md): topics 7, 13 (Before this). Bridge from topic 13's handoff;
handoff into topic 15 (replay and backfill).
