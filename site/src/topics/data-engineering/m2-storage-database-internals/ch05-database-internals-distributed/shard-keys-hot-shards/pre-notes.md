- **Range and hash partitioning, consistent and rendezvous hashing**: topic 21's own content.
  *Where you meet it:* directly — this topic's shard key is placed by exactly the hashing/ranging
  scheme topic 21 built; the celebrity-key failure happens on top of an otherwise-correct scheme.
- **Consistent hashing's own algorithm**: `dsa.consistent-hashing-rings`, assumed rather than
  re-taught, per `CHAPTER.md`. *Where you meet it:* background — salting a key changes *which* key
  gets hashed, not how the ring or HRW placement itself works.
- **CAP and PACELC in practice**: topic 20's own content. *Where you meet it:* background — the
  failure domains topic 20 built (process/host/rack/AZ/region) are the same physical layer a shard
  and its replicas sit on.
- **Replication lag and session guarantees**: topic 19's own content. *Where you meet it:*
  background — a resharded shard's own new replica has to catch up the identical way a replication
  topic 19 measured, before it can safely take write traffic.
