Sources fetched and quoted for `de.kafka-ordering-guarantees`.

## Apache Kafka 4.4 producer configuration reference

URL: https://kafka.apache.org/44/generated/producer_config.html

> When set to 'true', the producer will ensure that exactly one copy of each message is written
> in the stream. If 'false', producer retries due to broker failures, etc., may write duplicates
> of the retried message in the stream. Note that enabling idempotence requires
> max.in.flight.requests.per.connection to be less than or equal to 5 (with message ordering
> preserved for any allowable value), retries to be greater than 0, and acks must be 'all'.

> The maximum number of unacknowledged requests the client will send on a single connection
> before blocking. Note that if this configuration is set to be greater than 1 and
> enable.idempotence is set to false, there is a risk of message reordering after a failed send
> due to retries (i.e., if retries are enabled); if retries are disabled or if enable.idempotence
> is set to true, ordering will be preserved. Additionally, enabling idempotence requires the
> value of this configuration to be less than or equal to 5, because broker only retains at most
> 5 batches for each producer.

> Allowing retries while setting enable.idempotence to false and
> max.in.flight.requests.per.connection to greater than 1 will potentially change the ordering of
> records because if two batches are sent to a single partition, and the first fails and is
> retried but the second succeeds, then the records in the second batch may appear first.

## Apache Kafka 4.4 design documentation

URL: https://kafka.apache.org/44/design/design/

> Our topic is divided into a set of totally ordered partitions, each of which is consumed by
> exactly one consumer within each subscribing consumer group at any given time.

> The client controls which partition it publishes messages to. This can be done at random,
> implementing a kind of random load balancing, or it can be done by some semantic partitioning
> function. We expose the interface for semantic partitioning by allowing the user to specify a
> key to partition by and using this to hash to a partition (there is also an option to override
> the partition function if need be).

## Apache Kafka 4.4 operations documentation, "Basic Kafka Operations"

URL: https://kafka.apache.org/44/operations/basic-kafka-operations/

> Key Distribution Changes: If data is partitioned by hash(key) % number_of_partitions, the
> default partitioner's mapping logic changes when the partition count increases. This means that
> messages with the same key may be routed to different partitions after the expansion,
> potentially affecting message ordering guarantees for existing keys. Kafka will not attempt to
> automatically redistribute existing data.

Notes on this topic's research: all three sources are version-pinned, fully-rendered Kafka 4.4
pages, two of them (producer config, design doc) already used and confirmed clean in earlier
topics this chapter. No unconfirmed version claims in this topic's scope line.
