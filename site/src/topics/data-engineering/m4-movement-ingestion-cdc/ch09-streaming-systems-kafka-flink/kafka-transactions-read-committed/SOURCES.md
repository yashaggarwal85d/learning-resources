Sources fetched and quoted for `de.kafka-transactions-read-committed`.

## KIP-98: Exactly Once Delivery and Transactional Messaging (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging

> We introduce a new entity called a Transaction Coordinator. Similar to the consumer group
> coordinator, each producer is assigned a transaction coordinator, and all the logic of assigning
> PIDs and managing transactions is done by the transaction coordinator.

> We introduce a new internal kafka topic called the Transaction Log. Similar to the Consumer
> Offsets topic, the transaction log is a persistent and replicated record of every transaction.
> The transaction log is the state store for the transaction coordinator, with the snapshot of the
> latest version of the log encapsulating the current state of each active transaction.

> This request is issued by the transaction coordinator to the the leader of each TopicPartition
> which is part of the transaction. Upon receiving this request, each broker will write a
> COMMIT(PID) or ABORT(PID) control message to the log.

> If the transactional.id configuration is set, this TransactionalId passed along with the
> InitPidRequest, and the mapping to the corresponding PID is logged in the transaction log in
> step 2a. This enables us to return the same PID for the TransactionalId to future instances of
> the producer, and hence enables recovering or aborting previously incomplete transactions.

## Apache Kafka 4.4 design documentation

URL: https://kafka.apache.org/44/design/design/

> In the default "read_uncommitted" isolation level, all messages are visible to consumers even if
> they were part of an aborted transaction, but in "read_committed" isolation level, the consumer
> will only return messages from transactions which were committed (and any messages which were
> not part of a transaction).

> The producer configuration must set transactional.id to the name of the transactional ID to be
> used, which configures the producer for transactional delivery and also makes sure that a
> restarted application causes any in-flight transaction from the previous instance to abort.

## KIP-890: Transactions Server-Side Defense (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-890%3A+Transactions+Server-Side+Defense

> We have seen hanging transactions in Kafka where the last stable offset (LSO) does not update,
> we can't clean the log (if the topic is compacted), and read_committed consumers get stuck.

## Apache Kafka 4.4 operations documentation: Transaction Protocol

URL: https://kafka.apache.org/44/operations/transaction-protocol/

> Starting from Apache Kafka 4.0, Transactions Server Side Defense (KIP-890) brings a strengthened
> transactional protocol. When enabled and using 4.0 producer clients, the producer epoch is
> bumped on every transaction to ensure every transaction includes the intended messages and
> duplicates are not written as part of the next transaction.

## KIP-939: Support Participation in 2PC (Apache Kafka wiki)

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-939%3A+Support+Participation+in+2PC

> From that perspective, Kafka already has a 2PC implementation, but it's controlled by Kafka
> transaction coordinator. If we could support an external transaction coordinator, Kafka would be
> able to become a participant in a distributed transaction with other systems.

Notes on this topic's research: KIP-98 names the internal state-store topic "the Transaction Log"
(by analogy to the Consumer Offsets topic) but never literally spells the dash/underscore topic
name `__transaction_state` that CHAPTER.md's scope line names; none of the five sources fetched for
this topic state that literal string either. This topic therefore teaches the mechanism (a
dedicated internal topic storing transaction state) as directly confirmed, and names the specific
topic identifier only in `coverage.json`'s clause text (matching the syllabus line verbatim, per
the established research-correction pattern from topics 3/4), not as an on-screen claim — see
FACT-CHECK.md's correction section. The producer-config reference's `enable.idempotence`/
`transactional.id` requirements and the operations "Transaction Protocol" page's 4.0
production-readiness were both directly confirmed, as were the KIP-890 (LSO/hanging transactions)
and KIP-939 (2PC participation) design claims.
