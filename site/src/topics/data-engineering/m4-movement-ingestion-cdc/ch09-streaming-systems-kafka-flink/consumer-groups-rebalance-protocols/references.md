Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, toy rebalance models, no real multi-broker Kafka cluster available): a sticky
toy reassignment of partitions across a group membership change; a direct eager-versus-
cooperative paused-member count; and a toy static-membership rebalance-trigger check. The
rebalance-protocol mechanics, the offset-storage model, and both version/GA claims are disclosed,
sourced-only claims from Kafka's own current documentation and its own accepted KIP, since no
real broker runs in this sandbox.

- Apache Kafka, KIP-848, "The Next Generation of the Consumer Rebalance Protocol":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol).
  The classic protocol's global synchronization barrier, the eager-versus-cooperative revocation
  behavior, and the `__consumer_offsets` storage model this topic's setup and first
  predict/reveal pair quote directly.
- Apache Kafka 4.4 operations documentation, "Consumer Rebalance Protocol":
  [kafka.apache.org/44/operations/consumer-rebalance-protocol/](https://kafka.apache.org/44/operations/consumer-rebalance-protocol/).
  KIP-848's GA status since Kafka 4.0, its removal of the global barrier, the server-side
  assignment claim, and classic's own phase-out timeline (KIP-1274) this topic's last reveal and
  `post-notes.md` cite.
- Apache Kafka 4.4 design documentation (Static Membership):
  [kafka.apache.org/44/design/design/](https://kafka.apache.org/44/design/design/). The
  persistent-identity, no-rebalance-on-rejoin mechanism this topic's second predict/reveal pair
  measures.
- Apache Kafka 4.4 Streams developer guide, "Streams Rebalance Protocol":
  [kafka.apache.org/44/streams/developer-guide/streams-rebalance-protocol/](https://kafka.apache.org/44/streams/developer-guide/streams-rebalance-protocol/).
  KIP-1071's default-on status since Kafka 4.2 and its stated limited feature set, cited in the
  last reveal and the Frontier section.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=consumer-groups-rebalance-protocols:%20).
