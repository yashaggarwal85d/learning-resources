# Outline: Serializability vs strict serializability (`de.serializability-vs-strict-serializability`)

Section 14.3. ~15 min. Per CHAPTER.md §7.

## Scope (syllabus clause by clause)

1. **Transactional (multi-object) models vs single-object ones** — Bailis: linearizability is
   "single-operation, single-object, real-time order", serializability "multi-operation,
   multi-object, arbitrary total order." Serializability is the multi-object cousin of topic 6's
   sequential consistency; strict serializability of topic 5's linearizability.
2. **Serializability allows "time travel"** — Jepsen: serializability "does not impose any
   real-time, or even per-process constraints"; PostgreSQL's own docs define `SERIALIZABLE` as
   "the same effect as running them one at a time in some order", nothing about real time.
   **Measured, not assumed:** this topic runs the hook's exact scenario on the sandbox's
   PostgreSQL 16 (see post-notes.md's Lab section) rather than taking the time-travel possibility
   on faith.
3. **Strict serializability = serializability + real-time order** — Jepsen, quoting the same
   sentence CHAPTER.md names: "if operation A completes before operation B begins, then A should
   appear to precede B in the serialization order." Also called external consistency, per
   Spanner's own paper.
4. **The two-axis map** — single/multi-object × ordering strength, with etcd (strict
   serializable), Spanner (external consistency), and PostgreSQL `SERIALIZABLE` (serializable,
   not strict, by its own documentation's own wording) placed from each one's own docs.

## Leaves out

Isolation anomalies and their dependency-graph definitions; snapshot isolation/SSI mechanics
(Chapter 5, built on); history-checking tools (topic 5's lab named them); the HAT result (named
as a sourced pointer only); atomic commitment across shards (topic 12); Percolator/Calvin/
FoundationDB as architectures (skipped syllabus topic).

## Concept ledger

Introduces: `serializable-definition-time-travel`, `strict-serializability-definition`,
`consistency-model-map`.
Uses: `linearizability-definition`, `linearizability-locality`, `sequential-consistency-definition`,
`causal-consistency-definition`, `serializability-2pl-ssi`, `snapshot-isolation`,
`isolation-anomalies`, `acid-guarantees`, `session-guarantees-formal`.
(CHAPTER.md's full "uses" list also names `distributed-sql-architecture`; grepping `registry.ts`
confirms it is not yet `introduces`d by any built topic, so it moves to `declared`, per the same
ledger-correction rule topic 5 applied. Every other listed concept, including the two topic 6
introduced — `session-guarantees-formal` and the consistency-model definitions — and the four
Chapter 5 concepts, checked out as genuinely `introduces`d already.)
Declared: `distributed-sql-architecture`.

## Lab (measured on this sandbox's PostgreSQL 16.15)

Two scenarios actually run, not assumed from documentation:
1. A fresh `SERIALIZABLE` transaction, opened strictly after a sibling's commit, sees that
   sibling's write — real-time order held, here, as an artifact of single-node MVCC snapshot
   timing, not a documented promise.
2. A `SERIALIZABLE` transaction already open when a sibling transaction commits does NOT see that
   sibling's write, even on its second read taken after the sibling's commit completed — the
   "time travel" the definition permits, demonstrated, not just quoted.
A second node (streaming replica) was not set up in this sandbox; the replica-lag half of the
clause stays sourced-only, as CHAPTER.md allows.

## Reel shape (9 steps)

1. Hook — a customer sees "confirmed", refreshes, the order isn't there.
2. Predict — does the serializable definition forbid this, allow it, or allow it only through a
   replica?
3. Reveal — serializability: one total order over whole transactions, multi-object, no real-time
   rule, verified on the hook's own history.
4. Reveal — the fix is strict serializability, not a different database: same history, real time
   added back.
5. Reveal — measured on a real Postgres: a non-overlapping transaction sees everything; an
   overlapping one legally doesn't. Takeaway.
6. Reveal — the two-axis map, four systems placed from their own documentation.
7. Reveal — two causally ordered transactions can legally serialize in reverse. Takeaway.
8. Recap. Takeaway.
9. Prove it — a database that always runs transactions one at a time, literally serially: is it
   strictly serializable?
