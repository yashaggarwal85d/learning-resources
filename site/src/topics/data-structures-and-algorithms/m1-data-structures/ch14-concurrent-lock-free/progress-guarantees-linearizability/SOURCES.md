# Sources: Progress guarantees and linearizability (`dsa.progress-guarantees-linearizability`)

## Herlihy and Wing, "Linearizability: a correctness condition for concurrent objects"

*ACM Transactions on Programming Languages and Systems* 12(3), 1990, pp. 463–492.

URL: https://www.cs.cmu.edu/~wing/publications/HerlihyWing90.pdf
Version: fetched 2026-11-01

> linearizability
is a local property: a
system is linearizable if each individual object is linearizable.

> Linearizability is also a nonblocking property: processes invoking totally-defined
operations are never forced to wait.

> A history H is linearizable if it can be extended (by appending zero or more
response events) to some history H’ such that:

> Ll: complete(H’) is equivalent to some legal sequential history S, and

> L2: <H 2 CS.

> Linearizability can be viewed as a special case of strict serializability where
transactions are restricted to consist of a single operation applied to a single
object.

> One important formal difference between linearizability and serializability is
that neither serializability nor strict serializability is a local property.

## Herlihy, "Wait-Free Synchronization"

*ACM Transactions on Programming Languages and Systems* 13(1), 1991, pp. 124–149.

URL: https://cs.brown.edu/people/mph/Herlihy91/p124-herlihy.pdf
Version: fetched and re-extracted with `pdftotext -layout` 2026-11-01 (the PDF's own font
encoding defeats this project's usual text extraction, scrambling word order; `pdftotext -layout`
recovers correct reading order and this topic's own quotes are taken from that re-extraction,
seeded into `sources.mjs check`'s own cache path — see `REVIEW.md`)

> guarantees that any process can complete any operation in a finite number

> regardless of the execution speeds of the other
processes.

> An implementation      is bounded wait-free if there exists N such that there is no
history  in which an invocation         of P, remains      pending    across N steps of F,.

## Herlihy, Luchangco and Moir, "Obstruction-Free Synchronization: Double-Ended Queues as an Example"

ICDCS 2003, pp. 522–529.

URL: https://cs.brown.edu/people/mph/HerlihyLM03/main.pdf
Version: fetched 2026-11-01

> It is
lock-free if it ensures only that some thread always makes
progress.

> This
property is strong enough to avoid the problems associated with locks, but it is weaker than previous nonblocking
properties—specifically lock-freedom and wait-freedom—
allowing greater flexibility in the design of efficient implementations.

> A synchronization technique is obstruction-free if
it guarantees progress for any thread that eventually executes in isolation. Even though other threads may be in
the midst of executing operations, a thread is considered
to execute in isolation as long as the other threads do not
take any steps.

> The reason our obstruction-free deque implementation
is so simple (and the reason we believe obstruction-free implementations in general will be significantly simpler than
their lock-free and wait-free counterparts) is that there is
no progress requirement when any interference is detected.

### Gibbons and Korach, "Testing shared memories" (citation only)

*SIAM Journal on Computing* 26(4), 1997, pp. 1208–1244. Title and venue checked against the
syllabus's own planning note; the paper's own abstract and the NP-completeness result's exact
statement were not read this session, per `CHAPTER.md`'s own "to verify" flag. This topic names
the result (checking linearizability in general is NP-complete) and attributes it to this paper
by name and date only.

### Herlihy, Shavit, Luchangco and Spear, *The Art of Multiprocessor Programming*, 2nd ed. (not opened)

The syllabus's own canonical reference for the chapter; not opened at research time, per
`CHAPTER.md`. No claim in this topic is attributed to it.
