# Outline: Coordination services and replicated logs in data systems (`de.coordination-services-replicated-logs`)

Section 14.6. ~15 min. Per CHAPTER.md §11.

## Scope (syllabus clause by clause)

1. **ZooKeeper (Zab, sessions, ephemeral nodes, watches)** — linearizable writes plus FIFO client
   order (its own guarantees), implemented by Zab; a session with a timeout; ephemeral znodes
   deleted when their creating session terminates; watches; reads served locally (A-linearizable
   writes only), so a read can be stale; `sync` then read gives a fresher "slow" read.
2. **etcd (Raft)** — a Raft-replicated key-value store; all KV API calls are strictly
   serializable; linearizable reads by default, an opt-in serializable read that may be stale;
   leases binding keys to a TTL; revisions as a global counter; Kubernetes' own backing store.
3. **Kafka's KRaft controller quorum (Kafka 4.0 removed ZooKeeper entirely)** — the 4.0 release's
   own words: "the first major release to operate entirely without Apache ZooKeeper"; a
   Raft-replicated `__cluster_metadata` log; Pre-Vote (KIP-996).
4. **Kafka's ISR replication as a non-majority quorum** — "dynamically maintains a set of
   in-sync replicas (ISR)" instead of majority vote; committed only once *all* ISR members have
   it; `f+1` replicas versus majority's `2f+1`; `acks=all`/`min.insync.replicas` exact meaning;
   unclean leader election's availability-versus-consistency trade; KIP-966's fix for the
   last-replica-standing data-loss case.
5. **Table-format commits as compare-and-swap on a catalog pointer** — Iceberg's own words: an
   atomic swap of one metadata file for another, giving serializable isolation; a linearizable
   register, the model this chapter already defined.

## Leaves out

The Raft algorithm itself (topic 9, used) and Zab internals beyond naming; leases and fencing
(topic 10, used); Kafka internals, KRaft's snapshot/dynamic-quorum details, and the ZooKeeper
migration (Chapter 9 §9.1); table-format internals and the open catalog protocol (Chapter 6 §6.3);
the skipped consensus-problem/quorum-systems syllabus topics (named in topic 9's Deep dive, and
here once for `R + W > N` not implying linearizability); the skipped Chubby case study (named).

## Concept ledger

Introduces: `zookeeper-etcd-guarantees`, `kraft-controller-quorum`, `kafka-isr-non-majority-quorum`,
`table-commit-as-cas`.
Uses, per CHAPTER.md: `raft-terms-election-voting-restriction`, `raft-log-matching-and-commitment`,
`fencing-token-epoch`, `leader-lease-clock-bound`, `linearizability-definition`,
`strict-serializability-definition`, `consistency-model-map`, `consensus-raft-paxos-in-systems`
(Chapter 5), `queues-vs-logs`, `replication-ack-modes`, `physical-vs-logical-replication`,
`occ-vs-pcc` (Chapter 5), `k8s-reconciliation-loop` (Chapter 12). Grepping `registry.ts` confirms
`raft-terms-election-voting-restriction`/`raft-log-matching-and-commitment` (topic 9),
`fencing-token-epoch`/`leader-lease-clock-bound` (topic 10), `linearizability-definition`/
`strict-serializability-definition`/`consistency-model-map` (topics 5/7), `replication-ack-modes`,
`physical-vs-logical-replication`, and `occ-vs-pcc` are all genuinely `introduces`d already.
`consensus-raft-paxos-in-systems`, `queues-vs-logs`, and `k8s-reconciliation-loop` are never
`introduces`d by any built topic, so all three move to `declared`, per the same ledger-correction
rule used in topics 5, 7, 8, 9 and 10.
Declared: `consensus-raft-paxos-in-systems`, `queues-vs-logs`, `k8s-reconciliation-loop`.

## Reel shape (9 steps)

1. Hook — a Kafka topic, replication factor three, min.insync.replicas two, one follower already
   out of the ISR; `acks=all` acknowledges a write on the leader and one follower; both then fail,
   leaving only the out-of-sync replica. Is the acknowledged write lost?
2. Predict — with unclean leader election off vs on, and with min.insync.replicas at two vs one:
   which combination loses the write?
3. Reveal — ZooKeeper's two guarantees (linearizable writes, FIFO client order), ephemeral znodes
   and watches as the leader-election building block, and why reads can be stale without `sync`.
4. Reveal — etcd: strictly serializable by default, an opt-in stale-but-faster serializable read,
   leases and revisions.
5. Reveal — Kafka 4.0's own words: the first major release without ZooKeeper; KRaft's controller
   quorum replicating metadata through Raft.
6. Reveal — the ISR is not a majority quorum: `f+1` replicas versus `2f+1`, and what that costs.
   Takeaway.
7. Reveal — `acks=all`/`min.insync.replicas` exactly, unclean leader election's trade, and KIP-966's
   fix for the one case that trade still loses data in.
8. Reveal — a table-format commit as compare-and-swap on one pointer: Iceberg's atomic swap,
   named as the linearizable register this chapter already defined. Takeaway.
9. Recap. Takeaway.
