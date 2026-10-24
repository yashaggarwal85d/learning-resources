# Sources — Retention, compaction, and tiered storage

## Confluent Documentation — Kafka Log Compaction
URL: https://docs.confluent.io/kafka/design/log_compaction.html
Fetched: 2026-10-24, cached at `sources/confluent-log-compaction.txt`.
> Topic compaction is a mechanism that allows you to retain the latest value for each message key in a topic,
> while discarding older values. It guarantees that the latest value for each message key is always
> retained within the log of data contained in that topic, making it ideal for use cases such as restoring state after system failure
> or reloading caches after application restarts.

> Log compaction is a mechanism to provide finer-grained per-record retention instead of coarser-grained time-based retention.
> Records with the same primary key are selectively removed when there is a more recent update. This way the log is guaranteed to
> have at least the last state for each key.

> A message with a key and a null payload (note that a string value of null
> is not sufficient) will be treated as a delete from the log. These null payload messages are also called tombstones.
> Similar to when a new message with the same key arrives, this delete marker results in the deletion
> of the previous message with the same key. However, delete markers (tombstones) are
> special in that they are also cleaned out of the log after a period of time to free up space.

## Apache Kafka — Design (GitHub)
URL: https://raw.githubusercontent.com/apache/kafka/trunk/docs/design/design.md
Fetched: 2026-10-24, cached at `sources/kafka-design-md.txt`.
> Log compaction is a mechanism to give finer-grained per-record retention, rather than the coarser-grained time-based retention. The idea is to selectively remove records where we have a more recent update with the same primary key. This way the log is guaranteed to have at least the last state for each key.

> A message with a key and a null payload will be treated as a delete from the log. Such a record is sometimes referred to as a _tombstone_. This delete marker will cause any prior message with that key to be removed (as would any new message with that key), but delete markers are special in that they will themselves be cleaned out of the log after a period of time to free up space.
