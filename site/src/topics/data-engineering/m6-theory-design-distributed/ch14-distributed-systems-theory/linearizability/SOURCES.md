## Linearizability: A Correctness Condition for Concurrent Objects (Herlihy & Wing, TOPLAS 1990)

URL: https://cs.brown.edu/people/mph/HerlihyW90/p463-herlihy.pdf
Version: ACM Transactions on Programming Languages and Systems, Vol. 12, Issue 3 (1990), 463–492

> Linearizability provides the illusion that each
operation applied by concurrent processes takes effect instantaneously
at some point between its
invocation and its response, implying that the meaning of a concurrent object's operations can be
given by pre- and post-conditions.

> Unlike alternative correctness conditions such as sequential consistency [31] or serializability
[40], linearizability
is a local property: a
system is linearizable if each individual object is linearizable. Locality enhances
modularity
and concurrency, since objects can be implemented and verified
independently, and run-time scheduling can be completely decentralized. Linearizability is also a nonblocking property: processes invoking totally-defined
operations are never forced to wait.

> A history H is linearizable if it can be extended (by appending zero or more
response events) to some history H' such that:
Ll: complete(H') is equivalent to some legal sequential history S, and
L2: <H 2 CS.

> Ll states that processes act as if they
were interleaved at the granularity of complete operations. L2 states that this
apparent sequential interleaving respects the real-time precedence ordering of
operations.

Contents (for the coverage map): the formal history-of-invocations-and-responses model the definition is stated over; the "real-time precedence ordering" relation `<H` and concurrency as the absence of that relation either way; the proof technique (a linearization point inside each operation's interval) used for verification, named here, not reproduced in full.

## Sequential Consistency versus Linearizability (Attiya & Welch, ACM TOCS 1994)

URL: https://courses.csail.mit.edu/6.852/01/papers/p91-attiya.pdf
Version: ACM Transactions on Computer Systems, Vol. 12, Issue 2 (May 1994), 91–122 (course-hosted copy of the journal paper)

> Our main conclusion is that under realistic timing assumptions it is strictly more expensive to provide linearizability than sequential consistency in distributed (message-passing) implementations, where the cost measure is the worst-case time for a data access.

> Thus, d is the worst-case delay in the network over all pairs of processes, and u is the worst-case uncertainty. Our lower bounds are given in terms of d and u.

> We show in Section 4.1.1 that for sequential consistency the sum of the worst-case response times of read and write operations is at least d, even in this strong model.

> In the first algorithm, reads are performed instantaneously, the worst-case response time for a write is d.

Contents (for the coverage map): the model's own definitions of `d` (worst-case network delay) and `u` (worst-case clock/delay uncertainty, `0 ≤ u < d`); the Ω(u) lower bound stated for linearizability under imperfect clock synchronization (`u > 0`), contrasted with the achievable sequentially-consistent implementation under the same weaker timing assumptions; the paper's own two matching linearizable algorithms under the strong (synchronized-clock) model, named for completeness, not built here.

## Raft: In Search of an Understandable Consensus Algorithm (Ongaro & Ousterhout)

URL: https://raft.github.io/raft.pdf
Version: extended version, raft.github.io (fetched 2026-10-30)

> this would run the risk of returning stale data, since
the leader responding to the request might have been superseded by a newer leader of which it is unaware. Linearizable reads must not return stale data, and Raft needs

> a leader must check whether it has been deposed before processing a read-only request (its information may be stale if a more recent leader has been elected).

Contents (for the coverage map): the stale-leader-read hazard stated in the paper's own terms, and the fix it names (confirming leadership via a round of heartbeats to a majority, or waiting for a prior entry to commit) before answering a read-only request — the mechanism topic 10's lease/fencing machinery builds on further.

## etcd API guarantees (etcd documentation)

URL: https://etcd.io/docs/v3.5/learning/api_guarantees/
Version: etcd v3.5 documentation (fetched 2026-10-30)

> Linearizability provides the illusion that each operation applied by concurrent processes takes effect instantaneously at some point between its invocation and its response.

> etcd ensures linearizability for all other operations by default.
Linearizability comes with a cost, however, because linearized requests must go
through the Raft consensus process. To obtain lower latencies and higher
throughput for read requests, clients can configure a request's consistency
mode to serializable, which may access stale data with respect to quorum, but
removes the performance penalty of linearized accesses' reliance on live consensus.

Contents (for the coverage map): etcd's own worked example (a write at t1, a read issued at t2 > t1 but completing at t3, and what "stale" means for the value it returns without the linearizability guarantee); the real production tradeoff this topic's hook and handoff both rest on — linearizable reads cost a round trip through consensus, serializable reads are cheaper and may be stale.

## Linearizability (Jepsen consistency models)

URL: https://jepsen.io/consistency/models/linearizable
Version: Jepsen consistency models page (fetched 2026-10-30)

> Linearizability is one of the strongest single-object consistency models, and implies that every operation appears to take place atomically, in some order, consistent with the real-time ordering of those operations: e.g., if operation A completes before operation B begins, then B should logically take effect after A.

> This model cannot be totally or sticky available; in the event of a
network partition, some or all nodes will be unable to make progress.

Contents (for the coverage map): the plain-language restatement of the real-time rule used for this topic's own framing; the pointer to Viotti and Vukolić's three set-theoretic constraints (SingleOrder, RealTime, RVal) as an alternative, equivalent formulation, named only; Jepsen's own role as the production history-checking methodology this topic's Deep dive names (Knossos, Porcupine, Elle) without building.
