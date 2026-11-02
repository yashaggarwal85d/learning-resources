Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, toy retention/compaction models, no real Kafka broker available): a segment-age
retention check, a dirty-ratio cleaning-trigger comparison, a compaction-lag-window check, and a
tombstone-visibility-versus-consumer-lag comparison. The retention and compaction mechanics are
disclosed, sourced-only claims from Kafka's own current documentation, since no real broker runs
in this sandbox.

- Apache Kafka 4.4 topic configuration reference:
  [kafka.apache.org/44/generated/topic_config.html](https://kafka.apache.org/44/generated/topic_config.html).
  `cleanup.policy`'s segment-granularity delete behavior, `delete.retention.ms`,
  `min`/`max.compaction.lag.ms`, and the default dirty-ratio threshold this topic's predict/reveal
  pairs quote directly.
- Apache Kafka 4.4 design documentation (Log Compaction):
  [kafka.apache.org/44/design/design/](https://kafka.apache.org/44/design/design/). The
  at-least-last-value guarantee, the tombstone-visibility guarantee for a consumer that lags past
  `delete.retention.ms`, and the log cleaner's order-preserving recopy mechanism this topic's
  last two reveals and recap cite.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=retention-log-compaction:%20).
