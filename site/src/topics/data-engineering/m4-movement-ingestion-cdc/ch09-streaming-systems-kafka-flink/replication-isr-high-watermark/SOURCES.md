# Sources: Replication, ISR and the high watermark (`de.replication-isr-high-watermark`)

## Apache Kafka 4.4 design documentation: replicated logs, ISR, unclean election

URL: https://kafka.apache.org/44/design/design/ (the generated, fully-rendered design doc; the
unversioned `/44/documentation.html#design` assembles client-side and returns only a redirect
shell to a plain fetch — see Notes below).
Version: Apache Kafka 4.4 documentation.

> Kafka takes a slightly different approach to choosing its quorum set. Instead of majority vote, Kafka dynamically maintains a set of in-sync replicas (ISR) that are caught-up to the leader. Only members of this set are eligible for election as leader. A write to a Kafka partition is not considered committed until all in-sync replicas have received the write.

> With this ISR model and f+1 replicas, a Kafka topic can tolerate f failures without losing committed messages.

> By default from version 0.11.0.0, Kafka chooses the first strategy and favor waiting for a consistent replica. This behavior can be changed using configuration property unclean.leader.election.enable, to support use cases where uptime is preferable to consistency.

> By default, when acks=all, acknowledgement happens as soon as all the current in-sync replicas have received the message. For example, if a topic is configured with only two replicas and one fails (i.e., only one in sync replica remains), then writes that specify acks=all will succeed. However, these writes could be lost if the remaining replica also fails.

