Last verified: 30 October 2026. No live lab (per `CHAPTER.md`); the majority-vs-unanimity,
quorum-loss-refusal, blast-radius, and round-trip-cost claims are checked executable claims
(`examples.py`), run and confirmed clean.

- Raft Consensus Algorithm project site: [raft.github.io](https://raft.github.io/). Majority quorum's own stated progress-and-safety guarantee, in the authors' own words.
- Apache Kafka, "KRaft" documentation: [kafka.apache.org](https://kafka.apache.org/44/operations/kraft/). The controller metadata quorum, and its own majority-availability rule.
- etcd, "etcd versus other key-value stores": [etcd.io](https://etcd.io/docs/v3.6/learning/why/). etcd's own single global replication group, documented as a deliberate trade.
- CockroachDB, "Replication Layer" architecture documentation: [docs.cockroachlabs.com](https://docs.cockroachlabs.com/docs/stable/architecture/replication-layer). Per-range Raft groups, quorum, and leader/follower heartbeats.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=consensus-inside-data-systems:%20).
