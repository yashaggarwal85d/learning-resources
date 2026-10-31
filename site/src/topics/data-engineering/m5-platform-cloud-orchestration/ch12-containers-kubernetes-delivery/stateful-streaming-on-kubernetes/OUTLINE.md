# Outline — `de.stateful-streaming-on-kubernetes`

Full topic, §12.2. Bridges from topic 6 ("A Spark executor is disposable...") and hands off to topic 8 (GitOps).

## Declared cross-chapter gap

CHAPTER.md's brief names Chapter 9 §9.1 ("Replication, ISR and the high watermark", "KRaft: metadata as a replicated log") and §9.3 ("Asynchronous barrier snapshots" — checkpoints vs savepoints) as concepts this topic builds on and should draw `uses` ids from. Checked `registry.ts` directly: Chapter 9 §9.1 currently has only two held topics (`de.partitioned-log-segments-indexes`, `de.producer-batching-compression-acks` — about log storage and producer semantics, not ISR/min.insync.replicas/KRaft), and Chapter 9 §9.3 has no topic at all yet. Per CHAPTER.md's own cross-chapter-id rule (the same situation topic 6 hit for Chapter 7 §7.3), this is logged as a declared gap rather than a guessed id. `consensus-raft-paxos-in-systems` (also named by CHAPTER.md for KRaft's quorum) is already used as a `declared` concept elsewhere in the registry (`de.linearizability`), establishing precedent that this concept is treated as external/declared knowledge, not sourced from a specific DE topic — followed here too. `coverage.json`'s `gapReview.open` stays empty (the ISR/KRaft/checkpoint-vs-savepoint *mechanics themselves* are taught fresh in this topic from Strimzi's and Flink's own sources, not assumed as prerequisite knowledge from an unbuilt topic — only the *names* "Chapter 9 §9.1" and "§9.3" as prerequisite topics are the gap).

## Steps

1. **Hook** — a node needs patching; two of three brokers (RF 3, min.insync.replicas 2) sit on drained nodes. Predict: producers stall, data loss, or nothing, if the drain evicts both at once?
2. **What a broker needs that a Spark executor didn't** — a stable name, its own disk that follows it, ordered startup. StatefulSet's sticky identity (Kubernetes docs).
3. **Stable storage, a template, not a pod** — `volumeClaimTemplates`; `persistentVolumeClaimRetentionPolicy.whenDeleted`/`whenScaled` (Kubernetes docs).
4. **Why Strimzi doesn't use a plain StatefulSet** — Strimzi's own proposal: workarounds for asymmetric storage, single-cluster limitation (031-statefulset-removal.md). `StrimziPodSet` + `KafkaNodePool` (Strimzi deploying docs) — named honestly as Strimzi's own resources, not K8s primitives.
5. **Rack awareness, and what it costs** — `rack.topologyKey: topology.kubernetes.io/zone` spreads replicas across zones (Strimzi docs); the cross-AZ replication traffic this creates (Chapter 10 egress material, referenced not re-taught).
6. **Predict 1 resolves: the roller's rule** — `KafkaRoller`'s own comment: "rolling should happen without impacting any topic's min.isr." `KafkaAvailability`'s actual check: a broker can't be rolled if doing so would drop a partition's ISR below `min.insync.replicas` — the exact log line ("would remove it from ISR, stalling producers with acks=all"), traced from the source.
7. **Strimzi Drain Cleaner, PDB's other half** — a node eviction is turned into that same safe roll; a PodDisruptionBudget (topic 4) is the Kubernetes-side half of the same promise.
8. **KRaft-only since 0.46** — the 0.46.0 release notes: ZooKeeper-based clusters and KRaft migration support removed; clusters must already be on KRaft. Declared gap: KRaft's own quorum mechanics are Chapter 9 §9.1 (not yet built) and Raft/Paxos theory is `consensus-raft-paxos-in-systems` (declared, following `de.linearizability`'s precedent).
9. **A Flink job as a document** — the Flink Kubernetes Operator reconciles a declared custom resource; three upgrade modes exist: stateless, last-state, savepoint.
10. **Savepoint mode: the safest, and why** — "maximal safety and the possibility to serve as a backup or fork point"; needs a running job; falls back to the last checkpoint if unhealthy.
11. **Checkpoints vs. savepoints, used not re-taught** — checkpoint lifecycle owned by Flink, deleted automatically; savepoint lifecycle owned by the user, never auto-deleted (Flink docs) — this distinction is Chapter 9 §9.3 (declared gap), applied here.
12. **Checkpoints on object storage, and why local disk still matters** — `FileSystemCheckpointStorage` writes to a configured filesystem URL (object storage included); `EmbeddedRocksDBStateBackend` still holds in-flight state on the TaskManager's local disk by default — the checkpoint is a copy, not where the live state lives.
13. **Predict 2 resolves the hook** — with the operator's roll and ISR check in place, the eviction waits; the second broker isn't touched until the first rejoins the ISR.
14. **Managed vs. self-run, the decision left to the learner** — who rolls brokers, who watches ISR, who owns upgrades, against managed Kafka/Flink; lock-in cost stated, no rule given.
15. **Recap / handoff** — "Everything in this chapter is a document... The last question is who is allowed to change those documents on a running cluster." → topic 8.

## Lab

None of its own (per CHAPTER.md): the savepoint-preserving upgrade is exercised end to end in topic 8's lab. The sandbox has no Docker/kubectl/kind/k3s (confirmed again, same as topics 1-6), so the ISR rolling-restart safety check is demonstrated against the real `KafkaAvailability`/`KafkaRoller` decision logic as published, run computationally in `examples.py`, and disclosed as sourced-only for anything needing a live multi-broker cluster.
