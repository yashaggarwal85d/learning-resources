## Jepsen: Serializability

URL: https://jepsen.io/consistency/models/serializable
Version: fetched 2026-10-30

> Informally, serializability means that transactions appear to have occurred in
some total order.

> It is also a multi-object property: operations can act on multiple objects in
the system.

> Serializability implies repeatable read, snapshot isolation, etc. However, it does not impose any real-time, or even per-process constraints. If process A completes write w, then process B begins a read r, r is not necessarily guaranteed to observe w. For those kinds of real-time guarantees, see strict serializable.

> Moreover, serializability does not require a per-process order between
transactions. A process can observe a write, then fail to observe that same
write in a subsequent transaction. In fact, a process can fail to observe its
own prior writes, if those writes occurred in different transactions.

> The ANSI SQL 1999 spec says:

> The execution of concurrent SQL-transactions at isolation level SERIALIZABLE
is guaranteed to be serializable. A serializable execution is defined to be
an execution of the operations of concurrently executing SQL-transactions
that produces the same effect as some serial execution of those same
SQL-transactions.

## Jepsen: Strong Serializability

URL: https://jepsen.io/consistency/models/strong-serializable
Version: fetched 2026-10-30

> Informally, Strong Serializability (a.k.a. Strict Serializability, Strict
PL-SS, Strong 1SR, etc.) means that operations appear to have occurred in some
order, consistent with the real-time
ordering of those operations; e.g.
if operation A completes before operation B begins, then A should appear to
precede B in the serialization order.

> Strict serializability implies serializability and
linearizability. You can think of strict serializability as
serializability's total order of transactional multi-object operations, plus
linearizability's real-time constraints.

> A history is serializable if it is equivalent to one in which transactions
appear to execute sequentially, i.e., without interleaving. A (partial)
precedence order can be defined on non-overlapping pairs of transactions in
the obvious way. A history is strictly serializable if the transactions' order
in the sequential history is compatible with their precedence order.

## Peter Bailis: Linearizability versus Serializability

URL: http://www.bailis.org/blog/linearizability-versus-serializability/
Version: fetched 2026-10-30 (originally published 24 Sep 2014)

> Linearizability: single-operation, single-object, real-time order

> Serializability: multi-operation, multi-object, arbitrary total order

> So, why didn't the early papers that defined serializability call attention to this real-time ordering? In some sense, real time doesn't really matter: all serializable schedules are equivalent in terms of their power to preserve database correctness!

## PostgreSQL Documentation: Transaction Isolation

URL: https://www.postgresql.org/docs/current/transaction-iso.html
Version: fetched 2026-10-30 (current/18)

> The most strict is Serializable, which is defined by the standard in a paragraph which says that any concurrent execution of a set of Serializable transactions is guaranteed to produce the same effect as running them one at a time in some order.

> The Serializable isolation level provides the strictest transaction isolation. This level emulates serial transaction execution for all committed transactions; as if transactions had been executed one after another, serially, rather than concurrently.

## etcd API Guarantees

URL: https://etcd.io/docs/v3.5/learning/api_guarantees/
Version: fetched 2026-10-30 (v3.5)

> etcd ensures durability and strict serializability for all KV api calls.

## Spanner: Google's Globally-Distributed Database

URL: https://research.google.com/archive/spanner-osdi2012.pdf
Version: fetched 2026-10-30 (OSDI 2012)

> The timestamps reflect serialization order. In addition,
the serialization order satisfies external consistency (or
equivalently, linearizability [20]): if a transaction T1
commits before another transaction T2 starts, then T1 's
commit timestamp is smaller than T2 's.

## Sandbox PostgreSQL 16 (measured, not a documented source)

URL: internal-not-fetched-sandbox-postgresql-16-measurement
Version: measured on this sandbox's PostgreSQL 16.15, 2026-10-30

No quotes; this is the sandbox's own PostgreSQL server (`psql (PostgreSQL) 16.15`), used to measure, not to cite, whether a given deployment's `SERIALIZABLE` happens to respect real time in two scenarios (see `post-notes.md`'s Lab section for the exact commands and results): a fresh, non-overlapping transaction beginning after a commit, and a transaction already open when a sibling transaction commits.

## de.linearizability (internal cross-reference)

URL: internal-not-fetched-de.linearizability
Version: this topic's own commit history

No quotes; the single-object real-time rule this topic's strict serializability adds back is exactly topic 5's linearizability, referenced here, not re-quoted.

## de.sequential-causal-consistency (internal cross-reference)

URL: internal-not-fetched-de.sequential-causal-consistency
Version: this topic's own commit history

No quotes; serializability is this topic's multi-object cousin of topic 6's sequential consistency, referenced here, not re-quoted.
