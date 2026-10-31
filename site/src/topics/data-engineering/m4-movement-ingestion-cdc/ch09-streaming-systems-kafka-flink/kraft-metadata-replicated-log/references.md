Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, toy controller-quorum models, no real multi-node KRaft controller quorum
available): a direct arithmetic heartbeat-fencing threshold check; a toy comparison of
standard-vote versus pre-vote disruption counts under a repeatedly-partitioned, unwinnable
candidate; and a toy one-voter-change-at-a-time admission rule, both serialized and concurrent.
The controller-quorum, heartbeat-fencing, pre-vote and dynamic-quorum mechanisms are disclosed,
sourced-only claims from Kafka's own accepted KIPs, since no real controller quorum runs in this
sandbox.

- Apache Kafka, KIP-500, "Replace ZooKeeper with a Self-Managed Metadata Quorum":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum).
  The controller-quorum definition, the survives-f-failures math, the pull-based MetadataFetch
  API, the heartbeat-doubles-as-fetch rule, and the stale-broker failure mode this topic's hook
  and first predict/reveal pair quote directly.
- Apache Kafka, KIP-866, "ZooKeeper to KRaft Migration":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-866+ZooKeeper+to+KRaft+Migration).
  The bridge-release definition and its dual-write rollback mechanism this topic teaches as a
  concept, without asserting an unconfirmed version number. **Note:** no source fetchable in
  this sandbox names a specific bridge-release version — see `FACT-CHECK.md`'s correction.
- Apache Kafka, KIP-996, "Pre-Vote":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-996%3A+Pre-Vote).
  The canvassing-before-bumping-the-epoch mechanism this topic's second predict/reveal pair
  reimplements and measures directly.
- Apache Kafka, KIP-853, "KRaft Controller Membership Changes":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-853%3A+KRaft+Controller+Membership+Changes).
  The AddVoter/RemoveVoter RPCs and the one-voter-change-at-a-time rule this topic's last
  predict/reveal pair models.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=kraft-metadata-replicated-log:%20).
