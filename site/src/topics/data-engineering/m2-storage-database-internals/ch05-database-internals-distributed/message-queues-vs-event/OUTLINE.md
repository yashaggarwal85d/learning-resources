# Outline — de.message-queues-vs-event

## Outcomes (from CHAPTER.md)

Contrast per-message ack-and-redelivery queues (RabbitMQ, SQS) with offset-based replayable logs
(Kafka); choose between the two from a workload's real replay, ordering and fan-out needs; name
Kafka's own share groups (KIP-932) as a real, documented feature blurring that line, disclosed as
sourced-only since this sandbox can't run a real multi-broker Kafka cluster directly.

## 9-step storyboard (full, ~15 min)

1. **Hook.** The identical message, delivered through both kinds of system: a queue acknowledges
   it and it's gone for good; a log advances a marker past it, but the message itself stays put.
2. **Predict: once a second consumer needs the same message a queue already delivered, can it get
   it back.** (Correct: not from the queue itself — the message is gone once acknowledged; only
   the log's own copy is still there to be replayed.)
3. **Reveal: a queue deletes on acknowledgement.** RabbitMQ's and SQS's own documented model: an
   acknowledged message is marked for deletion; an unacknowledged one is redelivered, but never
   both at once. No takeaway (reel test's reference step).
4. **Reveal: a log tracks a position, not a deletion.** Kafka's own offset is a single, rewindable
   integer per partition; the message's own offset never changes, which is what makes rewinding
   back and replaying it possible at all. Takeaway.
5. **Reveal: replay is the real dividing line.** A consumer with a bug can fix it and re-consume
   what it already saw from a log; a queue's own acknowledged messages are already gone by the
   time the bug is found. Takeaway.
6. **Reveal: ordering and fan-out tilt the choice further.** A log's partitions give per-partition
   ordering and let many independent consumer groups each read the whole stream at their own
   pace; a queue's own per-message delivery doesn't guarantee order across consumers and is built
   for one logical destination per message, not many independent readers. Takeaway.
7. **Reveal: Kafka's own share groups blur the line.** Production-ready in Kafka 4.2, named
   directly from the engine's own release notes: cooperative, per-record acknowledgement on top of
   a log, without one consumer owning a whole partition — a queue's own model, layered onto a
   log, disclosed as sourced-only since this sandbox doesn't run a real multi-broker cluster.
   Takeaway.
8. **Recap.**
9. **Prove it.** A workload needs many independent teams to each process every event at their own
   pace, and one of those teams needs to re-run last week's events after fixing a bug. Which
   system fits, and why would the other one fail here?
   (Correct: an offset-based log — a queue's own acknowledged messages would already be gone by
   the time the bug was found, and a queue doesn't let many independent readers each see every
   message at their own pace the way a log's partitions do.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the queue's own ack-and-delete model; the log's own offset-and-replay model;
ordering and fan-out; Kafka's own share groups); Production (choosing by a workload's real
replay/ordering/fan-out needs, the "Prove it" step's own answer); Frontier (share groups' own
production rollout and what still differs from a classic consumer group); Where this goes next
(the chapter's own closing idea: trading a small, bounded error for a massive reduction in
memory, starting with Bloom, cuckoo and xor filters).

## Bridge / handoff

Bridge (answers topic 28's handoff verbatim): "Every read-side pattern so far assumed a reader
pulling from a store. This topic is the opposite direction entirely: a consumer reading what a
producer wrote, through either a per-message queue that forgets what it delivered, or a
replayable log that doesn't — the same append-only, offset-addressed idea §5.1's own WAL already
introduced, one layer up."

Handoff: "Every mechanism in this chapter answered a question with an exact result. The next
section's closes the chapter with the opposite idea entirely: structures that trade a small,
bounded error for a massive reduction in memory, starting with the simplest — Bloom, cuckoo and
xor filters."

## Concept ledger

Introduces: `queues-vs-logs`. Uses: `wal-lsn-fsync` (the direct structural parallel: a replayable
log is itself an append-only, offset-addressed WAL). Declared: none beyond §5.5's earlier topics.

## Claims list (for FACT-CHECK.md)

1. RabbitMQ's own documentation: an acknowledged delivery is marked for deletion; a negatively
   acknowledged one is discarded, dead-lettered or requeued by the broker, never replayed after
   the fact.
2. AWS's own documentation: an SQS message becomes visible again for another consumer only if it
   was never deleted before its visibility timeout expired — redelivery, not voluntary replay.
3. Apache Kafka's own documentation: a consumer's position is a single, rewindable offset per
   partition; a message's own offset never changes, which is what makes deliberately rewinding
   back and re-consuming old data possible.
4. Apache Kafka's own documentation (4.2 upgrade notes): share groups (KIP-932) are
   production-ready in Kafka 4.2, adding cooperative, per-record acknowledgement on top of the
   log without assigning a whole partition to one consumer.
5. The KIP-932 proposal's own words: share groups add queue-like cooperative consumption to
   regular Kafka topics, rather than introducing queues as a wholly separate concept.
