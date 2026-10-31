- **ZooKeeper (historical)**: the separate coordination system that used to store Kafka's cluster
  metadata, before Kafka 4.0 removed it entirely. *Where you meet it:* the hook and setup steps.
- **Raft**: the consensus protocol the controller quorum runs to agree on an ordered metadata log.
  *Where you meet it:* the setup step, and every reveal after it.
- **Controller quorum**: the small set of controller nodes that run Raft and manage the metadata
  log. *Where you meet it:* the setup step onward.
- **Metadata log**: the `__cluster_metadata` log brokers replay to build their view of the cluster,
  built the same way as any other partition. *Where you meet it:* the first predict/reveal pair.
- **Snapshot**: a periodic checkpoint of the metadata log that bounds how much a joining or
  recovering broker must replay. *Where you meet it:* named in the setup step.
- **Pre-vote**: a candidate's informal check that it could win before bumping the term and forcing
  a real election. *Where you meet it:* the second predict/reveal pair.
- **Fencing**: treating a broker as stale once its heartbeat lapses, even though it may still be
  reachable. *Where you meet it:* the hook, and the first reveal's real numbers.
