Last verified against these sources: 30 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy single-partition accumulator, no real Kafka broker available): a real
request-count comparison for a `linger.ms`-zero versus Kafka's real-default-`linger.ms`
accumulator, for the identical record stream; a real compression-ratio measurement with the
`zstandard` and `lz4.frame` libraries themselves, on synthetic order-event records; a real
sticky-vs-round-robin partition-fill comparison for the identical keyless record stream; a real
toy leader-crash simulation comparing what an `acks=1` producer believed was durable against
what an `acks=all` producer believed, and what each actually kept. The real `batch.size`,
`linger.ms`, `acks` and `enable.idempotence` defaults, and the real Kafka 3.0 default change, are
disclosed, sourced-only claims from Kafka's own documentation and its own accepted KIPs, since no
real broker runs in this sandbox.

- Apache Kafka, producer configuration reference (`batch.size`, `linger.ms`, `compression.type`,
  `acks`, `enable.idempotence`):
  [kafka.apache.org/44/generated/producer_config.html](https://kafka.apache.org/44/generated/producer_config.html)
  (the generated, fully-rendered config-reference page; the unversioned
  [kafka.apache.org/documentation.html#producerconfigs](https://kafka.apache.org/documentation.html#producerconfigs)
  assembles client-side and can't be fetched as static HTML). The real defaults this topic's toy
  accumulator scales down from, and the exact wording of what each `acks` level guarantees.
- Apache Kafka, KIP-679, "Producer will enable the strongest delivery guarantee by default":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-679%3A+Producer+will+enable+the+strongest+delivery+guarantee+by+default).
  The exact before/after table for Kafka 3.0's client-default change (`enable.idempotence`
  false→true, `acks` 1→all) this topic's acks reveal cites directly.
- Apache Kafka, KIP-480, "Sticky Partitioner":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-480%3A+Sticky+Partitioner).
  The real motivation and behavior this topic's toy sticky-vs-round-robin comparison reimplements
  the shape of, not a line-by-line port.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=producer-batching-compression-acks:%20).
