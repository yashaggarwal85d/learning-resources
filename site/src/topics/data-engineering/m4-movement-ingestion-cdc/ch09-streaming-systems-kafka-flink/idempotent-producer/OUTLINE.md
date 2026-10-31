# Storyboard: Idempotent producer (de.idempotent-producer)

10 steps, matching CHAPTER.md's hook (disable idempotence, replay a lost-ack retry, get a real
duplicate; re-enable it, replay the same scenario, get zero duplicates, broker rejection logged).

1. **Hook** — disabling idempotence and replaying topic 9's lost-ack retry produces a real
   duplicate; re-enabling it and replaying the identical scenario produces zero duplicates.
2. **Setup** — a producer box stamping each batch with a PID/epoch/sequence triple as it leaves;
   a broker box holding a small "last seen sequence" table per partition.
3. **Predict** — the exact same batch (same sequence number) is resent. Does the broker have any
   way to tell it's a repeat?
4. **Reveal** — yes: the broker tracks the last accepted sequence per (PID, partition) and rejects
   anything not exactly one greater, bouncing the duplicate off before it ever lands.
5. **Predict** — does the same sequence-number protection apply across two different partitions
   from the same producer?
6. **Reveal** — no: the sequence counter is per (PID, partition); the same number on a different
   partition is a fresh, legitimate first write.
7. **Reveal** — a producer restarts (a new session). A new epoch is issued, fencing any write
   still in flight from the old epoch — a zombie producer can't corrupt state under a reused PID.
8. **Reveal** — scope, precisely: no-duplication within one producer session, for one partition —
   nothing about two different producers, nothing across partitions, nothing across a restart
   unless the application supplies its own stable identity.
9. **Prove it** — the toy run: duplicate rejection, cross-partition independence, and zombie
   fencing, all from this topic's own `examples.py`.
10. **Recap** — PID, epoch, sequence number; the exact scope idempotence covers and doesn't.

Prerequisites panel (CHAPTER.md): topics 3, 9. Bridge from topic 9's handoff; handoff into
topic 11 (transactions, the next-scope-up mechanism).
