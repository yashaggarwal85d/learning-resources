Sources fetched and quoted for `de.kafka-tiered-storage`.

## KIP-405: Kafka Tiered Storage (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-405%3A+Kafka+Tiered+Storage

> This KIP has been merged and marked production-ready since Kafka 3.9.

> It does not support compact topics with tiered storage. Topic created with the effective value
> for remote.storage.enable as true, can not change its retention policy from delete to compact.

> RemoteLogManager (RLM) is a new component which receives callback events for leadership changes
> and stop/delete events of topic partitions on a broker. delegates copy, read, and delete of
> topic partition segments to a pluggable storage manager(viz RemoteStorageManager) implementation
> and maintains respective remote log segment metadata through RemoteLogMetadataManager.

> It checks for rolled over LogSegments (which have the last message offset less than last stable offset of that topic partition) and copies them along with their offset/time/transaction/producer-snapshot indexes and leader epoch cache to the remote tier.

## Apache Kafka 4.4 operations documentation: Tiered Storage

URL: https://kafka.apache.org/44/operations/tiered-storage/

> In the tiered storage approach, Kafka cluster is configured with two tiers of storage - local
> and remote. The local tier is the same as the current Kafka that uses the local disks on the
> Kafka brokers to store the log segments. The new remote tier uses external storage systems, such
> as HDFS or S3, to store the completed log segments.

> RemoteStorageManager is an interface to provide the lifecycle of remote log segments and
> indexes. Kafka server doesn't provide out-of-the-box implementation of RemoteStorageManager.
> Users must configure remote.log.storage.manager.class.name and
> remote.log.storage.manager.class.path to specify the implementation of RemoteStorageManager.

> The configuration prefixed with local are to specify the time/size the "local" log file can
> accept before moving to remote storage, and then get deleted. If unset, The value in
> retention.ms and retention.bytes will be used.

> No support for compacted topics

## Apache Kafka 4.4 configuration reference: Tiered Storage Configs

URL: https://kafka.apache.org/44/configuration/tiered-storage-configs/

> The number of milliseconds to keep the local log segments before it gets eligible for deletion.
> Default value is -2, it represents log.retention.ms value is to be used. The effective value
> should always be less than or equal to log.retention.ms value.

Notes on this topic's research: KIP-405's cwiki page is the primary source for the production-
readiness claim (confirmed: merged and production-ready since 3.9) and the compacted-topics
limitation (stated twice, independently, by the operations doc and the KIP itself). The
operations/tiered-storage page's own URL was found via the same sidebar `id=m-44...` trick used in
earlier topics this chapter (grep `/44/operations/basic-kafka-operations/`'s raw HTML for
`id=m-44operations...`, since the obvious `/44/documentation/#tiered_storage` URL is a client-side
JS redirect that `sources.mjs fetch` cannot follow).
