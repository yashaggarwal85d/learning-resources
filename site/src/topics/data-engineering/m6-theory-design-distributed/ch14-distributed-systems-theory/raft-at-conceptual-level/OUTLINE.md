# Outline: Raft at the conceptual level (`de.raft-at-conceptual-level`)

Section 14.6. ~15 min. Per CHAPTER.md §9.

## Scope (syllabus clause by clause)

1. **Terms** — a logical clock that lets servers detect obsolete information such as stale
   leaders; a server with a stale term steps down or has its request rejected.
2. **Leader election with the up-to-date-log voting restriction** — a candidate must be at least
   as up-to-date as any voter in its majority (compare last term, then log length); the voting
   restriction is what gives Leader Completeness.
3. **Log matching property** — same index and term implies identical logs up to that index,
   maintained by `AppendEntries`'s consistency check.
4. **Commitment only for current-term entries** — the Figure 8 counter-example: an old-term entry
   on a majority is not yet safely committed; only a current-term entry committed by counting
   replicas carries everything before it indirectly, via Log Matching.
5. **Membership change** — joint consensus, a transition configuration needing majorities of both
   the old and new sets; single-server changes named as the later, simpler alternative (owned by
   the Rust track's skipped topic).
6. **Snapshots** — named: a server discards its log prefix once snapshotted; a leader sends a
   snapshot to a follower too far behind.
7. **What Raft adds over Multi-Paxos is understandability, not new power** — "It produces a result
   equivalent to (multi-)Paxos" and "simpler and more understandable."

## Leaves out

`AppendEntries`/`RequestVote` message formats, PreVote, CheckQuorum, conflict-repair edge cases,
a working implementation (Rust Systems Engineering Ch.26, named); where Raft runs in real systems
and what a commit costs (Chapter 5 topic 23, built on); leases and read-index reads (topic 10);
FLP impossibility (skipped syllabus topic, named in the Deep dive); the consensus problem and
Paxos themselves (skipped syllabus topics, named); Byzantine consensus (named).

## Concept ledger

Introduces: `raft-terms-election-voting-restriction`, `raft-log-matching-and-commitment`,
`raft-membership-and-snapshots`, `raft-vs-paxos-equivalence`.
Uses, per CHAPTER.md: `timing-models-sync-partial-async`, `safety-vs-liveness-in-a-model`,
`lamport-scalar-clock`, `linearizability-definition`, `stale-leader-read`,
`consensus-raft-paxos-in-systems` (Chapter 5), `two-phase-commit` (Chapter 5), `wal-lsn-fsync`
(Chapter 5). Grepping `registry.ts` confirms `timing-models-sync-partial-async` and
`safety-vs-liveness-in-a-model` (topic 1), `lamport-scalar-clock` (topic 3),
`linearizability-definition` and `stale-leader-read` (topic 5), `two-phase-commit` (Chapter 5),
and `wal-lsn-fsync` (Chapter 5) are all genuinely `introduces`d already. `consensus-raft-paxos-in-systems`
is only ever `declared` by topic 5 (never `introduces`d by any built topic), so it moves to
`declared` here too, per the same ledger-correction rule used in topics 5–8.
Declared: `consensus-raft-paxos-in-systems`.

## Reel shape (9 steps)

1. Hook — a leader writes entry 5 to itself and one follower, then crashes before telling anyone
   it's committed; a server without entry 5 wins the next election.
2. Predict — is the old-term entry on a majority committed, and can the new leader overwrite it?
3. Reveal — terms as a logical clock; a stale term gets rejected or steps down.
4. Reveal — the voting restriction: at least as up-to-date, comparing term then length; this is
   what gives Leader Completeness.
5. Reveal — the Log Matching property and `AppendEntries`'s consistency check. Takeaway.
6. Reveal — Figure 8: why counting replicas of an old-term entry is unsafe, and the current-term
   rule that fixes it.
7. Reveal — joint consensus's overlapping majorities for membership change, and snapshots named.
   Takeaway.
8. Recap. Takeaway.
9. Prove it — a leader replicates a current-term entry on a majority and then crashes: is it safe
   for the new leader to overwrite it?
