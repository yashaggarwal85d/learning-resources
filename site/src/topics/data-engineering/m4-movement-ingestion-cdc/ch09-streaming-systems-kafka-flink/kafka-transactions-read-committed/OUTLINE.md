# Storyboard: Kafka transactions and read-committed (de.kafka-transactions-read-committed)

10 steps. This is a large topic (transactional ids/fencing, coordinator + internal state topic,
LSO/read_committed, consume-transform-produce, KIP-890, KIP-939) — the reel covers the mechanism
and its two headline guarantees; the lab (kill-mid-commit) is referenced per CHAPTER.md but not
rebuilt as a separate artifact here, matching "hosts the kill-mid-commit leg of the 9.2 lab" as a
conceptual walkthrough within the reveal steps rather than a standalone script, since the toy
coordinator/log model in examples.py already demonstrates the same kill/restart/fencing shape.

1. **Hook** — idempotence covers one producer, one partition, one session; a consume-transform-
   produce step touches an input offset and output partitions together, needing all-or-nothing.
2. **Setup** — a transactional id gives a producer a stable identity across restarts; a dedicated
   coordinator and internal topic track every transaction's state.
3. **Predict** — a producer restarts under the same transactional id while an old instance is
   still mid-write. What happens to the old instance's writes?
4. **Reveal** — the restart bumps the producer's epoch; a write still arriving under the old epoch
   is fenced off, a zombie rejected by id, not just by PID.
5. **Predict** — an aborted transaction's records are still sitting in the log. Does a normal
   reader see them?
6. **Reveal** — depends on isolation level: read_uncommitted sees everything; read_committed only
   returns committed transactions' records, filtered up to the last stable offset.
7. **Reveal** — consume-transform-produce: committing input offsets inside the same transaction as
   output writes closes topic 9's second crash window end to end, within Kafka.
8. **Reveal** — KIP-890's server-side defense (epoch bump per transaction, completed 4.0) stops a
   hung transaction from pinning the LSO and blocking every read_committed consumer indefinitely;
   KIP-939 lets an external system (a database) join a Kafka transaction via two-phase commit.
9. **Prove it** — the toy run: zombie fencing by transactional id, and the read_committed/
   read_uncommitted comparison, from this topic's own `examples.py`.
10. **Recap** — transactional id and fencing, the coordinator, LSO/read_committed, consume-
    transform-produce, and the two newer KIPs named.

Prerequisites panel (CHAPTER.md): topics 10 (idempotence), and the epoch-fencing/delivery-
semantics lineage. Bridge from topic 10's handoff; handoff into topic 12 (sinks beyond Kafka).
