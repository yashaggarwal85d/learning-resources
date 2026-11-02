Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy transaction-coordinator and toy log model, no real Kafka broker available):
a zombie write fenced by epoch, and an aborted transaction's records filtered from a
`read_committed` view while remaining visible under `read_uncommitted`. The coordinator, control
marker, LSO, KIP-890, and KIP-939 mechanics are disclosed, sourced-only claims from the original
KIPs and Kafka's own current documentation, since no real broker runs in this sandbox.

- KIP-98: Exactly Once Delivery and Transactional Messaging (Apache Kafka wiki):
  [cwiki.apache.org/confluence/display/KAFKA/KIP-98](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging).
  The transaction coordinator, the internal Transaction Log, and control markers this topic's
  reveals cite, read for the original design rationale.
- Apache Kafka 4.4 design documentation:
  [kafka.apache.org/44/design/design/](https://kafka.apache.org/44/design/design/).
  The `read_committed`/`read_uncommitted` isolation-level definitions and `transactional.id`'s
  restart-abort behavior.
- KIP-890: Transactions Server-Side Defense (Apache Kafka wiki):
  [cwiki.apache.org/confluence/display/KAFKA/KIP-890](https://cwiki.apache.org/confluence/display/KAFKA/KIP-890%3A+Transactions+Server-Side+Defense).
  The hanging-transaction problem this KIP fixes, and the LSO it names directly.
- Apache Kafka 4.4 operations documentation, Transaction Protocol:
  [kafka.apache.org/44/operations/transaction-protocol/](https://kafka.apache.org/44/operations/transaction-protocol/).
  Confirms KIP-890's epoch-bump-per-transaction defence completed in Kafka 4.0.
- KIP-939: Support Participation in 2PC (Apache Kafka wiki):
  [cwiki.apache.org/confluence/display/KAFKA/KIP-939](https://cwiki.apache.org/confluence/display/KAFKA/KIP-939%3A+Support+Participation+in+2PC).
  Kafka's own internal 2PC, and the design letting an external coordinator join it.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=kafka-transactions-read-committed:%20).
