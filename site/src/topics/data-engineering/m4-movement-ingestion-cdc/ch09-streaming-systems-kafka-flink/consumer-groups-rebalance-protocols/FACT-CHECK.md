# Fact-check: Consumer groups and rebalance protocols (`de.consumer-groups-rebalance-protocols`)

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A committed offset is itself a record in the compacted `__consumer_offsets` topic. | Confirmed | KIP-848: "they will be persisted in the __consumer_offsets compacted topic." |
| 2 | The classic protocol relies on a group-wide synchronization barrier. | Confirmed | KIP-848: "The protocol relies on a group-wide synchronization barrier... a rebalance of the whole group is required whenever a consumer joins, leaves or fails." |
| 3 | Eager mode revokes every partition before rejoining. | Confirmed | KIP-848: "In the eager mode, the consumer revokes all its partitions before rejoining the group during a rebalance." |
| 4 | Cooperative mode only revokes partitions it no longer owns. | Confirmed | KIP-848: "In the cooperative mode, the consumer does not revoke any partitions before rejoining the group. However, it revokes the partitions that it does not own anymore..." |
| 5 | KIP-848 is GA in Kafka 4.0, removing the global synchronization barrier. | Confirmed | Operations docs: "Starting from Apache Kafka 4.0, the Next Generation of the Consumer Rebalance Protocol (KIP-848) is Generally Available (GA)... thanks to its fully incremental design, which no longer relies on a global synchronization barrier." |
| 6 | Assignment is computed server-side under KIP-848. | Confirmed | Operations docs: "The assignment strategy is also controlled by the server." |
| 7 | Static membership avoids a rebalance on rejoin. | Confirmed | Design docs: "Kafka's group management protocol allows group members to provide persistent entity ids. Group membership remains unchanged based on those ids, thus no rebalance will be triggered." |
| 8 | Classic is on a phase-out trajectory (5.0 default change, 6.0 removal). | Confirmed | Operations docs' Evolution Timeline: "Apache Kafka 5.0: KafkaConsumer defaults to Consumer protocol, while still supporting Classic. Apache Kafka 6.0: KafkaConsumer only supports Consumer as rebalance protocol..." |
| 9 | KIP-1071 enabled by default on new clusters since Kafka 4.2. | Confirmed | Streams developer guide: "The Streams Rebalance Protocol is enabled by default on new clusters starting with Apache Kafka 4.2." |
| 10 | KIP-1071 ships with a stated limited feature set. | Confirmed | Streams developer guide's "What's Not Supported in This Version": topology updates require a new group; the sticky assignor has no built-in rack-aware support; no regex subscriptions; no online classic migration. |

## Currency check

- KIP-848 and KIP-1071 are both directly confirmed, version-pinned, fully-rendered Kafka 4.4
  documentation pages (not just KIP text) — unlike topics 3 and 4, this topic's two headline
  version claims from `CHAPTER.md` are both independently sourced from Kafka's own current docs,
  not just the KIPs that proposed them. No unconfirmed-version correction is needed this topic.
- The Kafka docs site's in-page nav encodes real URLs in sidebar element `id` attributes (e.g.
  `id=m-44operationsconsumer-rebalance-protocol` → `/44/operations/consumer-rebalance-protocol/`)
  even when the obvious guessed path (under `/44/design/`) 404s — useful for any later topic
  hitting the same "page exists, exact URL isn't obvious" problem.

## Red team: predict step 3 ("does every member pause, or only the ones whose partitions moved?")

- Tempting wrong answer: "every member pauses, since a rebalance affects the whole group" — this
  is true for the *classic eager* protocol specifically, and the predict step is testing whether
  the reader conflates "a rebalance happens" with "every member is paused," which KIP-848's
  incremental design and cooperative-sticky both break apart.

## Red team: predict step 6 ("does a brief restart with a persistent identity still force a rebalance?")

- Tempting wrong answer: "yes, any restart leaves and rejoins the group, which always rebalances"
  — wrong because static membership's entire point, per the design doc, is that a persistent
  `group.instance.id` means "group membership remains unchanged," so a restart within the
  session timeout is invisible to the coordinator, not merely fast.

## Red team: the toy measurements themselves

- **`sticky_assignment_after_scale_up`**: deliberately not Kafka's real uniform/range/sticky
  assignor algorithm — it approximates "sticky" behavior by moving only the minimum number of
  partitions needed to give a new member its fair share, each taken from a different existing
  member in round-robin order, leaving every other assignment untouched. This isolates the one
  claim this topic needs (a membership change does not have to move every partition), not a
  faithful reimplementation of any specific real assignor's balancing strategy.
- **`eager_rebalance_pause` / `cooperative_sticky_pause`**: direct counts, not a simulation of
  real heartbeat/rejoin timing — `eager` pauses the full post-scale-up member count by
  definition (the protocol revokes everyone's partitions unconditionally); `cooperative` pauses
  exactly the members the sticky reassignment above actually touched. Re-derived by hand: 24
  partitions over 8 members scaling to 9 moves 2 partitions (`24 // 9`) to the new member, taken
  from 2 different donors, so 3 members are affected (2 donors + 1 new member) versus all 9 under
  eager — matches `examples.py`'s asserted `paused_members` of 3 and 9 respectively.
- **`static_membership_rebalance`**: a direct threshold comparison (`restart_ms >
  session_timeout_ms`) when a persistent id is configured, and an unconditional `True` when it
  isn't — modeling the sourced rule directly, not real session-timeout/heartbeat network timing.

## Corrections applied to OUTLINE.md

None needed — both of `CHAPTER.md`'s version claims (KIP-848 GA in 4.0, KIP-1071 default-on in
4.2) were directly confirmed by Kafka's own current documentation pages, unlike topics 3 and 4.
