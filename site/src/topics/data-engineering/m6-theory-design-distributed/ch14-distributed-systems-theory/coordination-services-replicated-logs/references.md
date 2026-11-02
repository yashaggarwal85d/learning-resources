- Hunt, P., Konar, M., Junqueira, F., Reed, B. "ZooKeeper: Wait-free coordination for Internet-scale systems." *USENIX ATC 2010.* [PDF](https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf)
- "ZooKeeper Programmer's Guide." *Apache ZooKeeper, current.* [Page](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- "etcd API guarantees." *etcd v3.5 Documentation.* [Page](https://etcd.io/docs/v3.5/learning/api_guarantees/)
- "Apache Kafka 4.0.0 Release Announcement." 18 March 2025. [Page](https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/)
- "Replication." *Apache Kafka design documentation*, mirrored by Confluent. [Page](https://docs.confluent.io/kafka/design/replication.md)
- "KIP-966: Eligible Leader Replicas." *Apache Kafka KIP.* [Page](https://cwiki.apache.org/confluence/display/KAFKA/KIP-966%3A+Eligible+Leader+Replicas)
- "Spec." *Apache Iceberg.* [Page](https://iceberg.apache.org/spec/)
- "Cluster Architecture." *Kubernetes Documentation.* [Page](https://kubernetes.io/docs/concepts/architecture/)

On the Kafka design documentation's own host: `kafka.apache.org/documentation/#design` loads this
page's content via client-side JavaScript after the initial response, which this sandbox could
not execute, so Confluent's hosted mirror of Apache's own design-documentation markdown source
was quoted instead (see `SOURCES.md` for the full note).

Named only (not quoted, per CHAPTER.md's Leaves out): the consensus-problem and quorum-system
syllabus topics skipped and named in topic 9's Deep dive; the skipped Chubby case study.

Last verified: 2026-10-30. Expert sign-off: pending.
