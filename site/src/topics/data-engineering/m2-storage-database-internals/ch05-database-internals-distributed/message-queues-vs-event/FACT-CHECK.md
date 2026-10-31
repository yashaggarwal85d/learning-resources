# Fact-check — de.message-queues-vs-event

## Claim 1: an acknowledged delivery is marked for deletion; a negative acknowledgement is discarded, dead-lettered or requeued, never replayed after the fact
Source: RabbitMQ docs, "Consumer Acknowledgements and Publisher Confirms" (SOURCES.md #1).
> "Consumer acknowledgements are not aware of publishers: their goal is to confirm to a RabbitMQ
> node that a given delivery was successfully received and processed successfully, so the
> delivered message can be marked for future deletion."
> "The methods are generally used to negatively acknowledge a delivery. Such deliveries can be
> discarded or dead-lettered or requeued by the broker. This behaviour is controlled by the
> requeue field."
Verdict: Confirmed. A positive acknowledgement is the real trigger for a message's deletion;
redelivery only happens through an explicit negative acknowledgement's own requeue path, never as
a voluntary replay of something already positively acknowledged.

## Claim 2: an SQS message reappears for another consumer only if it was never deleted before its visibility timeout expired
Source: AWS docs, "Amazon SQS visibility timeout" (SOURCES.md #2).
> "The visibility timeout starts as soon as a message is delivered to you. During this period,
> you're expected to process and delete the message. If you don't delete it before the timeout
> expires, the message becomes visible again in the queue and can be retrieved by another
> consumer."
Verdict: Confirmed. This is redelivery triggered by a missing deletion, not a reader choosing to
see an already-processed message again — the same real property RabbitMQ's own model has, in a
different engine's own words.

## Claim 3: a Kafka consumer's position is a single, rewindable offset per partition; a message's own offset never changes
Source: Apache Kafka docs, "Design" (SOURCES.md #3).
> "This means that the position of a consumer in each partition is just a single integer, the
> offset of the next message to consume. This makes the state about what has been consumed very
> small, just one number for each partition."
> "A consumer can deliberately rewind back to an old offset and re-consume data. This violates
> the common contract of a queue, but turns out to be an essential feature for many consumers."
> "The offset for a message never changes. It is the permanent identifier for a position in the
> log."
Verdict: Confirmed, and reproduced directly in `examples.py`: a consumer reads three messages,
rewinds its own offset to zero, and reads the identical three messages again — the real property
the source names as violating "the common contract of a queue."

## Claim 4: Kafka's own share groups (KIP-932) are production-ready in Kafka 4.2
Source: Apache Kafka docs, "Upgrading" (4.2) (SOURCES.md #4); KIP-932 wiki (SOURCES.md #5).
> "Queues for Kafka (KIP-932) is production-ready in Apache Kafka 4.2. This feature introduces a
> new kind of group called share groups, as an alternative to consumer groups. Consumers in a
> share group cooperatively consume records from topics, without assigning each partition to
> just one consumer. Share groups also introduce per-record acknowledgement and counting of
> delivery attempts."
> "This KIP introduces the concept of a share group as a way of enabling cooperative consumption
> using Kafka topics. It does not add the concept of a "queue" to Kafka per se, but rather that
> introduces cooperative consumption to accommodate these queuing use-cases using regular Kafka
> topics."
Verdict: Confirmed directly from Kafka's own 4.2 upgrade notes. A web search for independent
confirmation of the syllabus's own dated claim ("production-ready Feb 2026") turned up the 4.2.0
release announcement dated 17 February 2026 (DEV Community, reporting on the official release),
consistent with the syllabus's own claim, though that specific date is not itself quoted from a
primary Apache source in this topic's own `SOURCES.md` (the primary source confirms
production-readiness in the 4.2 release; the calendar date is corroborated only by the secondary
report).

## Claim 5 (this course): a queue's own acknowledged message is genuinely gone; a log's own message survives a rewind and replay
Source: `examples.py`, run directly against a real, on-disk SQLite database.
Measured: a message consumed and acknowledged from the queue table returns `None` when asked for
again (its row was actually deleted, not merely marked). The identical three messages read from
the log table are read again, unchanged, after rewinding the consumer's own offset back to the
start — the row itself was never touched.
Verdict: Confirmed by direct computation, not asserted from a source.

## Problem Solving
- All five fetched sources quoted cleanly on the first attempt; no gated-host, footnote-marker or
  ellipsis issues. Two quotes (SQS visibility timeout, RabbitMQ's negative-acknowledgement
  behavior) span wrapped physical lines in the fetched text but matched `sources.mjs check`'s own
  whitespace-normalized comparison without any fix needed, since neither source uses `#`-comment
  prefixes the way `redis.conf` did on an earlier topic.
- The syllabus's own "production-ready Feb 2026" date is corroborated by a secondary report (a
  DEV Community article citing the 4.2.0 release date) rather than quoted directly from an Apache
  source dated that specifically; the primary source (SOURCES.md #4) itself only confirms
  production-readiness "in Apache Kafka 4.2" without a calendar date, which is disclosed above
  rather than treated as a gap, since the core factual claim (production-ready in 4.2) is
  directly sourced.
