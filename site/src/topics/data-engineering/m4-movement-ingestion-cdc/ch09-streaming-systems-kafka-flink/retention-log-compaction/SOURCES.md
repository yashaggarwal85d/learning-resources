Sources fetched and quoted for `de.retention-log-compaction`.

## Apache Kafka 4.4 topic configuration reference

URL: https://kafka.apache.org/44/generated/topic_config.html

> This config designates the retention policy to use on log segments. The "delete" policy (which
> is the default) will discard old segments when their retention time or size limit has been
> reached. The "compact" policy will enable log compaction, which retains the latest value for
> each key.

> The amount of time to retain delete tombstone markers for log compacted topics. This setting
> also gives a bound on the time in which a consumer must complete a read if they begin from
> offset 0 to ensure that they get a valid snapshot of the final stage (otherwise delete
> tombstones may be collected before they complete their scan).

> The maximum time a message will remain ineligible for compaction in the log. Only applicable
> for logs that are being compacted.

> This configuration controls how frequently the log compactor will attempt to clean the log
> (assuming log compaction is enabled). By default we will avoid cleaning a log where more than
> 50% of the log has been compacted. This ratio bounds the maximum space wasted in the log by
> duplicates (at 50% at most 50% of the log could be duplicates).

> This configuration controls the maximum time we will retain a log before we will discard old
> log segments to free up space if we are using the "delete" retention policy.

## Apache Kafka 4.4 design documentation (Log Compaction)

URL: https://kafka.apache.org/44/design/design/

> Log compaction ensures that Kafka will always retain at least the last known value for each
> message key within the log of data for a single topic partition.

> This way the log is guaranteed to have at least the last state for each key.

> Any consumer progressing from the start of the log will see at least the final state of all
> records in the order they were written. Additionally, all delete markers for deleted records
> will be seen, provided the consumer reaches the head of the log in a time period less than the
> topic's delete.retention.ms setting (the default is 24 hours). In other words: since the
> removal of delete markers happens concurrently with reads, it is possible for a consumer to
> miss delete markers if it lags by more than delete.retention.ms.

> Log compaction is handled by the log cleaner, a pool of background threads that recopy log
> segment files, removing records whose key appears in the head of the log.

Notes on this topic's research: both sources are the same version-pinned, fully-rendered Kafka
4.4 pages used for topics 1-3's configuration and design-doc claims, so no new URL-finding
problem this topic.
