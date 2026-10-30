## Saltzer, Reed & Clark: End-to-End Arguments in System Design

URL: https://web.mit.edu/saltzer/www/publications/endtoend/endtoend.pdf
Version: ACM TOCS 2(4), November 1984, fetched 2026-10-30

> The function in question can completely and correctly be implemented only with the
knowledge and help of the application standing at the end points of the communication
system. Therefore, providing that questioned function as a feature of the communication
system itself is not possible. (Sometimes an incomplete version of the function provided
by the communication system may be useful as a performance enhancement.)

> We call this line of reasoning against low-level function implementation the "end-to-end
argument."

## Apache Kafka: KIP-98 - Exactly Once Delivery and Transactional Messaging

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging
Version: Kafka Improvement Proposal, fetched 2026-10-30

> Users of messaging systems greatly benefit from the more stringent idempotent producer semantics, viz. Every message write will be persisted exactly once, without duplicates and without data loss -- even in the event of client retries or broker failures.

> However, idempotent producers don't provide guarantees for writes across multiple TopicPartitions. For this, one needs stronger transactional guarantees, ie. the ability to write to several TopicPartitions atomically. By atomically, we mean the ability to commit a set of messages across TopicPartitions as a unit: either all messages are committed, or none of them are.

> Further, since consumer progress is recorded as a write to the offsets topic, the above capability is leveraged to enable applications to batch consumed and produced messages into a single atomic unit, ie. a set of messages may be considered consumed only if the entire 'consume-transform-produce' executed in its entirety.

> read_committed: only consume non-transactional messages or committed transactional messages in offset order.

## Apache Flink: An Overview of End-to-End Exactly-Once Processing in Apache Flink (with Apache Kafka, too!)

URL: https://flink.apache.org/2018/02/28/an-overview-of-end-to-end-exactly-once-processing-in-apache-flink-with-apache-kafka-too/
Version: Flink engineering blog post, 28 February 2018 (Flink 1.4.0, December 2017), fetched 2026-10-30

> Apache Flink 1.4.0, released in December 2017, introduced a significant milestone for stream processing with Flink: a new feature called TwoPhaseCommitSinkFunction (relevant Jira here) that extracts the common logic of the two-phase commit protocol and makes it possible to build end-to-end exactly-once applications with Flink and a selection of data sources and sinks, including Apache Kafka versions 0.11 and beyond.

> To provide end-to-end exactly-once semantics—that is, semantics that also apply to the external systems that Flink writes to in addition to the state of the Flink application—these external systems must provide a means to commit or roll back writes that coordinate with Flink's checkpoints.

> The starting of a checkpoint represents the "pre-commit" phase of our two-phase commit protocol.

> The next step is to notify all operators that the checkpoint has succeeded. This is the commit phase of the two-phase commit protocol and the JobManager issues checkpoint-completed callbacks for every operator in the application.

## de.two-phase-commit-blocking (internal cross-reference)

URL: internal-not-fetched-de.two-phase-commit-blocking
Version: this topic's own commit history

No quotes; the two-phase commit protocol that both Kafka transactions and Flink's sink reuse is
this topic's own, already taught and quoted there, referenced here, not re-taught.

## de.coordination-services-replicated-logs (internal cross-reference)

URL: internal-not-fetched-de.coordination-services-replicated-logs
Version: this topic's own commit history

No quotes; the table-format compare-and-swap commit is this topic's own, already taught and
quoted there, referenced here as the third atomic-commit route, not re-taught.

## de.leases-fencing-tokens-split (internal cross-reference)

URL: internal-not-fetched-de.leases-fencing-tokens-split
Version: this topic's own commit history

No quotes; Kafka's producer epoch, already taught there as a fencing token, is the identical
mechanism KIP-98 names a transactional id's epoch, referenced here, not re-taught.

## Gray: Notes on Data Base Operating Systems (named, not quoted)

URL: not-fetched-named-only
Version: IBM Research Report RJ2188, 1978

Named only, per CHAPTER.md: the primary source for the Two Generals problem, the *(skipped)*
syllabus topic that is the reason a fair-loss link can never certify delivery. This topic names it
once, in the "leaves out" sense, without quoting it or teaching the problem itself (topic 1's
Deep dive is where it is actually introduced as a pointer).
