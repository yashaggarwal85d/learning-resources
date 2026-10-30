# Outline: Leases, fencing tokens and split brain (`de.leases-fencing-tokens-split`)

Section 14.6. ~15 min. Per CHAPTER.md §10.

## Scope (syllabus clause by clause)

1. **Leader leases for local linearizable reads (and their dependence on bounded clock drift)** —
   a lease is a quorum's promise not to elect another leader until time T; while it holds, local
   reads stay linearizable because no other leader can exist; Chubby's "master lease" is the
   production example; the argument needs a bound on clock drift between holder and granters.
2. **Zombie leaders after GC pauses** — a process paused longer than its lease, between checking
   it and acting, can resume believing it still holds it; a check right before the write does not
   help, since the pause can land between the check and the write itself.
3. **Fencing tokens / epoch numbers checked by the storage layer** — a monotonically increasing
   number, sent with every write, checked and rejected by the resource if lower than one already
   seen; Chubby's sequencer, Kafka's producer epoch, ZooKeeper's zxid, Raft's term, all one idea.
4. **Why a distributed lock without fencing is not safe** — a lock is a hint, not an enforcement
   mechanism; safety has to be enforced by the resource being protected, not by every client's
   timing; Chubby's lock-delay as an imperfect defence for resources that cannot check a token.

## Leaves out

The consensus algorithm underneath the lock service (topic 9, used); coordination services as
products and Kafka's ISR (topic 11); clocks and drift themselves (topic 2, used); Redlock and
Redis locking as a product critique (named only); the skipped Chubby/"Paxos Made Live" case study
(named in the Deep dive).

## Concept ledger

Introduces: `leader-lease-clock-bound`, `zombie-leader-gc-pause`, `fencing-token-epoch`,
`lock-without-fencing-unsafe`.
Uses, per CHAPTER.md: `bounded-error-clock-interval`, `clock-drift-ntp-error`,
`wall-vs-monotonic-clock`, `stale-leader-read`, `linearizability-definition`,
`raft-terms-election-voting-restriction`, `timing-models-sync-partial-async`, `process-model`,
`signals` (Chapter 1), `consensus-raft-paxos-in-systems` (Chapter 5), `queues-vs-logs`
(Chapter 5). Grepping `registry.ts` confirms `bounded-error-clock-interval`,
`clock-drift-ntp-error`, `wall-vs-monotonic-clock` (topic 2), `stale-leader-read` and
`linearizability-definition` (topic 5), `raft-terms-election-voting-restriction` (topic 9),
`timing-models-sync-partial-async` (topic 1), and `process-model`/`signals` (Chapter 1) are all
genuinely `introduces`d already. Neither `consensus-raft-paxos-in-systems` nor `queues-vs-logs` is
ever `introduces`d by any built topic, so both move to `declared`, per the same ledger-correction
rule used in topics 5, 7, 8 and 9.
Declared: `consensus-raft-paxos-in-systems`, `queues-vs-logs`.

## Reel shape (9 steps)

1. Hook — a worker paused by GC for a long interval, lease expires, a second worker takes it and
   writes, the first wakes and overwrites the second's write; it checked the lease just before
   writing.
2. Predict — re-check the lease, make the lease longer, or make storage reject the old holder?
3. Reveal — the lease: a quorum's promise, giving local linearizable reads at the price of a
   bounded-clock-drift assumption.
4. Reveal — why a check right before the write doesn't help: the pause can fall between the check
   and the write itself.
5. Reveal — fencing tokens: a monotonically increasing number, checked by the resource, that
   rejects a stale write. Takeaway.
6. Reveal — the same idea, four names: Chubby's sequencer, Kafka's producer epoch, ZooKeeper's
   zxid, Raft's term.
7. Reveal — why a lock alone is a hint, not a guarantee; Chubby's lock-delay as an imperfect
   defence. Takeaway.
8. Recap. Takeaway.
9. Prove it — a lock service hands out a unique random token per client, never increasing — is
   that enough to make the lock safe?
