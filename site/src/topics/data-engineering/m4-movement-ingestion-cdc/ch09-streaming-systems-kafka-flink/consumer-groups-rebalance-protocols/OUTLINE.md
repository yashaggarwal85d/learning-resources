# Outline: Consumer groups and rebalance protocols (`de.consumer-groups-rebalance-protocols`)

## Claims list (all sourced in SOURCES.md)

1. A committed offset is itself a record in the internal, compacted `__consumer_offsets` topic.
2. The classic protocol relies on a group-wide synchronization barrier: a rebalance of the whole
   group runs whenever any member joins, leaves or fails.
3. Eager mode revokes every member's partitions before rejoining the group during a rebalance.
4. Cooperative mode only revokes the specific partitions a member no longer owns.
5. KIP-848 is GA in Kafka 4.0, production-ready, and removes the global synchronization barrier
   in favor of a fully incremental design.
6. Assignment under KIP-848 is computed and controlled on the server (broker) side, not by a
   client-side leader.
7. Static membership (a configured `group.instance.id`) means a rejoining member keeps its
   identity, so no rebalance is triggered by a brief restart.
8. KIP-848's own evolution timeline (KIP-1274) shows classic being phased out: 5.0 makes the new
   protocol the default, 6.0 drops client support for classic entirely.
9. The Streams rebalance protocol (KIP-1071) is enabled by default on new clusters starting with
   Kafka 4.2, extending KIP-848's broker-driven model to Kafka Streams.
10. KIP-1071 ships with a stated limited feature set (no topology updates without a new group, no
    rack-aware assignment built in, no regex subscriptions, no online classic migration).

## Storyboard (10 steps)

1. **Hook**: scaling a consumer group from eight to nine members stalls the whole group's
   consumption under the classic eager protocol, measured on a real toy reassignment.
2. **Setup**: a consumer group's committed offsets live in the same kind of log this chapter
   keeps building — the compacted `__consumer_offsets` topic — and partitions divide across
   members, who don't always agree calmly about who owns what.
3. **Predict**: when membership changes, does every member pause, or only the ones whose
   partitions actually move?
4. **Reveal**: a real toy reassignment — adding a ninth member to an eight-member group over 24
   partitions moves only 3 members' assignments, not all 9.
5. **Reveal**: eager pauses all 9 members regardless; cooperative/incremental pauses only the 3
   actually affected — measured side by side.
6. **Predict**: does a brief restart with a persistent configured identity still force a
   rebalance?
7. **Reveal**: static membership — a fast restart under a configured `group.instance.id` never
   triggers a rebalance; a slow one, or no configured id at all, does.
8. **Reveal**: KIP-848 moves assignment itself to the broker, and the Streams rebalance protocol
   (KIP-1071) extends the same broker-driven model to Kafka Streams, with its own limited
   feature set.
9. **Prove it**: every number from this reel read straight off a real run of `examples.py`.
10. **Recap**: offsets as a log, a rebalance that no longer stalls the whole group, static
    membership avoiding the needless case, and the same broker-driven shape extended to Streams.

## Concept ledger

Introduces: `consumer-group-offsets`, `rebalance-protocol-comparison`.
Uses: `partition-segment-index` (topic 1), `kraft-controller-quorum` (topic 4).
