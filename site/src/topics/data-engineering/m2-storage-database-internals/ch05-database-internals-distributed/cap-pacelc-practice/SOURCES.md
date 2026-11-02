# Sources: CAP and PACELC in practice (`de.cap-pacelc-practice`)

## CAP Twelve Years Later: How the "Rules" Have Changed (Eric Brewer)

URL: https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/
Version: InfoQ, 2012, retrieved 2026-10-30

> The CAP theorem states that any networked shared-data system can have at most two of three desirable properties: consistency (C) equivalent to having a single up-to-date copy of the data; high availability (A) of that data (for updates); and tolerance to network partitions (P).

> The easiest way to understand CAP is to think of two nodes on opposite sides of a partition. Allowing at least one node to update state will cause the nodes to become inconsistent, thus forfeiting C. Likewise, if the choice is to preserve consistency, one side of the partition must act as if it is unavailable, thus forfeiting A.

> First, because partitions are rare, there is little reason to forfeit C or A when the system is not partitioned.

> This strategy should have three steps: detect partitions, enter an explicit partition mode that can limit some operations, and initiate a recovery process to restore consistency and compensate for mistakes made during a partition.

> In Google, the primary partition usually resides within one datacenter; however, Paxos is used on the wide area to ensure global consensus, as in Chubby

## Problems with CAP, and Yahoo's little known NoSQL system (Daniel Abadi)

URL: https://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html
Version: DBMS Musings, 2010, retrieved 2026-10-30

> To me, CAP should really be PACELC --- if there is a partition (P) how does the system tradeoff between availability and consistency (A and C); else (E) when the system is running as normal in the absence of partitions, how does the system tradeoff between latency (L) and consistency (C)?

> For example, Amazon’s Dynamo (and related systems like Cassandra and SimpleDB) are PA/EL in PACELC --- upon a partition, they give up consistency for availability; and under normal operation they give up consistency for lower latency.

> Fully ACID systems are PC/EC in PACELC. They refuse to give up consistency, and will pay the availability and latency costs to achieve it.

> One such example is PNUTS, which is PC/EL in PACELC. In normal operation they give up consistency for latency; however, upon a partition they don't give up any additional consistency (rather they give up availability).

This is Daniel Abadi's own original blog post proposing PACELC (later formalized in his 2012 IEEE Computer paper "Consistency Tradeoffs in Modern Distributed Database System Design"); the paper itself is hosted at `cs.umd.edu`, which serves a broken TLS chain in this sandbox (the same domain-wide limitation documented for Terry et al.'s paper — see the previous topic's `SOURCES.md`). This post is Abadi's own first statement of the idea, in his own words, and is cited bibliographically alongside the later paper rather than treated as a lesser substitute.

## Dynamo: Amazon's Highly Available Key-value Store (DeCandia et al., SOSP 2007)

URL: https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf
Version: SOSP 2007, retrieved 2026-10-30

> This paper presents the design and implementation of Dynamo, a highly available key-value storage system that some of Amazon's core services use to provide an "always-on" experience. To achieve this level of availability, Dynamo sacrifices consistency under certain failure scenarios.

> Dynamo provides eventual consistency, which allows for updates to be propagated to all replicas asynchronously.

## Spanner: Google's Globally-Distributed Database (Corbett et al., OSDI 2012)

URL: https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf
Version: OSDI 2012, retrieved 2026-10-30

> Spanner is Google’s scalable, multi-version, globallydistributed, and synchronously-replicated database. It is the first system to distribute data at global scale and support externally-consistent distributed transactions.

> The key enabler of these properties is a new TrueTime API and its implementation.

Internal cross-reference: `de.replication-lag-session-guarantees` (this chapter, §5.3, topic 19) — the normal-case latency-vs-consistency trade this topic's PACELC half names is the identical trade topic 19 already measured directly against a real asynchronous standby.
