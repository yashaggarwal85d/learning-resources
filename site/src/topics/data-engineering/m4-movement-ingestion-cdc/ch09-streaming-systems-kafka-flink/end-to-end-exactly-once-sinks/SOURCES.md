Sources fetched and quoted for `de.end-to-end-exactly-once-sinks`.

## TwoPhaseCommitSinkFunction (Flink 1.20 API)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/api/java/org/apache/flink/streaming/api/functions/sink/TwoPhaseCommitSinkFunction.html

> This is a recommended base class for all of the SinkFunction that intend to implement
> exactly-once semantic. It does that by implementing two phase commit algorithm on top of the
> CheckpointedFunction and CheckpointListener.

> Pre commit must make all of the necessary steps to prepare the transaction for a commit that
> might happen in the future. After this point the transaction might still be aborted, but
> underlying implementation must ensure that commit calls on already pre committed transactions
> will always succeed.

> Commit a pre-committed transaction. If this method fail, Flink application will be restarted
> and recoverAndCommit(Object) will be called again for the same transaction.

## Fault Tolerance Guarantees (Apache Flink connector docs, 1.20)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/guarantees/

> To guarantee end-to-end exactly-once record delivery (in addition to exactly-once state
> semantics), the data sink needs to take part in the checkpointing mechanism.

> Cassandra sink at least once / exactly once exactly once only for idempotent updates

## Kafka Connector (Apache Flink docs, 1.20)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/connectors/datastream/kafka/

> In this mode, the KafkaSink will write all messages in a Kafka transaction that will be
> committed to Kafka on a checkpoint.

> it is highly recommended to tweak Kafka transaction timeout (see Kafka producer
> transaction.timeout.ms)

> maximum checkpoint duration + maximum restart duration or data loss may happen when Kafka
> expires an uncommitted transaction.

Notes on this topic's research: these two quotes are split around a stray "&raquo;" — a
double-escaped HTML entity that Flink's own page renders literally as text (intended as a ">>"
symbol between "transaction.timeout.ms)" and "maximum checkpoint duration") and that the
text-extraction step can't resolve. Splitting the quote at that point keeps every actual word of
the sentence verified intact, word for word against the fetched page, without the artifact
breaking the exact-match check. KIP-939 (already fetched and quoted in topic 11's SOURCES.md) is
reused by name only here, as CHAPTER.md directs, for the Kafka-side formalization of the same
two-phase pattern — not re-quoted in this topic's own checked quotes. No Flink mailing-list
post-mortem was independently fetchable in this sandbox within the session's time budget; the
transaction-timeout failure mode is instead sourced directly from Flink's own Kafka connector
docs above (the `ProducerFencedException` section), which documents the same mismatch as a
first-party, not secondary, source.
