# Fact-check — de.cdc-offsets-replay-exactly

## Claims against sources

1. **"In order to support exactly-once delivery guarantees for source connectors, the framework
   should be expanded to atomically write source records and their source offsets to Kafka, and
   to prevent zombie tasks from producing data to Kafka."**
   Source: KIP-618 (SOURCES.md quote 1). Direct match. Named only — this topic's own crash-and-
   replay measurement in step 4 is the contrast this design exists to close, not a reproduction
   of the design itself, since running it needs a JVM and a broker this sandbox doesn't have.

2. **"exactly.once.source.support STRING disabled HIGH Whether to enable exactly-once support
   for source connectors in the cluster by writing source records and their offsets in a Kafka
   transaction, and by proactively fencing out old task generations before bringing up new
   ones."**
   Source: KIP-618 (SOURCES.md quote 2). Direct match. Named only in step 7.

3. **"Currently, Debezium does not implement an internal deduplication layer to enforce
   exactly-once semantics."**
   Source: Debezium docs, Exactly-once delivery (SOURCES.md quote 3). Direct match. This
   topic's own `a_naive_consumer_without_its_own_dedup_double_counts_replayed_records` function
   measures the exact consequence: a reader with no dedup logic of its own counts every
   duplicated record twice.

4. **"it remains unclear whether the implementation is fully correct or if there are edge cases
   where exactly-once semantics might be violated,"** citing **"two Jepsen reports, one for
   Redpanda and another for Bufstream"** and open issues **"KAFKA-17734 KAFKA-17754
   KAFKA-17582."**
   Source: Debezium docs, Exactly-once delivery (SOURCES.md quotes 4-6). Direct match. Named
   only in `post-notes.md`'s Internals section.

5. **"The following Debezium source connectors support participation in Kafka Connect's
   exactly-once delivery: MariaDB MongoDB MySQL Oracle PostgreSQL SQL Server"**
   Source: Debezium docs, Exactly-once delivery (SOURCES.md quote 7). Direct match. Named only.

6. **"...Debezium provides exactly once delivery of every change event record. If a fault does
   happen then the system does not lose any events. However, while it is recovering from the
   fault, it's possible that the connector might emit some duplicate change events. In these
   abnormal situations, Debezium, like Kafka, provides at least once delivery of change
   events."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 8). Direct match. Measured
   directly: `a_crash_before_the_periodic_offset_commit_replays_already_produced_records`
   confirms the exact "duplicate change events" outcome against this sandbox's own decoded
   stream, with every one of the five inserts produced twice.

7. **"Whether to enable exactly-once support for source connectors in the cluster by using
   transactions to write source records and their source offsets, and by proactively fencing
   out old task generations before bringing up new ones. To enable exactly-once source support
   on a new cluster, set this property to 'enabled'. To enable support on an existing cluster,
   first set to 'preparing' on every worker in the cluster, then set to 'enabled'. A rolling
   upgrade may be used for both changes."**
   Source: Confluent docs, Kafka Connect configuration reference, substituting for the
   unreadable Apache Kafka page (SOURCES.md quote 9). Direct match. Named only in step 7, the
   two-rolling-upgrade enablement path this topic states for an existing cluster.

8. **"Behavior for tolerating errors during connector operation. 'none' is the default value
   and signals that any error will result in an immediate connector task failure; 'all' changes
   the behavior to skip over problematic records."**
   Source: Confluent docs, Kafka sink connector configuration reference (SOURCES.md quote 10).
   Direct match. Named only, per CHAPTER.md's own Sources line — a separate, unrelated
   failure-tolerance knob kept distinct from the offset-commit behavior this topic measures.

9. **"A logical slot will emit each change just once in normal operation. The current position
   of each slot is persisted only at checkpoint, so in the case of a crash the slot might return
   to an earlier LSN, which will then cause recent changes to be sent again when the server
   restarts. Logical decoding clients are responsible for avoiding ill effects from handling the
   same message more than once."**
   Source: PostgreSQL 18 docs, Logical Decoding Concepts (SOURCES.md quote 12). Direct match.
   Measured directly: the crash-and-replay function reproduces this exact mechanism, with
   `pg_logical_slot_peek_changes` standing in for an unadvanced position and
   `pg_replication_slot_advance` standing in for the checkpoint that would otherwise move it.

## Predict questions red-teamed

- **Step 2** ("what the restart emits"): the wrong option claims the restart skips the
  already-produced batch. Checked against the measured mechanism directly: a peek-only read
  never records anywhere that a batch was already sent, so there is nothing for a restart to
  consult in order to skip it — the identical batch is the only possible outcome given how
  `pg_logical_slot_peek_changes` and `pg_replication_slot_advance` are actually used here.

- **Step 10** ("Prove it"): the wrong option claims enabling exactly-once source support alone
  protects a downstream consumer end to end. Checked directly against Debezium's own documented
  no-dedup-layer statement (claim 3 above), which draws its own boundary at the connector's own
  write of records and offsets, never at whatever reads from the connector's output topic
  afterward.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own semicolons into four clauses: two
positions and how Kafka Connect stores source offsets; Kafka Connect's own exactly-once source
support (KIP-618); Debezium's own lack of a dedup layer; and recovery when the source position
has been purged. All four are covered — the first and third by direct measurement against this
sandbox's own PostgreSQL cluster's logical-decoding primitives, the second by direct quotation
of KIP-618 and Confluent's own configuration reference (since running a real Connect cluster
needs a JVM and broker this sandbox doesn't have), and the fourth by a direct measurement that
drops a slot and confirms the resulting failure and its only repair. No claim here depends on
Kafka's own transactions, the idempotent producer or `read_committed` consumption (Chapter 9
topics 10-11), end-to-end exactly-once with external sinks (Chapter 9 topic 12), idempotent
sinks for landing (topic 22), or Debezium's own architecture (topic 19), all named in "Leaves
out."
