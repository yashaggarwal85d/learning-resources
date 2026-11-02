# Outline: Two-phase commit and its blocking problem (`de.two-phase-commit-blocking`)

Section 14.7. ~15 min. Per CHAPTER.md §12.

## Scope (syllabus clause by clause)

1. **Prepare/commit** — the coordinator asks every participant to prepare (make the transaction
   durable, promise it can commit); if all vote yes, the coordinator durably logs commit and tells
   everyone, else abort.
2. **The coordinator as single point of blocking (participants in doubt hold locks)** — a
   participant that voted yes is in doubt: it cannot unilaterally decide, so it holds its locks
   until it hears the outcome; a coordinator that crashes after logging the decision but before
   announcing it leaves every prepared participant blocked, holding locks, measured as lock-hold
   time.
3. **3PC and why it fails under partitions** — three-phase commit adds a pre-commit phase so
   participants can finish without the crashed coordinator, but needs timeouts to stand in for
   failure detection, which is only safe when the network is not partitioned; Gray and Lamport's own
   sentence about "traditional Three-Phase commit protocols" states the multiple-coordinator
   inconsistency this topic can actually quote (Skeen's own paper is unusable for a verbatim quote —
   see SOURCES.md's sourcing note — so the claim is carried by Gray and Lamport's sentence, not
   Skeen's).
4. **Paxos Commit (Gray & Lamport, 2006) / 2PC over consensus-replicated participants as the
   production answer** — running a Paxos instance on each participant's prepare vote so the
   decision survives losing the coordinator; classic 2PC is the paper's own F = 0 special case;
   Spanner's transaction manager state lives in its Paxos group, CockroachDB's Parallel Commits
   halves cross-range commit latency by running the consensus round trips concurrently.
5. **Sagas and outbox patterns at the application level (§5.2, §8.2)** — named only, the
   give-up-atomicity alternative; not retaught.

## Leaves out

Chapter 5 topic 16's database-level 2PC and XA (built on); the Raft mechanism used to replicate the
coordinator's decision (topic 9, reused); the skipped "Transaction architectures beyond 2PC"
syllabus topic (Percolator, Calvin, FoundationDB: named only in the Deep dive); sagas and outbox
implementations; TrueTime and commit wait (skipped).

## Concept ledger

Introduces: `two-phase-commit-blocking-in-doubt`, `three-phase-commit-limits`,
`paxos-commit-consensus-replicated-participants`.
Uses, per CHAPTER.md: `two-phase-commit` (Chapter 5 topic 16), `raft-log-matching-and-commitment`,
`raft-terms-election-voting-restriction`, `consensus-raft-paxos-in-systems` (Chapter 5),
`distributed-sql-architecture` (Chapter 5), `timing-models-sync-partial-async`,
`fault-models-crash-omission-byzantine`, `locking-deadlock-detection` (Chapter 5),
`strict-serializability-definition`. Grepping `registry.ts` confirms `two-phase-commit`,
`raft-log-matching-and-commitment`, `raft-terms-election-voting-restriction`,
`timing-models-sync-partial-async`, `fault-models-crash-omission-byzantine`,
`locking-deadlock-detection` and `strict-serializability-definition` are all genuinely
`introduces`d already. Neither `consensus-raft-paxos-in-systems` nor `distributed-sql-architecture`
is ever `introduces`d by any built topic (both only ever appear in other topics' `declared` lists),
so both move to `declared`, per the same ledger-correction rule used in topics 5, 7, 8, 9, 10 and
11.
Declared: `consensus-raft-paxos-in-systems`, `distributed-sql-architecture`.

## Reel shape (10 steps)

1. Hook — an order spans two shards; the coordinator collects both prepare votes, logs "commit",
   crashes before telling either shard; both shards hold locks for an hour.
2. Predict — abort after a timeout, commit after a timeout, or wait?
3. Reveal — prepare/commit: what a yes vote promises, what gets logged durably.
4. Reveal — why a prepared participant cannot decide alone: in doubt, holding locks, measured as
   lock-hold time.
5. Reveal — 3PC's pre-commit phase and the timeout-as-crash assumption it needs; why multiple
   coordinators under partition disagree (Gray & Lamport's sentence). Takeaway.
6. Reveal — Paxos Commit: a consensus instance per participant's vote, the decision survives the
   coordinator; classic 2PC as its F = 0 case. Takeaway.
7. Reveal — production placement: Spanner's transaction-manager state inside its Paxos group;
   CockroachDB's Parallel Commits running the consensus round trips concurrently to halve latency.
   Takeaway.
8. Reveal — sagas and outbox, named only, as the give-up-atomicity alternative at the application
   level.
9. Recap.
10. Prove it — a second predict step, about what replicating the coordinator's decision does and
    does not fix.
