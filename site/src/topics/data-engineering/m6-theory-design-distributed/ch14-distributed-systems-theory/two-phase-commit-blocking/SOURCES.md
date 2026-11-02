## Gray & Lamport: Consensus on Transaction Commit

URL: https://lamport.azurewebsites.net/video/consensus-on-transaction-commit.pdf
Version: ACM TODS 31(1), March 2006 (pages 133-160); this copy revised 5 July 2017, fetched 2026-10-30

> The distributed transaction commit problem requires reaching agreement
on whether a transaction is committed or aborted. The classic Two-Phase
Commit protocol blocks if the coordinator fails. Fault-tolerant consensus
algorithms also reach agreement, but do not block whenever any majority
of the processes are working. The Paxos Commit algorithm runs a Paxos
consensus algorithm on the commit/abort decision of each participant to
obtain a transaction commit protocol that uses 2F + 1 coordinators and
makes progress if at least F +1 of them are working properly. Paxos Commit
has the same stable-storage write delay, and can be implemented to have
the same message delay in the fault-free case, as Two-Phase Commit, but it
uses more messages. The classic Two-Phase Commit algorithm is obtained
as the special F = 0 case of the Paxos Commit algorithm.

> Selecting a unique leader is equivalent
to solving the consensus problem. However, Paxos maintains consistency,
never allowing two different values to be chosen, even if multiple processes
think they are the leader. (This is unlike traditional Three-Phase commit
protocols, in which multiple coordinators can lead to inconsistency.) A
unique nonfaulty leader is needed only to ensure liveness.

## Google: Spanner: Google's Globally-Distributed Database

URL: https://research.google.com/archive/spanner-osdi2012.pdf
Version: OSDI 2012, fetched 2026-10-30

> At every replica that is a leader, each spanserver also
implements a transaction manager to support distributed
transactions. The transaction manager is used to implement a participant leader; the other replicas in the group
will be referred to as participant slaves. If a transaction involves only one Paxos group (as is the case for
most transactions), it can bypass the transaction manager,
since the lock table and Paxos together provide transactionality. If a transaction involves more than one Paxos
group, those groups' leaders coordinate to perform twophase commit. One of the participant groups is chosen as
the coordinator: the participant leader of that group will
be referred to as the coordinator leader, and the slaves of
that group as coordinator slaves. The state of each transaction manager is stored in the underlying Paxos group
(and therefore is replicated).

## Cockroach Labs: Parallel Commits: An atomic commit protocol for globally distributed transactions

URL: https://www.cockroachlabs.com/blog/parallel-commits/
Version: engineering blog post, 7 November 2019 (CockroachDB 19.2), fetched 2026-10-30

> This post will explore the new atomic commit protocol, which we call Parallel Commits. Parallel Commits will be part of CockroachDB's upcoming 19.2 release. The feature promises to halve the latency of distributed transactions by performing all consensus round trips required to commit a transaction concurrently.

> With Parallel Commits, we introduce a new transaction record state called STAGING. The meaning of this state is that the transaction has determined all of the keys that it intends to write to, even if those writes haven't yet completed successfully. In addition to containing a STAGING status, a transaction record in this state lists the key of each of these in-progress writes. A transaction is considered committed if its record is in this state and an observer can prove that all of the writes listed in its transaction record have successfully achieved consensus.

> So with all these changes, what did we gain? Using Parallel Commits, CockroachDB is now able to commit cross-range transactions in half the time it previously was able to.

> The explanation for this is simple. With Parallel Commits, transactions have to wait for only a single round-trip of distributed consensus.

## Skeen: Nonblocking Commit Protocols (named, not quoted — sourcing note)

URL: https://www.cs.purdue.edu/homes/bb/cs542-11Spr/skeen.pdf (and https://dl.acm.org/doi/10.1145/582318.582339)
Version: ACM SIGMOD 1981, pp. 133-142

Every reachable copy of this paper is unusable for a word-for-word quote. The Purdue mirror's
text layer is a scrambled OCR of a scanned image (confirmed by inspection: the extracted
characters come out as reversed, garbled fragments, not readable prose), and the ACM Digital
Library PDF returns HTTP 403 to a direct fetch; a Semantic Scholar page for the paper returns no
extractable text either. This topic names Skeen's protocol and his central contribution (giving
necessary and sufficient conditions for a commit protocol to be "nonblocking", and presenting a
three-phase, nonblocking protocol) by citation only, and does not put any sentence of his in
quotation marks. The one claim CHAPTER.md requires about multiple coordinators causing
inconsistency under 3PC is instead carried, verbatim, by Gray and Lamport's own sentence above
("This is unlike traditional Three-Phase commit protocols, in which multiple coordinators can lead
to inconsistency"), which names the same failure mode from the source this topic *can* quote
word for word.

## de.raft-at-conceptual-level (internal cross-reference)

URL: internal-not-fetched-de.raft-at-conceptual-level
Version: this topic's own commit history

No quotes; the small consensus log that replicates the coordinator's decision in this topic's second
lab half is topic 9's Raft log, referenced here, not re-taught or re-quoted.

## de.coordination-services-replicated-logs (internal cross-reference)

URL: internal-not-fetched-de.coordination-services-replicated-logs
Version: this topic's own commit history

No quotes; etcd is named as one of the real options for replicating the coordinator's decision
(CHAPTER.md's §14.7 lab names "a Raft log (or etcd)"), already placed in the quorum theory by
topic 11, referenced here, not re-quoted.
