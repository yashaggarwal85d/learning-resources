Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy offset-for-times index, a toy scoped replay, a toy backfill-source chooser,
and a toy overwrite-versus-versioned-sink comparison, no real Kafka cluster available): a
timestamp lookup that jumped cleanly to the right offset, a replay correctly scoped to one
partition and to a time range, a source choice that followed data age exactly, and a real diff
showing an overwrite losing data a versioned write kept. The `offsetsForTimes` and `seek`
mechanics are disclosed, sourced-only claims from Apache Kafka's own Javadoc; the general
replay-safety pattern draws on the same secondary, event-driven-architecture sources used in the
chapter's earlier deduplication topic.

- KafkaConsumer (Apache Kafka 4.4.0 API, Javadoc):
  [kafka.apache.org/44/javadoc/.../KafkaConsumer.html](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html).
  The `offsetsForTimes` and `seek` methods this topic's setup and reveal cite directly.
- Idempotent requests (Stripe API Reference):
  [docs.stripe.com/api/idempotent_requests](https://docs.stripe.com/api/idempotent_requests).
  The general safe-to-repeat pattern this topic's replay-safety reveal draws on, disclosed as a
  secondary, non-Kafka source per CHAPTER.md.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=replay-and-backfill:%20).
