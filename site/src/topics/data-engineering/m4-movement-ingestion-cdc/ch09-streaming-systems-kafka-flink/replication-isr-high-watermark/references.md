Last verified against these sources: 30 October 2026. Real measurements run in this sandbox
(`examples.py`, toy replication models, no real Kafka broker available): a direct arithmetic
model of the high watermark as the minimum offset across a leader and lagging followers; a toy
`min.insync.replicas` accept/reject gate; a direct reimplementation of KIP-101's own worked
leader-epoch-truncation example; and a toy comparison of classic versus `min.insync.replicas`-
gated high-watermark advancement under a "last replica standing" scenario. The ISR/high-
watermark definitions, the leader-epoch truncation protocol, and the KIP-966 motivation and
proposed fix are disclosed, sourced-only claims from Kafka's own documentation and its own
accepted KIPs, since no real broker runs in this sandbox.

- Apache Kafka 4.4 design documentation (replicated logs, ISR, unclean leader election):
  [kafka.apache.org/44/design/design/](https://kafka.apache.org/44/design/design/) (the
  generated, fully-rendered design doc; the unversioned
  [kafka.apache.org/documentation.html#design](https://kafka.apache.org/documentation.html#design)
  assembles client-side and can't be fetched as static HTML). The ISR commitment rule, the
  `f+1` durability bound, and the exact "last replica standing" two-replica risk passage.
- Apache Kafka, KIP-101, "Alter Replication Protocol to use Leader Epoch rather than High
  Watermark for Truncation":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-101+-+Alter+Replication+Protocol+to+use+Leader+Epoch+rather+than+High+Watermark+for+Truncation).
  The leader-epoch definition and the worked example (follower restart, offset two from the
  epoch log versus a stale high watermark of offset zero) this topic's truncation reveal
  reimplements directly.
- Apache Kafka, KIP-966, "Eligible Leader Replicas":
  [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-966%3A+Eligible+Leader+Replicas).
  The "last replica standing" motivation scenario and the proposed high-watermark-advancement
  gate this topic's last reveal models. **Note:** this KIP's own text gives no version for when
  its feature becomes default-on (its config default is explicitly `False`); this topic does not
  repeat `CHAPTER.md`'s unconfirmed "default on new clusters from Kafka 4.1" claim — see
  `FACT-CHECK.md`'s correction.
- Apache Kafka 4.4 topic configuration reference (`min.insync.replicas`):
  [kafka.apache.org/44/generated/topic_config.html](https://kafka.apache.org/44/generated/topic_config.html).
  The default value and the exact write-success/read-visibility gate this topic's durability
  reveal cites directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=replication-isr-high-watermark:%20).
