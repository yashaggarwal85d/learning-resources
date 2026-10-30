Last verified against these sources: 30 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy segmented log with a sparse offset index, no real Kafka broker available):
a real segment roll at a real configured byte limit; a real sparse index built the same way
Kafka's own `log.index.interval.bytes` works conceptually; a real seek-cost comparison between
the sparse-index path and a naive full scan, for the identical record; a real rewind-and-reread
proof that a consumer's offset change mutates no partition state. Zero-copy/`sendfile` and the
`segment.bytes`/`segment.ms`/`log.index.interval.bytes` real defaults are disclosed, sourced-only
claims from Kafka's own documentation and source, since no real broker runs in this sandbox.

- Apache Kafka, Design documentation ("Persistence", "Efficiency", "Consumer Position",
  "Configuring The Log Cleaner"): read from `docs/design/design.md` in the Apache Kafka source
  tree (trunk, post-4.4), since the live rendered page at
  [kafka.apache.org/documentation/#design](https://kafka.apache.org/documentation/#design)
  could not be fetched as static HTML. Page caching, zero-copy/`sendfile`, consumer-owned
  offsets, and the active segment's compaction exemption.
- Apache Kafka source, `TopicConfig.java` and `LogConfig.java`/`ServerLogConfigs.java`:
  [github.com/apache/kafka](https://github.com/apache/kafka/blob/trunk/clients/src/main/java/org/apache/kafka/common/config/TopicConfig.java).
  The real `segment.bytes` (one gigabyte), `segment.ms` (seven days) and
  `log.index.interval.bytes` (four thousand and ninety-six bytes) defaults this topic's toy log
  scales down from.
- Apache Kafka source, `storage/internals/log` module (read, not quoted): confirms the real
  three-file-per-segment shape (`.log`, `.index`, `.timeindex`) this topic's toy `Partition`
  class reimplements the shape of, not a line-by-line port.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=partitioned-log-segments-indexes:%20).
