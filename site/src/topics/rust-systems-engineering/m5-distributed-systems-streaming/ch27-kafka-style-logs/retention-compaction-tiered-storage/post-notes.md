---
title: "Retention, compaction, and tiered storage"
---

## Outcomes

- Build directly on topic 70's own partitioned log: a real time/size retention function and a real compaction function running over the identical toy log.
- Measure that time/size retention genuinely deletes an entry past its own age threshold, regardless of whether it is a key's own latest entry.
- Measure that compaction genuinely keeps the latest value for each distinct key forever, even on the identical log retention would have pruned.
- Measure that a real tombstone genuinely removes a key entirely once compaction runs past it, without touching any other key.
- State, from Confluent's own documentation and from the Apache Kafka project's own design document, the real rules this topic's own code measures directly.

## Internals

Retention and compaction here run over the identical real log, deliberately, so the measured difference between them is attributable to the one real thing that differs: retention only ever compares a timestamp to a cutoff, while compaction only ever compares a key to the latest entry already seen for it, scanning the log in its own real write order. A tombstone is handled as a real, ordinary entry all the way through that scan, with a `None` value; it is only the final filter, after the latest-per-key pass, that drops a key whose own latest entry turned out to be a tombstone, which is exactly what makes a tombstone's own removal a property of compaction, not a separate deletion pass bolted on afterward.

## In production

Confluent's own documentation and the Apache Kafka project's own design document describe this identical pair of mechanisms in close to identical words: compaction is a finer-grained retention mechanism than the coarse, time-based kind, selectively removing records with a more recent update under the same key, guaranteeing the log keeps at least the last state for each key. A message with a key and a null payload is treated as a real delete, called a tombstone, and the broker itself cleans tombstones back out of the log after `delete.retention.ms`, a real, separate window from ordinary retention. These two policies are set per topic, so a single real cluster can run some topics on time or size and others on compaction, depending on whether a topic's own data is temporal events or the current state of some set of keys.

## The frontier

Real production Kafka also tiers cold log segments out to cheaper object storage once they age past the broker's own local disk, rather than deleting them outright; KIP-405 is the real feature that added this to Kafka itself, letting a cluster keep years of history without keeping it all on expensive local disks. None of the tiered-storage question changes the retention-versus-compaction question this topic's own code measures directly: a tiered segment is still either aging out by time or size, or still being compacted by key, exactly as it would be on local disk. On the client side, the real `rdkafka` crate used by Rust services wraps `librdkafka`, the C client, rather than re-implementing the wire protocol in Rust, giving a Rust producer or consumer access to the identical idempotent-producer and compaction-aware behavior measured across this chapter's own three topics. All of this topic's own measured claims run entirely on plain in-memory Rust values and functions, with no file, network, or root access needed.

## Where this goes next

This chapter measured what a partitioned, product-facing log promises about order, delivery, and how long its own data sticks around; the next chapter turns to state that does not need any of this chapter's own coordination at all, because it is built to merge safely no matter which order its own updates arrive in.
