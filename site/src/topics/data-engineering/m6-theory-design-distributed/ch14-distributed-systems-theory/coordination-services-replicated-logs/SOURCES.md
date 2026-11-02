## Hunt, Konar, Junqueira, Reed: ZooKeeper: Wait-free coordination for Internet-scale systems

URL: https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf
Version: USENIX ATC 2010, fetched 2026-10-30

> ZooKeeper has two basic ordering guarantees:
Linearizable writes: all requests that update the state
of ZooKeeper are serializable and respect precedence;
FIFO client order: all requests from a given client are
executed in the order that they were sent by the
client.

> Ephemeral: Clients create such znodes, and they either delete them explicitly, or let the system remove
them automatically when the session that creates
them terminates (deliberately or due to a failure).

> ZooKeeper implements watches to allow clients to
receive timely notifications of changes without requiring polling.

> we call it A-linearizability (asynchronous linearizability).

> Because only update requests are Alinearizable, ZooKeeper processes read requests locally
at each replica.

> To handle this scenario more efficiently ZooKeeper provides
a read; sync causes a server
to apply all pending write requests before processing the
read without the overhead of a full write.

## ZooKeeper Programmer's Guide

URL: https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html
Version: current, fetched 2026-10-30

> Every change to the ZooKeeper state receives a stamp in the form of a zxid (ZooKeeper Transaction Id). This exposes the total ordering of all changes to ZooKeeper. Each change will have a unique zxid and if zxid1 is smaller than zxid2 then zxid1 happened before zxid2.

## etcd API guarantees

URL: https://etcd.io/docs/v3.5/learning/api_guarantees/
Version: v3.5, fetched 2026-10-30

> etcd ensures durability and strict serializability for all KV api calls.

> KV Service operations are atomic and occur in a total order, consistent with
real-time order of those operations. Total order is implied through revision.

> clients can configure a request’s consistency
mode to serializable, which may access stale data with respect to quorum, but
removes the performance penalty of linearized accesses’ reliance on live consensus.

> etcd provides a lease mechanism. The primary use case of a lease is

## Apache Kafka 4.0.0 Release Announcement

URL: https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/
Version: 18 March 2025, fetched 2026-10-30

> Apache Kafka 4.0 is a significant milestone, marking the first major release to operate entirely without Apache ZooKeeper®.

> KIP-996 introduces a “Pre-Vote” mechanism to reduce unnecessary KRaft leader elections in Apache Kafka clusters. By allowing nodes to check their eligibility for leadership before initiating an election, this approach minimizes disruptions caused by network partitions or transient issues.

## Kafka design documentation: Replication (mirrored by Confluent; see note below)

URL: https://docs.confluent.io/kafka/design/replication.md
Version: fetched 2026-10-30 (a hosted copy of the Apache Kafka design documentation's own replication page, which loads its content via client-side JavaScript on kafka.apache.org and could not be fetched directly in this sandbox — see the note below)

> Kafka running with ZooKeeper takes a slightly different approach to choosing its quorum set.
Instead of majority vote, Kafka dynamically maintains a set of in-sync
replicas (ISR) that are caught-up to the leader. Only members of this
set are eligible for election as leader. A write to a Kafka partition is
not considered committed until *all* in-sync replicas have received the
write. This ISR set is persisted to Zookeeper whenever it changes, and
any replica in the ISR is eligible to be elected leader.

> With
this ISR model and *f+1* replicas, a Kafka topic can tolerate *f*
failures without losing committed messages.

> A majority vote quorum needs three replicas and one acknowledgement

> The ISR approach requires two replicas and one acknowledgement

> If all of the replicas die, there are two possible behaviors:

> 1. Wait for a replica in the ISR to come back to life and choose this
 replica as the leader with the hope it retains all of its data.

> By default from version
0.11.0.0, Kafka chooses the first strategy and favors waiting for a
consistent replica. This behavior can be changed using configuration
property `unclean.leader.election.enable`, to support use cases where
uptime is preferable to consistency.

On this page's own host: Apache's own `kafka.apache.org/documentation/#design` page serves this
same content, but loads it into the page via client-side JavaScript after the initial HTML
response, which fetches in this sandbox only as a navigation shell with no body text. Confluent's
hosted copy at the URL above (a direct mirror of Apache's own design-documentation markdown
source, served as plain text) carries the identical wording and was quotable directly. The
wording predates the KRaft-era "persisted in the cluster metadata" phrasing CHAPTER.md
paraphrases; the mechanism (the ISR, not majority vote, decides eligibility and commit) is
unchanged, and is what this topic quotes.

## KIP-966: Eligible Leader Replicas

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-966%3A+Eligible+Leader+Replicas
Version: fetched 2026-10-30

> A partition replica can experience local data loss in unclean shutdown scenarios where unflushed data in the OS page cache is lost - such as an availability zone power outage or a server error. The Kafka replication protocol is designed to handle these situations by removing such replicas from the ISR and only re-adding them once they have caught up and therefore recovered any lost data.

> This proposal solves this "last replica standing" data loss issue in KRaft clusters, providing MinISR-1 tolerance to data loss unclean shutdown events.

## Apache Iceberg Table Spec

URL: https://iceberg.apache.org/spec/
Version: fetched 2026-10-30

> Table state is maintained in metadata files. All changes to table state create a new metadata file and replace the old metadata with an atomic swap.

> An atomic swap of one table metadata file for another provides the basis for serializable isolation. Readers use the snapshot that was current when they load the table metadata and are not affected by changes until they refresh and pick up a new metadata location.

> The atomic swap needed to commit new versions of table metadata can be implemented by storing a pointer in a metastore or database that is updated with a check-and-put operation [1].

## Kubernetes: Cluster Architecture

URL: https://kubernetes.io/docs/concepts/architecture/
Version: fetched 2026-10-30

> etcd
Consistent and highly-available key value store used as Kubernetes' backing store for all cluster data.

## de.raft-at-conceptual-level (internal cross-reference)

URL: internal-not-fetched-de.raft-at-conceptual-level
Version: this topic's own commit history

No quotes; etcd's Raft replication and KRaft's controller quorum reuse topic 9's mechanism, referenced here, not re-quoted.

## de.leases-fencing-tokens-split (internal cross-reference)

URL: internal-not-fetched-de.leases-fencing-tokens-split
Version: this topic's own commit history

No quotes; etcd's zxid-equivalent revision and ZooKeeper's zxid are this topic's two more fencing-token tokens, referenced here, not re-quoted.