Contents:
- The ISR definition and the commit rule (a write isn't committed until every ISR member has it)
  and the `f+1` durability bound (used for the high-watermark reveal and its takeaway).
- `unclean.leader.election.enable` as the exact config name for the uptime-over-consistency
  tradeoff, default favoring consistency since 0.11.0.0 (used for the unclean-election step).
- The exact "last replica standing" risk passage — a two-replica topic down to one in-sync
  replica still accepts `acks=all` writes, which are lost if that replica also fails (used
  verbatim for the hook and the lab's loss-counting setup).

## Apache Kafka: KIP-101, "Alter Replication Protocol to use Leader Epoch rather than High Watermark for Truncation"

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-101+-+Alter+Replication+Protocol+to+use+Leader+Epoch+rather+than+High+Watermark+for+Truncation
Version: accepted KIP (the leader-epoch truncation protocol this topic's truncation step
describes).

> Leader Epoch: A 32 bit, monotonically increasing number representing a continuous period of leadership for a single partition. This is marked on all messages.

> There are a few known areas where replication in Kafka can either create an unexpected lineage in the log, or worse cause runtime outages due to replica divergence.

> The underlying issue is that messages are flushed to disk asynchronously. This means, after a crash, machines can be an arbitrary number of messages behind one another.

> the issue is that the replicas can diverge, with different message lineage in different replicas.

> In this solution the follower makes a request to the leader to determine if it has any divergent epochs in its log. It sends a LeaderEpochRequest to the leader for its current LeaderEpoch.

> So that’s to say the LeaderEpoch response contains the offset where the requested LeaderEpoch ends.

> In this case the LeaderEpochResponse returns offset 2. Note this is different to the high watermark which, on the follower, is offset 0. Thus the follower does not truncate any messages and hence message m2 is not lost.

> NB: It should be noted that this proposal does not protect against log divergence for clusters that use the setting unclean.leader.election.enable=true.

Contents:
- Why truncating to the high watermark alone can discard a committed message (the follower's HW
  is a round-trip stale) or let replicas diverge after a crash (used for the truncation step's
  "why raw offsets aren't enough" framing).
- The leader-epoch definition and the fetch-the-end-offset-of-my-epoch mechanism, with the exact
  worked example (epoch response returns offset 2, not the stale HW of 0) used almost verbatim
  for the truncation reveal.
- The explicit limit: epoch-based truncation does not by itself protect against divergence under
  unclean leader election (used to motivate the next step's unclean-election contrast).

## Apache Kafka: KIP-966, "Eligible Leader Replicas"

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-966%3A+Eligible+Leader+Replicas
Version: accepted KIP.

> However, there is a "last replica standing" state which when combined with a data loss unclean shutdown event can turn a local data loss scenario into a global data loss scenario, i.e., committed data can be removed from all replicas. When the last replica in the ISR experiences an unclean shutdown and loses committed data, it will be reelected leader after starting up again, causing rejoining followers to truncate their logs and thereby removing the last copies of the committed records which the leader lost initially.

> To handle leader elections, we will introduce a concept called Eligible Leader Replicas (ELR). In addition to the ISR members, replicas in ELR are also eligible for leader election during a clean election process.

> At a high level, we use ELR to store the replicas that are not in ISR but guarantee to have the data at least to High Watermark.

> We propose to enforce that High Watermark can only advance if the ISR size is larger or equal to min.insync.replicas.

> To enable ELR, you should turn on its feature version eligible.leader.replicas.version to ELRV_1. It controls whether the controller will record the ELR-related metadata and whether ISR can be empty. False is the default value. It will turn true in the future.

Contents:
- The exact "last replica standing" scenario (T0-T3: two brokers drop out of the ISR under
  network partitions, the sole remaining replica becomes leader, suffers an unclean shutdown and
  loses committed data, then gets re-elected on restart, erasing that data everywhere) — used
  near-verbatim for the unclean-election step's worst case.
- The ELR definition (a tracked pool of replicas that are out of ISR but still guaranteed caught
  up to the high watermark, eligible for a *clean* election) and the HW-advance rule tied to
  `min.insync.replicas` (used for the ELR reveal and its contrast with classic unclean election).
- **Correction to the planned claim**: `CHAPTER.md`'s scope line says ELR is "default on new
  clusters from Kafka 4.1 per the KIP." This KIP text states the opposite as of this fetch:
  the feature is gated behind `eligible.leader.replicas.version`, whose "default value" is
  explicitly `False`, with only "It will turn true in the future" — no specific version is named
  anywhere in the KIP. A search of the generated Kafka 4.4 config reference
  (`kafka.apache.org/44/generated/kafka_config.html`) and the version-pinned upgrade pages for
  Kafka 4.1 (`kafka.apache.org/41/documentation.html#upgrade_4_1_0`,
  `downloads.apache.org/kafka/4.1.0/RELEASE_NOTES.html`) found no confirming source either — the
  4.1 upgrade page returned only a client-assembled redirect shell to a plain fetch, and the
  release-notes URL errored. No citable source for "default on new clusters from 4.1" was found.
  Per this project's no-fabrication rule, the claim is downgraded in `OUTLINE.md`/`FACT-CHECK.md`:
  ELR is described as a safer, explicitly-tracked election pool Kafka added via KIP-966, without
  asserting it is on by default in any specific released version.

## Apache Kafka: topic configuration reference (`min.insync.replicas`)

URL: https://kafka.apache.org/44/generated/topic_config.html
Version: Apache Kafka 4.4 documentation.

> Regardless of the acks setting, the messages will not be visible to the consumers until they are replicated to all in-sync replicas and the min.insync.replicas condition is met.

Contents:
- `min.insync.replicas`: default `1`; what it actually gates (both write success under
  `acks=all` and read visibility) — used for the hook's `min.insync.replicas=2` configuration and
  the high-watermark step's "only below this line is visible" framing.

Notes on this topic's research:

The same redirect-shell fetch failure topics 1 and 2 hit recurred for the unversioned design and
upgrade pages (`documentation.html#design`, `documentation.html#upgrade_4_1_0`); the fix is the
same established pattern — fetch the version-pinned, fully-rendered page instead
(`/44/design/design/`, `/44/generated/topic_config.html`). No working source was found for the
Kafka 4.1 upgrade notes or release notes specifically (both attempted URLs failed outright, not
just redirect-shelled), which is why the ELR-default-version claim above is downgraded rather
than sourced.

Real measurements this topic also uses, not drawn from any of the sources above: a toy
leader-follower-ISR simulation that kills the leader mid-stream and counts how many
producer-believed-safe records are actually lost under `acks=1` versus
`acks=all`+`min.insync.replicas=2`, reusing the same acks-crash-sim shape topic 2 built but now
varying `min.insync.replicas` and the ISR size at the moment of the kill — see `examples.py`.
These are the toy's own numbers, not a real Kafka cluster's, and are disclosed as such in
`references.md`.
