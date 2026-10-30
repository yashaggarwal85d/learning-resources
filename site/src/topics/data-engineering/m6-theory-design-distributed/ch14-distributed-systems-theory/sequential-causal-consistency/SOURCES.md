## Jepsen: Sequential Consistency

URL: https://jepsen.io/consistency/models/sequential
Version: fetched 2026-10-30

> Informally, sequential consistency implies that operations appear to take place
in some total order, and that that order is consistent with the order of
operations on each individual process.

> Sequential consistency cannot be totally or sticky available; in the event of a
network partition, some or all nodes will be unable to make progress.

> A process in a sequentially consistent system may be far ahead of, or behind,
other processes. For instance, they may read arbitrarily stale state. However,
once a process A has observed some operation from process B, it can never
observe a state prior to B.

Lamport's own definition, as Jepsen quotes it:

> … the result of any execution is the same as if the operations of all
the processors were executed in some sequential order, and the operations of
each individual processor appear in this sequence in the order specified by
its program.

## Jepsen: Causal Consistency

URL: https://jepsen.io/consistency/models/causal
Version: fetched 2026-10-30

> Causal consistency captures the notion that causally-related operations should
appear in the same order on all processes—though processes may disagree about
the order of causally independent operations.

> consider a single object representing a chat between three people,
where Attiya asks "shall we have lunch?", and Barbarella & Cyrus respond with
"yes", and "no", respectively. Causal consistency allows Attiya to observe
"lunch?", "yes", "no"; and Barbarella to observe "lunch?", "no", "yes".
It also allows either of them to observe "no" or "yes" in the reverse order.
However, no participant ever observes "yes" or "no" prior to the question
"lunch?".

> Causal consistency is sticky available: even in the presence of network
partitions, every client connected to a non-faulty node can make progress.
However, clients must stick to the same server.

> A slightly stronger version of causal consistency, Real-Time
Causal, is proven to be
the strongest consistency model in an always-available, one-way convergent
system.

> When a total order is required, and you're willing to sacrifice availability
(and latency), consider sequential consistency. If you need total
availability, you'll have to give up causal (and read-your-writes), but can
still obtain writes follow reads, monotonic
reads, and monotonic writes.

On the result's origin and authorship (Jepsen credits Mahajan, Alvisi and Dahlin's technical report for the Real-Time Causal bound, and it is the source CHAPTER.md names for it; the report itself sits on cs.utexas.edu and cs.cornell.edu, both of which returned a broken TLS certificate chain, domain-wide, at research time on 2026-10-30 — confirmed by testing their site roots, not just this one PDF path. Jepsen's own sentence above is quoted as the direct source for the bound's statement and its two named conditions, always-available and one-way convergent):

> a more useful (and non-paywalled) reference might be
Mahajan, Alvisi, and Dahlin's Consistency, Availability, and
Convergence

## Jepsen: Monotonic Reads

URL: https://jepsen.io/consistency/models/monotonic-reads
Version: fetched 2026-10-30

> Monotonic reads ensures that if a process performs read r1, then r2,
then r2 cannot observe a state prior to the writes which were reflected in
r1; intuitively, reads cannot go backwards.

> Monotonic reads does not apply to operations performed by different
processes, only reads by the same process.

## Jepsen: Monotonic Writes

URL: https://jepsen.io/consistency/models/monotonic-writes
Version: fetched 2026-10-30

> Monotonic writes ensures that if a process performs write w1, then
w2, then all processes observe w1 before w2.

> Monotonic writes does not apply to operations performed by different
processes, only writes by the same process.

## Jepsen: Read Your Writes

URL: https://jepsen.io/consistency/models/read-your-writes
Version: fetched 2026-10-30

> Read your writes (also known as read my writes) requires that if a process
performs a write w, and that same process performs a subsequent read r,
then r must observe w's effects.

> Note that read your writes does not apply to operations performed by
different processes. There is no guarantee, for instance, that if process 1
writes a value successfully, that process 2 will subsequently observe that
write.

## Jepsen: Writes Follow Reads

URL: https://jepsen.io/consistency/models/writes-follow-reads
Version: fetched 2026-10-30

> Writes follow reads, also known as session causality, ensures that if a
process reads a value v, which came from a write w1, and later performs write w2, then w2 must be visible after w1. Once you've read something, you can't change that read's past.

> Writes follow reads is a totally available property. Every node can make
progress regardless of network partitions.

## de.linearizability (internal cross-reference)

URL: internal-not-fetched-de.linearizability
Version: this topic's own commit history

No quotes; the Attiya-Welch round-trip/uncertainty cost for closing the real-time gap was fetched and quoted in topic 5 (`de.linearizability`), and is referenced here, not re-quoted.

## de.lamport-clocks-happens-before (internal cross-reference)

URL: internal-not-fetched-de.lamport-clocks-happens-before
Version: this topic's own commit history

No quotes; happens-before was defined and quoted from Lamport 1978 in topic 3, and is used here as the basis for causal ordering.
