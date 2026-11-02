- **Consumer group**: a set of consumers that divide a topic's partitions among themselves and
  track progress together. *Where you meet it:* the setup step onward.
- **Group coordinator**: the broker role that manages a group's membership and assignment.
  *Where you meet it:* the setup step, and the static-membership predict/reveal pair.
- **Rebalance**: the process of recomputing and reassigning partitions when a group's membership
  changes. *Where you meet it:* the hook, and every step after it.
- **Eager**: the classic rebalancing mode that revokes every member's partitions before
  reassigning, regardless of what actually changed. *Where you meet it:* the first
  predict/reveal pair.
- **Cooperative-sticky**: a rebalancing mode that only revokes the specific partitions a member
  no longer owns. *Where you meet it:* the first predict/reveal pair.
- **Static membership**: a configured `group.instance.id` that lets a member rejoin after a
  brief restart without triggering a rebalance. *Where you meet it:* the second
  predict/reveal pair.
- **KIP-848**: the newer, broker-driven consumer rebalance protocol, GA since Kafka 4.0.
  *Where you meet it:* the last reveal before the recap.
