# Sources — Acknowledgement points define durability

## Confluent Docs: Kafka Producer Configuration Reference
URL: https://docs.confluent.io/platform/current/installation/configuration/producer-configs.html
Fetched: 2026-10-24, cached at `sources/confluent-producer-configs.txt`.
> acks=0 If set to zero then the producer will not wait for any acknowledgment from the server at all.

> No guarantee can be made that the server has received the record in this case

> acks=1 This will mean the leader will write the record to its local log but will respond without awaiting full acknowledgement from all followers. In this case should the leader fail immediately after acknowledging the record but before the followers have replicated it then the record will be lost.

> acks=all This means the leader will wait for the full set of in-sync replicas to acknowledge the record. This guarantees that the record will not be lost as long as at least one in-sync replica remains alive. This is the strongest available guarantee.

## Confluent Docs: Kafka Topic Configuration Reference
URL: https://docs.confluent.io/platform/current/installation/configuration/topic-configs.html
Fetched: 2026-10-24, cached at `sources/confluent-topic-configs.txt`.
> Specifies the minimum number of in-sync replicas (including the leader) required for a write to succeed

> If acks=all and the current ISR set contains fewer than min.insync.replicas members, then the producer will raise an exception (either NotEnoughReplicas or NotEnoughReplicasAfterAppend).

> Regardless of the acks setting, the messages will not be visible to the consumers until they are replicated to all in-sync replicas and the min.insync.replicas condition is met.
