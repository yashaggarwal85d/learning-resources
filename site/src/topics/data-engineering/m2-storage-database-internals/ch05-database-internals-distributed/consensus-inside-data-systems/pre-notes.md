- **Two-phase commit in production databases**: this chapter's own earlier content (§5.2).
  *Where you meet it:* directly — the cross-range commit's extra round trips in this topic are
  exactly a two-phase commit layered on top of each range's own consensus.
- **CAP and PACELC in practice**: topic 20's own content. *Where you meet it:* background — the
  failure domains topic 20 built are the same layer a consensus group's own members sit across.
- **Shard keys, hot shards and resharding**: topic 22's own content. *Where you meet it:*
  background — this topic's per-range consensus groups are the same ranges topic 22's resharding
  split and moved; both assume the same partitioning substrate from topic 21.
- **Partitioning schemes: range, hash, consistent hashing**: topic 21's own content. *Where you
  meet it:* background — "per-range" consensus means one group per partition from topic 21's own
  partitioning scheme, not a new way of dividing the keyspace.
