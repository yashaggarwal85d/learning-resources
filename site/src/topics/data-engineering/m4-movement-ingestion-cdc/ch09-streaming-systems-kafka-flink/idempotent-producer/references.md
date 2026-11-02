Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy producer/broker model, no real Kafka broker available): a replayed-sequence
rejection, a cross-partition independence check, and a zombie-epoch fencing check. The PID, epoch,
and sequence-number mechanics are disclosed, sourced-only claims from the original KIP and
Kafka's own current documentation, since no real broker runs in this sandbox.

- KIP-98: Exactly Once Delivery and Transactional Messaging (Apache Kafka wiki):
  [cwiki.apache.org/confluence/display/KAFKA/KIP-98](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging).
  The PID, sequence number, and producer epoch mechanics this topic's reveals cite, read for the
  original design rationale.
- Apache Kafka 4.4 producer configuration reference:
  [kafka.apache.org/44/generated/producer_config.html](https://kafka.apache.org/44/generated/producer_config.html).
  `enable.idempotence`'s current requirements and its enabled-by-default status, confirmed still
  current in 4.4.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=idempotent-producer:%20).
