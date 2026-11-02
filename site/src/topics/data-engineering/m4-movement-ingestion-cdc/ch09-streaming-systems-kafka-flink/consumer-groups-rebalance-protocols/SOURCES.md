Sources fetched and quoted for `de.consumer-groups-rebalance-protocols`.

## Apache Kafka, KIP-848: The Next Generation of the Consumer Rebalance Protocol

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol

> The protocol relies on a group-wide synchronization barrier. This means that a single
> misbehaving consumer can take down or disturb the whole group because a rebalance of the whole
> group is required whenever a consumer joins, leaves or fails.

> The current rebalance protocol supports two modes: Eager and Cooperative. In the eager mode,
> the consumer revokes all its partitions before rejoining the group during a rebalance. In the
> cooperative mode, the consumer does not revoke any partitions before rejoining the group.
> However, it revokes the partitions that it does not own anymore when it receives it new
> assignment and rejoins immediately if he had to revoke any partitions.

> As explained earlier, they will be persisted in the __consumer_offsets compacted topic.

## Apache Kafka 4.4 operations documentation, "Consumer Rebalance Protocol"

URL: https://kafka.apache.org/44/operations/consumer-rebalance-protocol/

> Starting from Apache Kafka 4.0, the Next Generation of the Consumer Rebalance Protocol
> (KIP-848) is Generally Available (GA), ready for production workloads.

> It improves the scalability of consumer groups while simplifying consumers. It also decreases
> rebalance times, thanks to its fully incremental design, which no longer relies on a global
> synchronization barrier.

> The assignment strategy is also controlled by the server.

> The evolution timeline of the Consumer rebalance protocol is described in KIP-1274, and
> expected to be as follows: Apache Kafka 3.7: Early Access Apache Kafka 4.0: GA
> (production-ready). Apache Kafka 5.0: KafkaConsumer defaults to Consumer protocol, while still
> supporting Classic Apache Kafka 6.0: KafkaConsumer only supports Consumer as rebalance
> protocol, while the broker still supports Classic for backward compatibility.

## Apache Kafka 4.4 design documentation (Static Membership)

URL: https://kafka.apache.org/44/design/design/

> Static membership aims to improve the availability of stream applications, consumer groups and
> other applications built on top of the group rebalance protocol. The rebalance protocol relies
> on the group coordinator to allocate entity ids to group members. These generated ids are
> ephemeral and will change when members restart and rejoin.

> Kafka's group management protocol allows group members to provide persistent entity ids. Group
> membership remains unchanged based on those ids, thus no rebalance will be triggered.

## Apache Kafka 4.4 Streams developer guide, "Streams Rebalance Protocol"

URL: https://kafka.apache.org/44/streams/developer-guide/streams-rebalance-protocol/

> The Streams Rebalance Protocol is enabled by default on new clusters starting with Apache
> Kafka 4.2. Both brokers and clients must be running Apache Kafka 4.2 or later to use this
> protocol.

> Instead of clients computing new assignments on the client during rebalance events involving
> all members of the group, assignments are computed continuously on the broker.

> Topology Updates: If a topology is changed significantly (e.g., by adding new source topics or
> changing the number of subtopologies), a new streams group must be created.

> High Availability Assignor: The sticky assignor is the only built-in assignor and it does not
> support rack aware assignment, but a custom assignor registered via group.streams.assignors
> can implement it.

Notes on this topic's research: the Kafka docs site's "Consumer Rebalance Protocol" and "Streams
Rebalance Protocol" pages are not under `/44/design/` as their nav-menu IDs suggest — they live
at `/44/operations/consumer-rebalance-protocol/` and
`/44/streams/developer-guide/streams-rebalance-protocol/` respectively (found by grepping the
rendered design page's sidebar `id` attributes, which encode the real path segments). Both of
`CHAPTER.md`'s version claims — KIP-848 GA in 4.0, KIP-1071 enabled by default on new clusters in
4.2 — are directly confirmed by these pages, unlike topics 3 and 4's unconfirmable version claims.
